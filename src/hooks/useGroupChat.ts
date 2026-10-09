import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CHAT_LIMITS_DEFAULT,
  CHAT_MESSAGE_EVENT,
  DEFAULT_CHAT_ROOM,
  fetchChatHistory,
  sendChatMessage,
  type ChatLimits,
  type ChatMessage,
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
  send: (body: string) => Promise<boolean>;
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
const merge = (current: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] => {
  const byId = new Map(current.map((m) => [m.id, m]));
  let changed = false;

  for (const message of incoming) {
    if (byId.has(message.id)) continue;
    byId.set(message.id, message);
    changed = true;
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

export const useGroupChat = (room: string = DEFAULT_CHAT_ROOM): GroupChat => {
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
          setMessages((current) => merge(current, history.messages));
          setError(null);
        })
        .catch((err: { message?: string }) => {
          if (cancelled) return;
          // The live socket may well still be fine, so this is reported
          // without clearing what has already arrived through it.
          setError(err?.message || 'Could not load the chat history');
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
        if (!cancelled) setMessages((current) => merge(current, [message]));
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
    async (body: string): Promise<boolean> => {
      const trimmed = body.trim();
      if (trimmed.length === 0 || sending) return false;

      setSending(true);
      setError(null);

      try {
        const message = await sendChatMessage(trimmed, room);

        if (message) {
          // Shown at once rather than waiting for the socket to bring it
          // back, so the composer clears the instant the message is real.
          // The socket copy arrives moments later and `merge` drops it.
          setMessages((current) => merge(current, [message]));
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

        setError(failure?.message || 'Could not send your message');
        return false;
      } finally {
        setSending(false);
      }
    },
    [room, sending, limits.slow_mode_ms, startCooldown]
  );

  return { messages, loading, error, connection, limits, sending, cooldownMs, send };
};
