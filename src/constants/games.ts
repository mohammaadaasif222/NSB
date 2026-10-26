import type {
  Game,
  GameCategory,
  GameCollection,
  GameMode,
  GameShelfKey,
  GameType,
} from '@/types/game';
import type { TranslationKey } from '@/i18n/locales';

/** What a shelf's "View all" page asks the list endpoint for. */
export interface ShelfListQuery {
  category?: GameCategory;
  type?: GameType;
  /**
   * `popular`: most played ever; `trending`: most played this week; `new`:
   * latest release first; `rtp`: highest first; `az` / `za`: by title.
   */
  sort?: 'popular' | 'trending' | 'new' | 'rtp' | 'az' | 'za';
  /** A word within the game's genre, matched case-insensitively. */
  genre?: string;
  buy_feature?: boolean;
  provider?: string;
  /** A lobby collection (blackjack, instant-wins…). */
  collection?: GameCollection;
  /** Tag Manager slugs, comma-separated: any within a group, every group. */
  tags?: string;
  /** What the player typed; results come back by relevance. */
  search?: string;
  /** A maximum win of at least this multiple of the stake. */
  max_win_min?: number;
  /** Released within this many days. */
  released_within_days?: number;
}

/**
 * Mirrors GAME_SHELVES in rolluck-backend's src/constants/games.ts — keep the
 * two in step.
 *
 * `key` is the public contract shared with the API: it names the query
 * parameter carrying a shelf's page number on `/api/games/home`, and it is the
 * URL segment for the shelf's own page here (`/games/slots`). `list` is what
 * that page asks the flat list endpoint for — a category for most shelves,
 * `type=LIVE` for Live Casino, a sort for Most Played and Trending, the genre
 * for Table Games and the buy feature for Bonus Buys.
 */
export const GAME_SHELVES = [
  { key: 'originals', titleKey: 'dash.originals', list: { category: 'ORIGINALS' } },
  { key: 'new', titleKey: 'dash.newReleases', list: { category: 'NEW_RELEASE' } },
  { key: 'featured', titleKey: 'dash.featuredGames', list: { category: 'FEATURED' } },
  { key: 'slots', titleKey: 'dash.slots', list: { category: 'SLOTS' } },
  { key: 'live', titleKey: 'dash.liveCasino', list: { type: 'LIVE' } },
  { key: 'popular', titleKey: 'dash.mostPlayed', list: { sort: 'popular' } },
  { key: 'trending', titleKey: 'dash.trending', list: { sort: 'trending' } },
  { key: 'table', titleKey: 'dash.tableGames', list: { genre: 'table' } },
  { key: 'bonus-buys', titleKey: 'dash.bonusBuys', list: { buy_feature: true } },
  {
    key: 'instant-wins',
    titleKey: 'lobby.chips.instantWins',
    list: { collection: 'instant-wins' },
  },
  { key: 'blackjack', titleKey: 'lobby.chips.blackjack', list: { collection: 'blackjack' } },
  { key: 'roulette', titleKey: 'lobby.chips.roulette', list: { collection: 'roulette' } },
  { key: 'baccarat', titleKey: 'lobby.chips.baccarat', list: { collection: 'baccarat' } },
  { key: 'game-shows', titleKey: 'lobby.chips.gameShows', list: { collection: 'game-shows' } },
  {
    key: 'live-popular',
    titleKey: 'lobby.live.popular',
    list: { type: 'LIVE', sort: 'popular' },
  },
  { key: 'live-new', titleKey: 'lobby.live.new', list: { type: 'LIVE', category: 'NEW_RELEASE' } },
  {
    key: 'live-blackjack',
    titleKey: 'lobby.chips.blackjack',
    list: { type: 'LIVE', collection: 'blackjack' },
  },
  {
    key: 'live-roulette',
    titleKey: 'lobby.chips.roulette',
    list: { type: 'LIVE', collection: 'roulette' },
  },
  {
    key: 'live-game-shows',
    titleKey: 'lobby.chips.gameShows',
    list: { type: 'LIVE', collection: 'game-shows' },
  },
  {
    key: 'live-baccarat',
    titleKey: 'lobby.chips.baccarat',
    list: { type: 'LIVE', collection: 'baccarat' },
  },
  {
    key: 'live-lightning',
    titleKey: 'lobby.live.lightning',
    list: { type: 'LIVE', collection: 'lightning' },
  },
] as const satisfies readonly {
  key: GameShelfKey;
  titleKey: TranslationKey;
  list: ShelfListQuery;
}[];

export type GameShelfDef = (typeof GAME_SHELVES)[number];

export const SHELF_KEYS: GameShelfKey[] = GAME_SHELVES.map((s) => s.key);

/** The shelves that are a single catalogue category, keyed by that category. */
export const GAME_CATEGORIES = GAME_SHELVES.filter(
  (s): s is Extract<GameShelfDef, { list: { category: GameCategory } }> =>
    'category' in s.list && !('type' in s.list)
);

/** The casino's shelves, as the category pages tab between them; the live lobby has its own. */
export const CASINO_LISTING_KEYS: readonly GameShelfKey[] = SHELF_KEYS.filter(
  (key) => !key.startsWith('live-')
);

/**
 * The shelves each lobby shows, in order.
 */
export const LOBBY_SHELF_KEYS: readonly GameShelfKey[] = [
  'originals',
  'slots',
  'live',
  'new',
  'featured',
];
export const PLAYER_SHELF_KEYS: readonly GameShelfKey[] = [
  'originals',
  'slots',
  'live',
  'new',
  'popular',
];

/**
 * The casino page's shelves, in the Casino Manager sheet's "Final" order.
 * Featured is the operator's curated pick, titled "Recommended for you" until
 * a per-player rule replaces it. The player's own rows (favourites, last
 * played), Providers and the rows with nothing behind them yet (Drops & Wins,
 * Hot) sit among these — Lobby's CASINO_INSERTS.
 */
export const CASINO_SHELF_KEYS: readonly GameShelfKey[] = [
  'originals',
  'featured',
  'new',
  'live-popular',
  'instant-wins',
  'trending',
  'blackjack',
];

/**
 * The Live Casino lobby's rows, in the Casino Manager sheet's order. Live
 * tables arrive slowly, so these rows stay on the page while empty and say
 * "Coming soon" instead of disappearing.
 */
export const LIVE_SHELF_KEYS: readonly GameShelfKey[] = [
  'live-popular',
  'live-new',
  'live-blackjack',
  'live-roulette',
  'live-game-shows',
  'live-baccarat',
  'live-lightning',
];

/** The home page draws one of two shelf sets, depending on who is signed in. */
export const HOME_SHELF_KEYS: readonly GameShelfKey[] = [
  ...new Set([...LOBBY_SHELF_KEYS, ...PLAYER_SHELF_KEYS]),
];

/**
 * Whether a game belongs on a shelf, judged in the browser the way the list
 * endpoint judges it. Orders (`sort`) narrow nothing, so they match every game.
 */
export const listMatches = (game: Game, list: ShelfListQuery): boolean =>
  (list.category === undefined || game.category === list.category) &&
  (list.type === undefined || game.type === list.type) &&
  (list.genre === undefined ||
    (game.genre ?? '').toLowerCase().includes(list.genre.toLowerCase())) &&
  (list.buy_feature === undefined || game.buy_feature === list.buy_feature) &&
  (list.collection === undefined || (game.collections ?? []).includes(list.collection));

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

/** Path of the Live Casino lobby. */
export const LIVE_CASINO_HREF = '/live-casino';

/** The category shelf for an API enum value. */
export const categoryForEnum = (category: GameCategory): GameShelfDef =>
  GAME_CATEGORIES.find((c) => c.list.category === category) ?? GAME_SHELVES[0];

/** Path of the listing page for a shelf. */
export const categoryHref = (key: GameShelfKey, page = 1): string =>
  page > 1 ? `/games/${key}?page=${page}` : `/games/${key}`;

export const PROVIDERS_PATH = '/providers';

/** Every game, with the combinable filters. */
export const ALL_GAMES_PATH = '/games/all';

export const providerHref = (slug: string, page = 1): string =>
  `${PROVIDERS_PATH}/${encodeURIComponent(slug)}${page > 1 ? `?page=${page}` : ''}`;

/** Path of a game's detail page. */
export const gameHref = (slug: string): string => `/game/${encodeURIComponent(slug)}`;

/** Path of the page that runs a game — real money unless asked for the demo. */
export const playHref = (slug: string, mode: GameMode = 'REAL'): string =>
  `/play/${encodeURIComponent(slug)}${mode === 'DEMO' ? '?mode=demo' : ''}`;
