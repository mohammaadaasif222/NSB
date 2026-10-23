import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AMBIENT_ROOMS,
  VOICE_CLIPS,
  ambientMessages,
  onlineCount,
  voiceClipUrl,
} from '@/services/chatAmbience';
import type { ChatMessage, ReactionKind, ReactionSummary } from '@/services/chat';

const WINDOW_MS = 3 * 60_000;
const MAX_SHOWN = 50;
const TICK_MS = 1_000;

interface ChatAmbience {
  messages: ChatMessage[];
  online: number | null;
  isAmbient: (messageId: string) => boolean;
  react: (messageId: string, reaction: ReactionKind) => void;
}

const toggle = (held: ReactionSummary, clicked: ReactionKind): ReactionSummary => {
  const next: ReactionSummary = { ...held };

  if (held.mine === clicked) {
    next[clicked] = Math.max(0, held[clicked] - 1);
    next.mine = null;
    return next;
  }

  if (held.mine) next[held.mine] = Math.max(0, held[held.mine] - 1);
  next[clicked] = held[clicked] + 1;
  next.mine = clicked;
  return next;
};

export const useChatAmbience = (room: string, enabled: boolean): ChatAmbience => {
  const active = enabled && AMBIENT_ROOMS.includes(room);
  const [now, setNow] = useState(() => Date.now());
  const [overrides, setOverrides] = useState<Record<string, ReactionSummary>>({});
  const [durations, setDurations] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!enabled || VOICE_CLIPS.length === 0) return undefined;

    let cancelled = false;
    const probes = VOICE_CLIPS.map((file) => {
      const probe = new Audio();
      probe.preload = 'metadata';
      probe.onloadedmetadata = () => {
        if (cancelled || !Number.isFinite(probe.duration) || probe.duration <= 0) return;
        const ms = Math.round(probe.duration * 1000);
        setDurations((current) => (current[file] === ms ? current : { ...current, [file]: ms }));
      };
      probe.src = voiceClipUrl(file);
      return probe;
    });

    return () => {
      cancelled = true;
      for (const probe of probes) {
        probe.onloadedmetadata = null;
        probe.removeAttribute('src');
        probe.load();
      }
    };
  }, [enabled]);

  useEffect(() => {
    setOverrides({});
  }, [room]);

  useEffect(() => {
    if (!enabled) return undefined;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, [room, enabled]);

  const generated = useMemo(
    () => (active ? ambientMessages(room, now, WINDOW_MS, durations).slice(-MAX_SHOWN) : []),
    [active, room, now, durations]
  );

  const lastId = generated[generated.length - 1]?.id ?? '';
  const firstId = generated[0]?.id ?? '';

  const stable = useMemo(
    () => generated,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lastId, firstId, generated.length]
  );

  const messages = useMemo(
    () =>
      stable.map((message) =>
        overrides[message.id] ? { ...message, reactions: overrides[message.id] } : message
      ),
    [stable, overrides]
  );

  const ids = useMemo(() => new Set(stable.map((message) => message.id)), [stable]);

  const isAmbient = useCallback((messageId: string) => ids.has(messageId), [ids]);

  const react = useCallback(
    (messageId: string, reaction: ReactionKind): void => {
      const message = stable.find((entry) => entry.id === messageId);
      if (!message) return;

      setOverrides((current) => ({
        ...current,
        [messageId]: toggle(
          current[messageId] ?? message.reactions ?? { up: 0, down: 0, mine: null },
          reaction
        ),
      }));
    },
    [stable]
  );

  const online = useMemo(() => (enabled ? onlineCount(room, now) : null), [enabled, room, now]);

  return { messages, online, isAmbient, react };
};
