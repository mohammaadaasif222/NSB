import { useCallback, useEffect, useRef, useState } from 'react';
import { MAX_VOICE_MS, MIN_VOICE_MS } from '@/services/chat';

export type RecorderState = 'idle' | 'requesting' | 'recording' | 'denied' | 'unsupported';

interface VoiceRecorder {
  state: RecorderState;
  elapsedMs: number;
  supported: boolean;
  start: () => Promise<void>;
  stop: () => Promise<{ clip: Blob; durationMs: number } | null>;
  cancel: () => void;
}

const MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4',
];

const pickMimeType = (): string | undefined => {
  if (typeof MediaRecorder === 'undefined') return undefined;
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type));
};

export const useVoiceRecorder = (): VoiceRecorder => {
  const [state, setState] = useState<RecorderState>('idle');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [supported, setSupported] = useState(true);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef(0);

  useEffect(() => {
    const ok =
      typeof window !== 'undefined' &&
      typeof MediaRecorder !== 'undefined' &&
      Boolean(navigator.mediaDevices?.getUserMedia);

    setSupported(ok);
    if (!ok) setState('unsupported');
  }, []);

  const release = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
    chunksRef.current = [];
  }, []);

  useEffect(() => release, [release]);

  useEffect(() => {
    if (state !== 'recording') return undefined;

    const tick = (): void => setElapsedMs(Date.now() - startedAtRef.current);
    tick();
    const timer = setInterval(tick, 100);
    return () => clearInterval(timer);
  }, [state]);

  const start = useCallback(async (): Promise<void> => {
    if (!supported || state === 'recording') return;

    setState('requesting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      streamRef.current = stream;
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      recorder.start();
      setElapsedMs(0);
      setState('recording');
    } catch {
      release();
      setState('denied');
    }
  }, [supported, state, release]);

  const stop = useCallback(async (): Promise<{ clip: Blob; durationMs: number } | null> => {
    const recorder = recorderRef.current;

    if (!recorder || recorder.state === 'inactive') {
      release();
      setState('idle');
      return null;
    }

    const durationMs = Date.now() - startedAtRef.current;

    const clip = await new Promise<Blob>((resolve) => {
      recorder.onstop = () =>
        resolve(new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' }));
      recorder.stop();
    });

    release();
    setState('idle');
    setElapsedMs(0);

    if (durationMs < MIN_VOICE_MS || clip.size === 0) return null;

    return { clip, durationMs: Math.min(durationMs, MAX_VOICE_MS) };
  }, [release]);

  const cancel = useCallback((): void => {
    const recorder = recorderRef.current;

    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null;
      recorder.stop();
    }

    release();
    setElapsedMs(0);
    setState('idle');
  }, [release]);

  return { state, elapsedMs, supported, start, stop, cancel };
};
