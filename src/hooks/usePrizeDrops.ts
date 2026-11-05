import { useSyncExternalStore } from 'react';

import { fetchPrizeDrops, type PrizeDrop } from '@/services/prizeDrops';

/** The backend reads the providers' feeds every few minutes; campaigns run for days. */
const REFRESH_MS = 5 * 60_000;
/** A remount soon after the last fetch (a route change) reuses it rather than fetching again. */
const FRESH_MS = 60_000;

export interface PrizeDropsState {
  drops: PrizeDrop[];
  /** The first fetch has answered (successfully or not). */
  loaded: boolean;
}

const EMPTY: PrizeDropsState = { drops: [], loaded: false };

/*
 * One store for the whole page, as useJackpots: the lobby row and the Drops &
 * Wins page read the same request, refreshed while anything is mounted and
 * the tab is visible. A failed refresh keeps what was last shown.
 */
let state = EMPTY;
let lastFetch = 0;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

const refresh = async (): Promise<void> => {
  lastFetch = Date.now();
  const drops = await fetchPrizeDrops();
  state = { drops: drops ?? state.drops, loaded: true };
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

/** The Drops & Wins campaigns running now. Empty on the server and until the first fetch lands. */
export const usePrizeDrops = (): PrizeDropsState =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => EMPTY
  );
