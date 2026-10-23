import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/context/I18nContext';
import {
  CHAT_LIMITS_DEFAULT,
  CHAT_MESSAGE_EVENT,
  CHAT_DELETE_EVENT,
  CHAT_REACTION_EVENT,
  DEFAULT_CHAT_ROOM,
  NO_REACTIONS,
  deleteChatMessage,
  fetchChatHistory,
  reportChatMessage,
  sendChatMessage,
  sendVoiceMessage,
  setChatReaction,
  type ChatDeletion,
  type ChatLimits,
  type ChatMessage,
  type ChatRoom,
  type ReactionKind,
  type ReactionSummary,
  type ReactionUpdate,
  type ReplyRef,
} from '@/services/chat';
import { realtimeService, type ConnectionState } from '@/services/realtimeService';

/**
 * A chat room: its scrollback, its live messages, and sending to it.
 *
 * Scoped to the component that calls it, which the header ties to the panel
 * being open: the popover renders its children only while open, so closing
 * the tray unmounts the panel and drops the subscription. A room nobody is
 * looking at would otherwise cost a subscription and a fetch per page view,
 * and there is no unread badge to feed — if one is ever added, this moves up
 * to a provider that stays mounted and the panel reads from it. The hook does
 * not change shape for that.
 *
 * Two things it exists to get right:
 *
 * 1. **Nothing is lost at the seam.** It subscribes BEFORE fetching the
 *    scrollback, so a message posted while the fetch is in flight arrives on
 *    the socket rather than falling into the gap between the two. The cost is
 *    that such a message appears in both, which is why every message is keyed
 *    on `id` and a repeat is dropped.
 *
 * 2. **A reconnect refetches.** Soketi has no replay: anything published
 *    while the socket was away is gone for good (soketi/README.md). So the
 *    scrollback is pulled again on every resubscription, not just the first.
 */

/** Oldest-first, and bounded — see the trim in `merge`. */
const MAX_RENDERED = 200;

/**
 * How long to wait for the subscription before fetching the scrollback
 * anyway.
 *
 * Long enough that a working socket always wins the race (a subscription is
 * one round trip plus the auth call, tens of milliseconds on a normal
 * connection), short enough that somebody behind a proxy that blocks
 * WebSockets is not left staring at a spinner.
 */
const SOCKET_GRACE_MS = 2500;

interface GroupChat {
  messages: ChatMessage[];
  /** True until the first scrollback has either arrived or failed. */
  loading: boolean;
  /** A problem worth showing in the panel, or null. */
  error: string | null;
  connection: ConnectionState;
  /** The room's rules, server-stated once history has answered. */
  limits: ChatLimits;
  /** True while a send is in flight. */
  sending: boolean;
  /** ms until this account may post again, or 0. Counts down. */
  cooldownMs: number;
  /** Returns true when the message was accepted. */
  send: (body: string, replyTo?: string | null, quote?: ReplyRef | null) => Promise<boolean>;
  /**
   * React to somebody else's message. Pass the reaction the player CLICKED —
   * sending the one already held clears it, and the server decides that.
   */
  react: (messageId: string, reaction: ReactionKind) => Promise<void>;
  sendVoice: (
    clip: Blob,
    durationMs: number,
    replyTo?: string | null,
    quote?: ReplyRef | null
  ) => Promise<boolean>;
  remove: (messageId: string) => Promise<boolean>;
  report: (messageId: string, reason: string) => Promise<void>;
}

/**
 * Add messages to a list, dropping repeats and keeping it ordered and
 * bounded.
 *
 * Sorted by timestamp rather than trusting arrival order: the scrollback and
 * the socket are two sources, and a reconnect can deliver an older message
 * after a newer one. Ties fall back to `id` so the order is at least stable
 * between renders — two messages inside the same millisecond are a coin toss
 * either way, but a list that reshuffles itself on every render is a bug
 * people see.
 */
/**
 * Whether two reaction summaries are identical.
 *
 * Compared field by field rather than by reference, because every history
 * fetch builds new objects — without this, the deliberate overlap between the
 * snapshot and the socket would re-render the whole room on each refetch even
 * when not a single count had moved.
 */
const sameReactions = (a?: ReactionSummary, b?: ReactionSummary): boolean =>
  a?.up === b?.up && a?.down === b?.down && a?.mine === b?.mine;

const merge = (
  current: ChatMessage[],
  incoming: ChatMessage[],
  deleted?: ReadonlySet<string>
): ChatMessage[] => {
  const byId = new Map(current.map((m) => [m.id, m]));
  let changed = false;

  for (const message of incoming) {
    if (deleted?.has(message.id)) continue;

    const existing = byId.get(message.id);

    if (!existing) {
      byId.set(message.id, message);
      changed = true;
      continue;
    }

    // A message we already have, but the copy may be fresher. The BODY never
    // changes — a line is immutable once sent — but its reaction counts do,
    // and a reconnect refetch is the only way to learn about the ones that
    // moved while the socket was away. Skipping the duplicate outright would
    // throw exactly the state the refetch exists to recover.
    //
    // Guarded on the incoming copy HAVING reactions: a message arriving live
    // carries none, and must not blank out counts already on screen.
    if (message.reactions && !sameReactions(existing.reactions, message.reactions)) {
      byId.set(message.id, { ...existing, reactions: message.reactions });
      changed = true;
    }
  }

  // Returning the SAME array when nothing is new matters: this runs inside a
  // state updater, and a fresh array would re-render every subscriber on
  // every duplicate — which, with the deliberate history/socket overlap
  // above, is a normal event rather than a rare one.
  if (!changed) return current;

  const sorted = [...byId.values()].sort((a, b) => {
    const delta = Date.parse(a.at) - Date.parse(b.at);
    return delta !== 0 ? delta : a.id.localeCompare(b.id);
  });

  return sorted.length > MAX_RENDERED ? sorted.slice(-MAX_RENDERED) : sorted;
};

/**
 * Apply broadcast counts to one message, keeping this viewer's own state.
 *
 * The event says how many thumbs there are, not who clicked — so `mine` is
 * carried over rather than taken from the payload. Overwriting it would make
 * your own button go dark the instant anybody else reacted to the same line.
 */
const applyReaction = (current: ChatMessage[], update: ReactionUpdate): ChatMessage[] => {
  const index = current.findIndex((message) => message.id === update.message_id);

  // A reaction to something not on screen — scrolled past the render cap, or
  // arriving before the history fetch lands. The next fetch carries the
  // counts, so there is nothing to do and nothing to re-render.
  if (index === -1) return current;

  const message = current[index];
  const next = [...current];

  next[index] = {
    ...message,
    reactions: {
      up: update.up,
      down: update.down,
      mine: message.reactions?.mine ?? null,
    },
  };

  return next;
};

const withQuote = (
  current: ChatMessage[],
  messageId: string,
  quote: ReplyRef | null
): ChatMessage[] => {
  if (!quote) return current;
  const index = current.findIndex((message) => message.id === messageId);
  if (index === -1 || current[index].reply_to) return current;

  const next = [...current];
  next[index] = { ...next[index], reply_to: quote };
  return next;
};

const without = (current: ChatMessage[], messageId: string): ChatMessage[] => {
  const next = current.filter((message) => message.id !== messageId);
  return next.length === current.length ? current : next;
};

/** Replace one message's whole reaction summary — the answer to our own POST. */
const setReaction = (
  current: ChatMessage[],
  messageId: string,
  reactions: ReactionSummary
): ChatMessage[] => {
  const index = current.findIndex((message) => message.id === messageId);
  if (index === -1) return current;

  const next = [...current];
  next[index] = { ...next[index], reactions };
  return next;
};

/**
 * What the counts become if this click is accepted.
 *
 * Mirrors the server's toggle rules so the button responds on the same frame
 * it is pressed, rather than after a round trip. The server's answer replaces
 * this the moment it lands, and a refusal puts the old summary back — so a
 * drift here is visible for one network round trip at most, never stored.
 */
const predict = (held: ReactionSummary, clicked: ReactionKind): ReactionSummary => {
  const next: ReactionSummary = { ...held };

  // Clicking what you already hold takes it back.
  if (held.mine === clicked) {
    next[clicked] = Math.max(0, held[clicked] - 1);
    next.mine = null;
    return next;
  }

  // Switching sides moves the one vote across rather than adding a second.
  if (held.mine) next[held.mine] = Math.max(0, held[held.mine] - 1);

  // Past the early return, `held.mine` is null or the other kind, so this
  // is always an addition of one.
  next[clicked] = held[clicked] + 1;
  next.mine = clicked;
  return next;
};

export const useGroupChat = (room: ChatRoom = DEFAULT_CHAT_ROOM): GroupChat => {
  const { t } = useTranslation();
  const tRef = useRef(t);
  tRef.current = t;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connection, setConnection] = useState<ConnectionState>(
    realtimeService.getConnectionState()
  );
  const [limits, setLimits] = useState<ChatLimits>(CHAT_LIMITS_DEFAULT);
  const [sending, setSending] = useState(false);
  const [cooldownMs, setCooldownMs] = useState(0);

  /**
   * The channel to subscribe to, which the API names in the history response.
   * Derived here only as the opening guess so the subscription can go up
   * before the fetch — the response is authoritative and replaces it.
   */
  const [channelName, setChannelName] = useState(`private-chat.${room}`);

  const deletedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    deletedRef.current = new Set();
    setChannelName(`private-chat.${room}`);
    setMessages([]);
    setLoading(true);
    setError(null);
  }, [room]);

  /**
   * When this account may post again, as an epoch ms, or 0.
   *
   * The countdown effect keys off THIS rather than off `cooldownMs`: keying
   * off the remaining time would tear the interval down and build a new one
   * on every tick, because the thing it sets is the thing it depends on.
   */
  const [cooldownUntil, setCooldownUntil] = useState(0);

  /**
   * Scrollback fetches are coalesced, not dropped.
   *
   * Two things ask for one — the subscription opening and the fallback timer
   * below — and on a slow connection the second can be asked for while the
   * first is still in flight. Dropping it would be wrong: a request made
   * AFTER a resubscription is exactly the one that recovers what the socket
   * missed. So an overlapping request is remembered and re-run once, which
   * collapses a burst into at most one extra fetch.
   */
  const loadingRef = useRef(false);
  const pendingRef = useRef(false);

  /**
   * The current messages, for `react` to read without depending on them.
   *
   * Written during render, the way ui/Modal mirrors its onClose. Depending on
   * `messages` instead would rebuild `react` on every line that arrives, and
   * that function is handed to every row in the list.
   */
  const messagesRef = useRef<ChatMessage[]>(messages);
  messagesRef.current = messages;

  /* --- socket state ------------------------------------------------------ */
  useEffect(() => realtimeService.onConnectionState(setConnection), []);

  /* --- subscribe, then load the scrollback ------------------------------ */
  useEffect(() => {
    let cancelled = false;

    const load = (): void => {
      if (loadingRef.current) {
        pendingRef.current = true;
        return;
      }
      loadingRef.current = true;

      void fetchChatHistory(room)
        .then((history) => {
          if (cancelled || !history) return;
          // Normally the same string the guess above produced, so this is a
          // no-op. If the API ever renames the scheme, it differs once: the
          // effect re-runs, leaves the guessed channel, joins the real one
          // and settles there. One extra round trip at a rename, and no
          // release where the client is subscribed to a channel nobody
          // publishes to.
          setChannelName(history.channel);
          setLimits(history.limits);
          setMessages((current) => merge(current, history.messages, deletedRef.current));
          setError(null);
        })
        .catch((err: { message?: string }) => {
          if (cancelled) return;
          // The live socket may well still be fine, so this is reported
          // without clearing what has already arrived through it.
          setError(err?.message || tRef.current('chat.loadFailed'));
        })
        .finally(() => {
          loadingRef.current = false;
          if (cancelled) return;

          setLoading(false);

          if (pendingRef.current) {
            pendingRef.current = false;
            load();
          }
        });
    };

    // The live feed goes up before anything is fetched, so a message posted
    // during the fetch arrives here rather than falling into the gap between
    // the snapshot and the subscription.
    const stopEvent = realtimeService.onChannelEvent(
      channelName,
      CHAT_MESSAGE_EVENT,
      (message: ChatMessage) => {
        if (!cancelled) setMessages((current) => merge(current, [message], deletedRef.current));
      }
    );

    const stopDelete = realtimeService.onChannelEvent(
      channelName,
      CHAT_DELETE_EVENT,
      (deletion: ChatDeletion) => {
        if (cancelled || !deletion?.message_id) return;
        deletedRef.current.add(deletion.message_id);
        setMessages((current) => without(current, deletion.message_id));
      }
    );

    // Somebody reacted. The payload carries the absolute counts, never a
    // delta, so applying it twice is harmless — and it deliberately omits
    // `mine`, which is why the merge below preserves whatever this viewer had.
    const stopReaction = realtimeService.onChannelEvent(
      channelName,
      CHAT_REACTION_EVENT,
      (update: ReactionUpdate) => {
        if (cancelled) return;
        setMessages((current) => applyReaction(current, update));
      }
    );

    // THE load. It runs once the subscription is open — first time and after
    // every reconnect, which is the only way to recover what soketi dropped
    // while the socket was away.
    const stopReady = realtimeService.onChannelReady(channelName, load);

    // ...and a floor under it. If the socket never opens, onChannelReady
    // never fires and the panel would sit on a spinner for ever. The
    // scrollback is plain HTTP and does not need the socket, so after a short
    // wait it is fetched anyway: a player on a blocked WebSocket then reads
    // the room and sends to it, with the "reconnecting" note explaining why
    // new messages are not appearing on their own.
    const fallback = setTimeout(() => {
      if (!cancelled && !realtimeService.isChannelSubscribed(channelName)) load();
    }, SOCKET_GRACE_MS);

    return () => {
      cancelled = true;
      clearTimeout(fallback);
      stopReady();
      stopEvent();
      stopReaction();
      stopDelete();
      realtimeService.leaveChannel(channelName);
    };
  }, [room, channelName]);

  /* --- slow-mode countdown ---------------------------------------------- */
  useEffect(() => {
    if (cooldownUntil === 0) return;

    const tick = (): void => {
      const remaining = Math.max(0, cooldownUntil - Date.now());
      setCooldownMs(remaining);
      // Clears the deadline as well as the figure, so the interval stops
      // instead of ticking zero at the panel ten times a second.
      if (remaining === 0) setCooldownUntil(0);
    };

    tick();
    const timer = setInterval(tick, 100);
    return () => clearInterval(timer);
  }, [cooldownUntil]);

  const startCooldown = useCallback((ms: number): void => {
    setCooldownUntil(Date.now() + ms);
    setCooldownMs(ms);
  }, []);

  /* --- sending ----------------------------------------------------------- */
  const send = useCallback(
    async (
      body: string,
      replyTo: string | null = null,
      quote: ReplyRef | null = null
    ): Promise<boolean> => {
      const trimmed = body.trim();
      if (trimmed.length === 0 || sending) return false;

      setSending(true);
      setError(null);

      try {
        const message = await sendChatMessage(trimmed, room, replyTo);

        if (message) {
          // Shown at once rather than waiting for the socket to bring it
          // back, so the composer clears the instant the message is real.
          // The socket copy arrives moments later and `merge` drops it.
          setMessages((current) => withQuote(merge(current, [message]), message.id, quote));
        }

        // The server's own floor is authoritative; this mirrors it so the
        // composer does not invite a message it already knows will be
        // refused.
        startCooldown(limits.slow_mode_ms);
        return true;
      } catch (err) {
        const failure = err as { message?: string; status?: number; retry_after_ms?: number };

        if (failure?.status === 429) {
          // The API says exactly how long is left; trust that over the local
          // guess, which can be behind after a tab has been asleep.
          startCooldown(failure.retry_after_ms ?? limits.slow_mode_ms);
        }

        setError(failure?.message || tRef.current('chat.sendFailed'));
        return false;
      } finally {
        setSending(false);
      }
    },
    [room, sending, limits.slow_mode_ms, startCooldown]
  );

  /**
   * React, optimistically.
   *
   * The count moves on the click and is corrected by the server's answer. A
   * refusal — your own message, a line that has scrolled out of the room —
   * restores exactly what was there before rather than guessing the inverse,
   * which would be wrong if two clicks were in flight.
   */
  const react = useCallback(
    async (messageId: string, reaction: ReactionKind): Promise<void> => {
      const held =
        messagesRef.current.find((message) => message.id === messageId)?.reactions ?? NO_REACTIONS;

      setMessages((current) => setReaction(current, messageId, predict(held, reaction)));

      try {
        const summary = await setChatReaction(messageId, reaction, room);
        if (summary) {
          setMessages((current) => setReaction(current, messageId, summary));
        }
      } catch (err) {
        setMessages((current) => setReaction(current, messageId, held));
        const failure = err as { message?: string };
        setError(failure?.message || tRef.current('chat.reactFailed'));
      }
    },
    [room]
  );

  const sendVoice = useCallback(
    async (
      clip: Blob,
      durationMs: number,
      replyTo: string | null = null,
      quote: ReplyRef | null = null
    ): Promise<boolean> => {
      if (sending) return false;

      setSending(true);
      setError(null);

      try {
        const message = await sendVoiceMessage(clip, durationMs, room, replyTo);
        if (message) {
          setMessages((current) => withQuote(merge(current, [message]), message.id, quote));
        }
        startCooldown(limits.slow_mode_ms);
        return true;
      } catch (err) {
        const failure = err as { message?: string; status?: number; retry_after_ms?: number };

        if (failure?.status === 429) {
          startCooldown(failure.retry_after_ms ?? limits.slow_mode_ms);
        }

        setError(failure?.message || 'Could not send your voice message');
        return false;
      } finally {
        setSending(false);
      }
    },
    [room, sending, limits.slow_mode_ms, startCooldown]
  );

  const remove = useCallback(
    async (messageId: string): Promise<boolean> => {
      const target = messagesRef.current.find((message) => message.id === messageId);
      if (!target) return false;

      deletedRef.current.add(messageId);
      setMessages((current) => without(current, messageId));
      setError(null);

      try {
        const ok = await deleteChatMessage(messageId, room);
        if (!ok) throw new Error(tRef.current('chat.deleteFailed'));
        return true;
      } catch (err) {
        const failure = err as { message?: string; status?: number };

        if (failure?.status === 404) return true;

        deletedRef.current.delete(messageId);
        setMessages((current) => merge(current, [target], deletedRef.current));
        setError(failure?.message || tRef.current('chat.deleteFailed'));
        return false;
      }
    },
    [room]
  );

  const report = useCallback(
    async (messageId: string, reason: string): Promise<void> => {
      const ok = await reportChatMessage(messageId, reason, room);
      if (!ok) throw new Error(tRef.current('chat.reportFailed'));
    },
    [room]
  );

  return {
    messages,
    loading,
    error,
    connection,
    limits,
    sending,
    cooldownMs,
    send,
    react,
    sendVoice,
    remove,
    report,
  };
};
