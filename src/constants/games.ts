import type { GameCategory, GameMode, GameShelfKey } from '@/types/game';
import type { TranslationKey } from '@/i18n/locales';

/**
 * Mirrors GAME_SHELVES in rolluck-backend's src/constants/games.ts — keep the
 * two in step.
 *
 * `key` is the public contract shared with the API: it names the query
 * parameter carrying a shelf's page number on `/api/games/home`, and it is the
 * URL segment for a category page here (`/games/slots`). `category` is the
 * enum value the list endpoint filters on (`/api/games?category=SLOTS`).
 */
export const GAME_CATEGORIES = [
  { key: 'originals', category: 'ORIGINALS', titleKey: 'dash.originals' },
  { key: 'new', category: 'NEW_RELEASE', titleKey: 'dash.newReleases' },
  { key: 'featured', category: 'FEATURED', titleKey: 'dash.featuredGames' },
  { key: 'slots', category: 'SLOTS', titleKey: 'dash.slots' },
] as const satisfies readonly {
  key: GameShelfKey;
  category: GameCategory;
  titleKey: TranslationKey;
}[];

export type GameCategoryDef = (typeof GAME_CATEGORIES)[number];

export const SHELF_KEYS: GameShelfKey[] = GAME_CATEGORIES.map((c) => c.key);

/** Tiles per page on a category listing. The API caps `limit` at 50. */
export const CATEGORY_PAGE_SIZE = 24;

const isShelfKey = (value: string): value is GameShelfKey =>
  (SHELF_KEYS as readonly string[]).includes(value);

/** Category definition for a URL segment, or null for anything unknown. */
export const categoryForKey = (value: string | string[] | undefined): GameCategoryDef | null => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !isShelfKey(raw)) {
    return null;
  }
  return GAME_CATEGORIES.find((c) => c.key === raw) ?? null;
};

/** Category definition for an API enum value. */
export const categoryForEnum = (category: GameCategory): GameCategoryDef =>
  GAME_CATEGORIES.find((c) => c.category === category) ?? GAME_CATEGORIES[0];

/** Path of the listing page for a category. */
export const categoryHref = (key: GameShelfKey, page = 1): string =>
  page > 1 ? `/games/${key}?page=${page}` : `/games/${key}`;

/** Path of a game's detail page. */
export const gameHref = (slug: string): string => `/game/${encodeURIComponent(slug)}`;

/** Path of the page that runs a game — real money unless asked for the demo. */
export const playHref = (slug: string, mode: GameMode = 'REAL'): string =>
  `/play/${encodeURIComponent(slug)}${mode === 'DEMO' ? '?mode=demo' : ''}`;
