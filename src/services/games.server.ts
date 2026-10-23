import type {
  DiceConfig,
  Game,
  GameListResponse,
  TagFilterGroup,
  GameShelf,
  GameShelfKey,
  HomeShelvesResponse,
  LobbyProvider,
} from '@/types';
import { SHELF_KEYS, shelfFor, type ShelfListQuery } from '@/constants/games';

/**
 * Server-side catalogue fetching, for getServerSideProps.
 *
 * Deliberately NOT the shared `apiService` axios instance: its request
 * interceptor reads sessionStorage, which does not exist in Node and would
 * throw on every server render. These endpoints are public anyway, so there is
 * no token to attach.
 */

/**
 * Where the browser bundle talks to the API. Inside a container or behind a
 * proxy the server often has a shorter path to the backend than the public
 * hostname, so API_BASE_URL_INTERNAL can override it for server-side calls
 * only. Without it, both use the same public URL.
 */
const API_BASE_URL =
  process.env.API_BASE_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:5000/api';

/** Give up rather than hold the response open on a wedged backend. */
const FETCH_TIMEOUT_MS = 8000;

export { SHELF_KEYS };

interface Envelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

class ApiStatusError extends Error {
  constructor(public readonly status: number) {
    super(`Games API responded ${status}`);
  }
}

/** One GET against the API, unwrapping the `{ success, data }` envelope. */
async function getJson<T>(path: string): Promise<T | undefined> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new ApiStatusError(response.status);
  }

  const body = (await response.json()) as Envelope<T>;
  return body?.data;
}

const logFailure = (what: string, error: unknown): void => {
  // Logged server-side only; the visitor sees the empty-state copy.
  console.error(`[games] ${what} failed:`, error instanceof Error ? error.message : error);
};

/**
 * Read a page number out of the URL query.
 *
 * Anything that isn't a positive integer falls back to page 1: `?slots=abc`,
 * `?slots=-4` and `?slots=1&slots=2` are all user-supplied and must not throw
 * during a server render.
 */
export const parsePageParam = (value: string | string[] | undefined): number => {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

/** Empty shelf, so the page still renders when the API is unreachable. */
const emptyShelf = (key: GameShelfKey, page: number): GameShelf => {
  const { list } = shelfFor(key);
  return {
    key,
    title: key,
    category: 'category' in list ? list.category : null,
    games: [],
    pagination: { total: 0, page, limit: 10, totalPages: 0 },
  };
};

export interface HomeShelvesResult {
  shelves: GameShelf[];
  /** True when the catalogue could not be loaded; the UI says so explicitly. */
  failed: boolean;
}

/**
 * Every home shelf in one request, each at its own page.
 *
 * A failure here renders an empty lobby rather than a 500: the home page is
 * also the signed-out landing page, and a catalogue outage should not take the
 * whole site down with it.
 */
export async function fetchHomeShelves(
  keys: readonly GameShelfKey[],
  pages: Partial<Record<GameShelfKey, number>>
): Promise<HomeShelvesResult> {
  // The API fetches only the shelves named, so a page asks for its own.
  const query = new URLSearchParams(keys.map((key) => [key, String(pages[key] ?? 1)]));

  try {
    const data = await getJson<HomeShelvesResponse>(`/games/home?${query}`);
    const shelves = data?.shelves;

    if (!Array.isArray(shelves) || shelves.length === 0) {
      throw new Error('Games API returned no shelves');
    }

    return { shelves, failed: false };
  } catch (error) {
    logFailure('Home shelves fetch', error);
    return {
      shelves: keys.map((key) => emptyShelf(key, pages[key] ?? 1)),
      failed: true,
    };
  }
}

/**
 * The lobby's Providers row, as curated in the admin console.
 *
 * Fails soft to an empty list — the row simply does not render — because the
 * providers are decoration on the landing page, not something worth failing
 * the whole render over.
 */
export async function fetchRegisteredTodayCount(): Promise<number | null> {
  try {
    const data = await getJson<{ registered_today?: unknown }>('/statistics/public');
    return typeof data?.registered_today === 'number' ? data.registered_today : null;
  } catch (error) {
    logFailure('Public statistics fetch', error);
    return null;
  }
}

/** The lobby's tag filters (empty when none are public), or null when the call fails. */
export async function fetchTagFilters(): Promise<TagFilterGroup[] | null> {
  try {
    const data = await getJson<{ groups: TagFilterGroup[] }>('/games/tag-filters');
    return Array.isArray(data?.groups) ? data.groups.filter((g) => g.tags.length > 0) : null;
  } catch (error) {
    logFailure('Tag filters fetch', error);
    return null;
  }
}

export async function fetchLobbyProviders(): Promise<LobbyProvider[]> {
  return (await fetchProviders()) ?? [];
}

export async function fetchProviders(): Promise<LobbyProvider[] | null> {
  try {
    const data = await getJson<LobbyProvider[]>('/game-providers');
    return Array.isArray(data) ? data : null;
  } catch (error) {
    logFailure('Providers fetch', error);
    return null;
  }
}

export interface CategoryPageResult extends GameListResponse {
  failed: boolean;
}

/**
 * One page of a shelf's full listing, via the flat list endpoint —
 * `GET /games?category=SLOTS&page=2&limit=24`, `?type=LIVE` for Live Casino,
 * `?sort=popular` for Most Played.
 */
export async function fetchShelfList(
  list: ShelfListQuery,
  page: number,
  limit: number
): Promise<CategoryPageResult> {
  const query = new URLSearchParams({
    ...Object.fromEntries(Object.entries(list).map(([key, value]) => [key, String(value)])),
    page: String(page),
    limit: String(limit),
  });

  try {
    const data = await getJson<GameListResponse>(`/games?${query}`);

    if (!data || !Array.isArray(data.data) || !data.pagination) {
      throw new Error('Games API returned no list');
    }

    return { ...data, failed: false };
  } catch (error) {
    logFailure(`Shelf list ${query} fetch`, error);
    return {
      data: [],
      pagination: { total: 0, page, limit, totalPages: 0 },
      failed: true,
    };
  }
}

export type GameLookup =
  { status: 'found'; game: Game } | { status: 'missing' } | { status: 'failed' };

/**
 * One game by slug. A 404 from the API is a distinct outcome from an outage:
 * the first is a real "no such game" page, the second must not be reported as
 * one.
 */
export async function fetchGameBySlug(slug: string): Promise<GameLookup> {
  try {
    const game = await getJson<Game>(`/games/${encodeURIComponent(slug)}`);
    if (!game?.slug) {
      return { status: 'missing' };
    }
    return { status: 'found', game };
  } catch (error) {
    if (error instanceof ApiStatusError && error.status === 404) {
      return { status: 'missing' };
    }
    logFailure(`Game ${slug} fetch`, error);
    return { status: 'failed' };
  }
}

/**
 * Whether demo Dice can be played, and its limits. Null when the API could not
 * say — the page then shows the ordinary game details rather than a board that
 * cannot roll.
 */
export async function fetchDiceConfig(): Promise<DiceConfig | null> {
  try {
    return (await getJson<DiceConfig>('/dice/config')) ?? null;
  } catch (error) {
    logFailure('Dice config fetch', error);
    return null;
  }
}
