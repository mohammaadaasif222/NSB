import { useSyncExternalStore } from 'react';

import {
  fetchJackpots,
  fetchJackpotWinners,
  type Jackpot,
  type JackpotWinner,
} from '@/services/jackpots';

/** The backend reads the providers' feeds once a minute; polling faster shows nothing new. */
const REFRESH_MS = 60_000;
/** A remount soon after the last fetch (a route change) reuses it rather than fetching again. */
const FRESH_MS = 20_000;

export interface JackpotsState {
  jackpots: Jackpot[];
  winners: JackpotWinner[];
  /** Ids of our games in a winnable jackpot — what the tiles badge. */
  gameIds: ReadonlySet<string>;
  /** The first fetch has answered (successfully or not). */
  loaded: boolean;
}

const EMPTY: JackpotsState = { jackpots: [], winners: [], gameIds: new Set(), loaded: false };

/*
 * One store for the whole page: the lobby widget and every game tile read
 * the same two requests, refreshed once a minute while anything is mounted
 * and the tab is visible. A failed refresh keeps what was last shown.
 */
let state = EMPTY;
let lastFetch = 0;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

const refresh = async (): Promise<void> => {
  lastFetch = Date.now();
  const [jackpots, winners] = await Promise.all([fetchJackpots(), fetchJackpotWinners()]);
  const nextJackpots = jackpots ?? state.jackpots;
  state = {
    jackpots: nextJackpots,
    winners: winners ?? state.winners,
    gameIds: new Set(
      nextJackpots.filter((j) => j.status === 'ACTIVE').flatMap((j) => j.games.map((g) => g.id))
    ),
    loaded: true,
  };
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  if (listeners.size === 1) {
    if (Date.now() - lastFetch > FRESH_MS) void refresh();
    timer = setInterval(() => {
      if (document.visibilityState !== 'hidden') void refresh();
    }, REFRESH_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
};

/** Jackpots and recent jackpot winners. Empty on the server and until the first fetch lands. */
export const useJackpots = (): JackpotsState =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => EMPTY
  );
