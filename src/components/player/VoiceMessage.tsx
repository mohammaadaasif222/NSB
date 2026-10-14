import { useEffect, useRef, useState, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { PauseIcon, PlayIcon } from '@/components/icons';
import type { VoiceClip } from '@/services/chat';

const BARS = [8, 14, 10, 18, 12, 20, 9, 16, 11, 19, 13, 17, 10, 15, 8, 12, 16, 9, 14, 11];

const clock = (ms: number): string => {
  const total = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

const VoiceMessage: FC<{ clip: VoiceClip; mine: boolean }> = ({ clip, mine }) => {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const onTime = (): void => setElapsedMs(audio.currentTime * 1000);
    const onEnd = (): void => {
      setPlaying(false);
      setElapsedMs(0);
    };
    const onPause = (): void => setPlaying(false);
    const onPlay = (): void => setPlaying(true);

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('play', onPlay);

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnd);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('play', onPlay);
    };
  }, []);

  const toggle = (): void => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) void audio.play().catch(() => setPlaying(false));
    else audio.pause();
  };

  const progress = clip.duration_ms > 0 ? Math.min(1, elapsedMs / clip.duration_ms) : 0;
  const played = Math.round(progress * BARS.length);

  return (
    <div
      className={`flex items-center gap-2.5 rounded-2xl px-3 py-2 ${
        mine ? 'bg-[#2b3141]' : 'bg-slate-800/70'
      }`}
    >
      <audio ref={audioRef} src={clip.url} preload="none" />

      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? t('chat.voicePause') : t('chat.voicePlay')}
        title={playing ? t('chat.voicePause') : t('chat.voicePlay')}
        className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#4a9eff] text-white transition-colors hover:bg-[#3b8de8]"
      >
        {playing ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
      </button>

      <div className="flex h-6 flex-1 items-center gap-[2px]" aria-hidden="true">
        {BARS.map((height, index) => (
          <span
            key={index}
            style={{ height: `${height}px` }}
            className={`w-[3px] flex-1 rounded-full transition-colors ${
              index < played ? 'bg-[#4a9eff]' : 'bg-slate-600'
            }`}
          />
        ))}
      </div>

      <span className="flex-shrink-0 tabular-nums text-[10px] text-slate-400">
        {clock(playing || elapsedMs > 0 ? clip.duration_ms - elapsedMs : clip.duration_ms)}
      </span>
    </div>
  );
};

export default VoiceMessage;
