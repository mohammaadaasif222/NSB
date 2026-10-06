import type { GameCategory, GameMode, GameShelfKey, GameType } from '@/types/game';
import type { TranslationKey } from '@/i18n/locales';

/** What a shelf's "View all" page asks the list endpoint for. */
export interface ShelfListQuery {
  category?: GameCategory;
  type?: GameType;
  sort?: 'popular';
}

/**
 * Mirrors GAME_SHELVES in rolluck-backend's src/constants/games.ts — keep the
 * two in step.
 *
 * `key` is the public contract shared with the API: it names the query
 * parameter carrying a shelf's page number on `/api/games/home`, and it is the
 * URL segment for the shelf's own page here (`/games/slots`). `list` is what
 * that page asks the flat list endpoint for — a category for most shelves,
 * `type=LIVE` for Live Casino, `sort=popular` for Most Played.
 */
export const GAME_SHELVES = [
  { key: 'originals', titleKey: 'dash.originals', list: { category: 'ORIGINALS' } },
  { key: 'new', titleKey: 'dash.newReleases', list: { category: 'NEW_RELEASE' } },
  { key: 'featured', titleKey: 'dash.featuredGames', list: { category: 'FEATURED' } },
  { key: 'slots', titleKey: 'dash.slots', list: { category: 'SLOTS' } },
  { key: 'live', titleKey: 'dash.liveCasino', list: { type: 'LIVE' } },
  { key: 'popular', titleKey: 'dash.mostPlayed', list: { sort: 'popular' } },
] as const satisfies readonly {
  key: GameShelfKey;
  titleKey: TranslationKey;
  list: ShelfListQuery;
}[];

export type GameShelfDef = (typeof GAME_SHELVES)[number];

export const SHELF_KEYS: GameShelfKey[] = GAME_SHELVES.map((s) => s.key);

/** The shelves that are a single catalogue category, keyed by that category. */
export const GAME_CATEGORIES = GAME_SHELVES.filter(
  (s): s is Extract<GameShelfDef, { list: { category: GameCategory } }> => 'category' in s.list
);

/**
 * The shelves each lobby shows, in order, as the two designs lay them out.
 * Slots stays a category of its own on the signed-out page — reachable from
 * the chips, the browser and /games/slots — but has no shelf there.
 */
export const LOBBY_SHELF_KEYS: readonly GameShelfKey[] = ['originals', 'new', 'featured'];
export const PLAYER_SHELF_KEYS: readonly GameShelfKey[] = [
  'originals',
  'slots',
  'live',
  'new',
  'popular',
];

/** Tiles per page on a category listing. The API caps `limit` at 50. */
export const CATEGORY_PAGE_SIZE = 24;

const isShelfKey = (value: string): value is GameShelfKey =>
  (SHELF_KEYS as readonly string[]).includes(value);

/** A shelf's definition. */
export const shelfFor = (key: GameShelfKey): GameShelfDef =>
  GAME_SHELVES.find((s) => s.key === key) ?? GAME_SHELVES[0];

/** Shelf definition for a URL segment, or null for anything unknown. */
export const categoryForKey = (value: string | string[] | undefined): GameShelfDef | null => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !isShelfKey(raw)) {
    return null;
  }
  return shelfFor(raw);
};

/** The category shelf for an API enum value. */
export const categoryForEnum = (category: GameCategory): GameShelfDef =>
  GAME_CATEGORIES.find((c) => c.list.category === category) ?? GAME_SHELVES[0];

/** Path of the listing page for a shelf. */
export const categoryHref = (key: GameShelfKey, page = 1): string =>
  page > 1 ? `/games/${key}?page=${page}` : `/games/${key}`;

/** Path of a game's detail page. */
export const gameHref = (slug: string): string => `/game/${encodeURIComponent(slug)}`;

/** Path of the page that runs a game — real money unless asked for the demo. */
export const playHref = (slug: string, mode: GameMode = 'REAL'): string =>
  `/play/${encodeURIComponent(slug)}${mode === 'DEMO' ? '?mode=demo' : ''}`;
