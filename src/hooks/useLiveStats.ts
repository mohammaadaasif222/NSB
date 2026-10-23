import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchLiveStats } from '@/services/games';
import { BALANCE_REFRESH_EVENT } from '@/utils/balanceEvents';
import type { LiveStats } from '@/types';

/** How often an open panel re-reads the stats. */
const POLL_MS = 10_000;
/** A round's end and the balance poll can land together; one read covers both. */
const MIN_GAP_MS = 2_500;
/** Where the window's start is kept: per tab, across games and reloads. */
const SINCE_KEY = 'rolluck:live-stats:since';
const SCOPE_KEY = 'rolluck:live-stats:scope';

export type LiveStatsScope = 'game' | 'all';

export type LiveStatsState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; stats: LiveStats }
  | { status: 'failed' };

const read = (key: string): string | null => {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string): void => {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Storage blocked: the window still works, it just restarts on reload.
  }
};

/**
 * The play page's Live Stats: the player's real-money results since they last
 * reset the panel, as Rainbet-style session stats.
 *
 * The start of the window lives in sessionStorage, so it survives a reload or
 * a move to another game in the same tab ("All games" then adds them up), and
 * a new tab starts clean. It is set the first time a tab opens the panel.
 *
 * Reads only while `enabled` — the panel open, real money, signed in — and
 * then on a timer and whenever the page announces a balance change (a round
 * ending), which is the moment the numbers move.
 */
export const useLiveStats = (enabled: boolean, gameSlug: string) => {
  const [since, setSince] = useState<string | null>(null);
  const [scope, setScopeState] = useState<LiveStatsScope>('game');
  const [state, setState] = useState<LiveStatsState>({ status: 'idle' });
  const lastRead = useRef(0);
  const inFlight = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled || since) {
      return;
    }
    const stored = read(SINCE_KEY);
    const start = stored && !Number.isNaN(Date.parse(stored)) ? stored : new Date().toISOString();
    write(SINCE_KEY, start);
    setSince(start);
    setScopeState(read(SCOPE_KEY) === 'all' ? 'all' : 'game');
  }, [enabled, since]);

  const load = useCallback(
    (force: boolean): void => {
      if (!since) {
        return;
      }
      const now = Date.now();
      if (!force && now - lastRead.current < MIN_GAP_MS) {
        return;
      }
      lastRead.current = now;
      inFlight.current?.abort();
      const controller = new AbortController();
      inFlight.current = controller;

      fetchLiveStats(since, scope === 'game' ? gameSlug : null, controller.signal)
        .then((stats) => {
          if (!controller.signal.aborted) setState({ status: 'ready', stats });
        })
        .catch(() => {
          // A failed refresh keeps the numbers already on screen.
          if (!controller.signal.aborted) {
            setState((prev) => (prev.status === 'ready' ? prev : { status: 'failed' }));
          }
        });
    },
    [since, scope, gameSlug]
  );

  useEffect(() => {
    if (!enabled || !since) {
      return;
    }
    setState((prev) => (prev.status === 'ready' ? prev : { status: 'loading' }));
    load(true);
    const id = window.setInterval(() => load(false), POLL_MS);
    const onBalance = (): void => load(false);
    window.addEventListener(BALANCE_REFRESH_EVENT, onBalance);
    return () => {
      window.clearInterval(id);
      window.removeEventListener(BALANCE_REFRESH_EVENT, onBalance);
      inFlight.current?.abort();
    };
  }, [enabled, since, load]);

  /** Starts the window again from now. */
  const reset = useCallback((): void => {
    const start = new Date().toISOString();
    write(SINCE_KEY, start);
    setState({ status: 'loading' });
    setSince(start);
  }, []);

  const setScope = useCallback((next: LiveStatsScope): void => {
    write(SCOPE_KEY, next);
    setState({ status: 'loading' });
    setScopeState(next);
  }, []);

  return { state, scope, setScope, reset, retry: () => load(true) };
};
