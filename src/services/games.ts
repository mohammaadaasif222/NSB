import apiService from '@/services/api';
import { translate } from '@/i18n/translate';
import type { TranslationKey } from '@/i18n/locales';
import type { ShelfListQuery } from '@/constants/games';
import type { SortKey } from '@/components/player/BrowseControls';
import type {
  ApiError,
  Game,
  GameDevice,
  GameLaunch,
  GameListResponse,
  GameMode,
  LiveStats,
  LobbyProvider,
} from '@/types';

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
    throw { message: res?.message || translate('game.launchFailed') } satisfies ApiError;
  }
  return res.data;
}

/**
 * The device version to ask for. Viewport-width only: a touch-enabled
 * laptop / desktop (coarse pointer + wide screen) is still a desktop for
 * layout purposes, and asking for the mobile iframe build there forced the
 * cramped mobile styling (`calc(100dvh - 12.5rem)`) on it. If the viewport
 * is phone-sized we ask for the mobile build regardless of pointer type.
 */
export const currentGameDevice = (): GameDevice =>
  window.matchMedia('(max-width: 767px)').matches ? 'MOBILE' : 'DESKTOP';

/**
 * Resolve a slug (e.g. "amiry-plinko") to its catalog entry, in the browser.
 * Used to rehydrate the lobby card's last-played game — the API returns the
 * slug + mode and the lobby needs the game's title (for the header) and the
 * launch call. Null when the slug no longer resolves (delisted / renamed).
 */
export async function fetchGame(slug: string): Promise<Game | null> {
  try {
    const res = await apiService.get<Game>(`/games/${encodeURIComponent(slug)}`);
    return res?.success && res.data ? res.data : null;
  } catch {
    return null;
  }
}

/**
 * The player's last-played game on the lobby card, so the CrashPreview can
 * restore it on next sign-in from any device. Fire-and-forget on the write
 * side (a failed save is better than a blocked launch); null on read when
 * the user has never opened an inline game.
 */
export async function fetchLastGame(): Promise<{
  slug: string | null;
  mode: GameMode;
} | null> {
  try {
    const res = await apiService.get<{ slug: string | null; mode: GameMode } | null>(
      '/users/me/last-game'
    );
    return res?.success && res.data ? res.data : null;
  } catch {
    return null;
  }
}

export async function saveLastGame(slug: string, mode: GameMode): Promise<void> {
  try {
    await apiService.put('/users/me/last-game', { slug, mode });
  } catch {
    // Fire-and-forget — the player is already playing; a failed save just
    // means they will not see this game restored on the next device.
  }
}

/**
 * One page of a shelf's listing, fetched in the browser as its slider nears
 * the end of what the server rendered. The same query the shelf's "View all"
 * page sends, so the slider and that page agree on order.
 */
export async function fetchShelfPage(
  list: ShelfListQuery | BrowseQuery,
  page: number,
  limit: number,
  signal?: AbortSignal
): Promise<GameListResponse> {
  const res = await apiService.get<GameListResponse>(
    '/games',
    { ...list, page, limit },
    { signal }
  );
  if (!res?.success || !Array.isArray(res.data?.data) || !res.data.pagination) {
    throw { message: res?.message || translate('myGames.failed') } satisfies ApiError;
  }
  return res.data;
}

export interface BrowseQuery extends Omit<ShelfListQuery, 'sort'> {
  sort: SortKey;
  search?: string;
  provider?: string;
  is_new?: boolean;
}

/* ------------------------------------------------------------------ */
/* The player's own games — both need the player's token               */
/* ------------------------------------------------------------------ */

const listOrThrow = async <T>(url: string, failed: TranslationKey): Promise<T[]> => {
  const res = await apiService.get<T[]>(url);
  if (!res?.success || !Array.isArray(res.data)) {
    throw { message: res?.message || translate(failed) } satisfies ApiError;
  }
  return res.data;
};

/**
 * Games and studios are hearted the same way — GET `<base>/favourites` and
 * PUT|DELETE `<base>/:slug/favourite` — so one pair of calls serves both.
 */
const setHearted = async (base: string, slug: string, favourite: boolean): Promise<void> => {
  const url = `${base}/${encodeURIComponent(slug)}/favourite`;
  const res = favourite ? await apiService.put(url) : await apiService.delete(url);
  if (!res?.success) {
    throw { message: res?.message || translate('favourites.failed') } satisfies ApiError;
  }
};

/** The player's favourite games, newest-hearted first. */
export const fetchFavourites = (): Promise<Game[]> =>
  listOrThrow<Game>('/games/favourites', 'myGames.failed');

/** The games the player launched most recently, newest first. */
export const fetchRecentGames = (): Promise<Game[]> =>
  listOrThrow<Game>('/games/recent', 'myGames.failed');

/** The studios the player has hearted, newest-hearted first. */
export const fetchFavouriteProviders = (): Promise<LobbyProvider[]> =>
  listOrThrow<LobbyProvider>('/game-providers/favourites', 'favourites.providersFailed');

/** Hearts or unhearts a game. Idempotent either way. */
export const setFavourite = (slug: string, favourite: boolean): Promise<void> =>
  setHearted('/games', slug, favourite);

/** Hearts or unhearts a studio. Idempotent either way. */
export const setProviderFavourite = (slug: string, favourite: boolean): Promise<void> =>
  setHearted('/game-providers', slug, favourite);

/**
 * The player's live stats since `since` — on one game when `game` is a slug,
 * on every game otherwise. Needs the player's token.
 */
export async function fetchLiveStats(
  since: string,
  game: string | null,
  signal?: AbortSignal
): Promise<LiveStats> {
  const res = await apiService.get<LiveStats>(
    '/games/live-stats',
    game ? { since, game } : { since },
    { signal }
  );
  if (!res?.success || !res.data) {
    throw { message: res?.message || translate('game.stats.failed') } satisfies ApiError;
  }
  return res.data;
}
