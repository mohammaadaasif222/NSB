import apiService from '@/services/api';
import type { ApiError, Game, GameDevice, GameLaunch, GameMode } from '@/types';

/**
 * Open a game. REAL needs the player's token (attached by apiService); DEMO
 * works signed out.
 *
 * Rejects with an ApiError whose `status` tells the failures apart:
 *   401 sign in first · 403 account may not play · 404 no such game ·
 *   409 not available right now · 422 no demo mode · 503 launch not configured
 */
export async function launchGame(
  slug: string,
  mode: GameMode,
  locale: string,
  device: GameDevice
): Promise<GameLaunch> {
  const res = await apiService.post<GameLaunch>(`/games/${encodeURIComponent(slug)}/launch`, {
    mode,
    device,
    locale,
  });

  if (!res?.success || !res.data?.url) {
    throw { message: res?.message || 'Game launch failed' } satisfies ApiError;
  }
  return res.data;
}

/**
 * The device version to ask for. Viewport and pointer rather than the
 * User-Agent: a narrow touch layout wants the mobile build whatever the
 * browser claims to be.
 */
export const currentGameDevice = (): GameDevice =>
  window.matchMedia('(max-width: 767px), (pointer: coarse)').matches ? 'MOBILE' : 'DESKTOP';

/* ------------------------------------------------------------------ */
/* The player's own games — both need the player's token               */
/* ------------------------------------------------------------------ */

const listOrThrow = async (url: string): Promise<Game[]> => {
  const res = await apiService.get<Game[]>(url);
  if (!res?.success || !Array.isArray(res.data)) {
    throw { message: res?.message || 'Could not load games' } satisfies ApiError;
  }
  return res.data;
};

/** The player's favourite games, newest-hearted first. */
export const fetchFavourites = (): Promise<Game[]> => listOrThrow('/games/favourites');

/** The games the player launched most recently, newest first. */
export const fetchRecentGames = (): Promise<Game[]> => listOrThrow('/games/recent');

/** Hearts or unhearts a game. Idempotent either way. */
export async function setFavourite(slug: string, favourite: boolean): Promise<void> {
  const url = `/games/${encodeURIComponent(slug)}/favourite`;
  const res = favourite ? await apiService.put(url) : await apiService.delete(url);
  if (!res?.success) {
    throw { message: res?.message || 'Could not update favourites' } satisfies ApiError;
  }
}
