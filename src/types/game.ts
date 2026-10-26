/** Mirrors GameDto / GameShelfDto / GameLaunchDto in rolluck-backend's game module. */

import type { PaginationMeta } from './api';

export type GameCategory = 'ORIGINALS' | 'NEW_RELEASE' | 'FEATURED' | 'SLOTS';

/**
 * Query-parameter name carrying a shelf's page number (`/?slots=2`), and the
 * URL segment of that shelf's listing page (`/games/slots`). `live` is the
 * live-dealer games and `popular` the most played — shelves that are not a
 * category.
 */
export type GameShelfKey =
  | 'originals'
  | 'new'
  | 'featured'
  | 'slots'
  | 'live'
  | 'popular'
  | 'trending'
  | 'table'
  | 'bonus-buys'
  | 'instant-wins'
  | 'blackjack'
  | 'roulette'
  | 'baccarat'
  | 'game-shows'
  | 'live-popular'
  | 'live-new'
  | 'live-blackjack'
  | 'live-roulette'
  | 'live-game-shows'
  | 'live-baccarat'
  | 'live-lightning';

/** Lobby collections a game can sit in — GAME_COLLECTIONS on the backend. */
export type GameCollection =
  | 'blackjack'
  | 'roulette'
  | 'baccarat'
  | 'game-shows'
  | 'lightning'
  | 'poker'
  | 'crash'
  | 'instant-wins'
  | 'mines'
  | 'plinko'
  | 'dice'
  | 'wheel'
  | 'scratch-cards'
  | 'keno'
  | 'hilo'
  | 'bingo';

export type GameType = 'STANDARD' | 'LIVE' | 'LOBBY';

export type GameVolatility = 'LOW' | 'LOW_MED' | 'MED' | 'MED_HIGH' | 'HIGH';

/** LOCAL: this casino's own; POOLED: shared across casinos. */
export type GameJackpotType = 'NONE' | 'LOCAL' | 'POOLED';

/** REAL stakes the wallet; DEMO plays with play money. */
export type GameMode = 'REAL' | 'DEMO';

export type GameDevice = 'DESKTOP' | 'MOBILE';

/**
 * Games synced from an aggregator do not always carry every attribute, so the
 * artwork, RTP, bet limits and shelf may be null. Games added in the console
 * always have them.
 */
export interface Game {
  id: string;
  slug: string;
  title: string;
  provider: string;
  /** The home-page shelf; null for a game on no shelf. */
  category: GameCategory | null;
  type: GameType;
  genre: string | null;
  volatility: GameVolatility | null;
  image_url: string | null;
  is_new: boolean;
  rtp: number | null;
  min_bet: number | null;
  max_bet: number | null;
  /** Currency of the bet limits; null means the platform currency. */
  bet_currency: string | null;
  /** Height as a percentage of width (56.25 = 16:9); sizes the game frame. */
  display_ratio: number | null;
  demo_available: boolean;
  /** Whether the bonus round can be bought outright (the Bonus Buys shelf). */
  buy_feature: boolean;
  jackpot_type: GameJackpotType | null;
  /** The studio's maximum win as a multiple of the stake. */
  max_win_multiplier: number | null;
  /** YYYY-MM-DD. */
  release_date: string | null;
  /** Whether the game can be opened right now. */
  launchable: boolean;
  /** Lobby collections it sits in. */
  collections: GameCollection[];
}

export type GamePagination = PaginationMeta;

/**
 * A studio plate in the lobby's Providers row — GET /game-providers.
 *
 * Managed from the admin console: the API returns only providers that are
 * switched on AND have at least one live game, already in curated order.
 */
export interface LobbyProvider {
  id: string;
  /** Matches `Game.provider` exactly — it is what the provider filter compares. */
  name: string;
  slug: string;
  /** Null draws the name instead. */
  logo_url: string | null;
  game_count: number;
}

export interface GameShelf {
  key: GameShelfKey;
  /** English fallback; the UI prefers its own translated title. */
  title: string;
  /** The category the shelf lists; null for live and most played. */
  category: GameCategory | null;
  games: Game[];
  pagination: GamePagination;
}

/** GET /games/home */
export interface HomeShelvesResponse {
  shelves: GameShelf[];
}

/** GET /games?category=… */
/** GET /games/tag-filters: the Tag Manager groups the operator shows players. */
export interface TagFilterGroup {
  key: string;
  name: string;
  /** False: one tag of the group at a time (an RTP band). */
  multiple: boolean;
  tags: { slug: string; name: string; color: string | null; games: number }[];
}

export interface GameListResponse {
  data: Game[];
  pagination: GamePagination;
}

/** POST /games/:slug/launch */
export interface GameLaunch {
  /** Load in an iframe on this site. Single use — launch again for a fresh session. */
  url: string;
  /** Must be set on the iframe, or the aggregator refuses to open the game. */
  referrer_policy: string;
  mode: GameMode;
  device: GameDevice;
  locale: string;
  display_ratio: number | null;
  /**
   * The game's layout flavour. "FLUID" games fill the content column (used by
   * Rolluck Originals), "STANDARD" games use the classic viewport-bounded
   * aspect-ratio sizing (every other integration). Carries a behaviour hint,
   * never the integration layer's name — players must not see which
   * aggregator sources the game.
   */
  frame_layout: 'FLUID' | 'STANDARD';
  game: { id: string; slug: string; title: string };
  /**
   * What the game shows and takes bets in: the player's display currency
   * when the game's provider supports it, otherwise USD (the wallet's own).
   * Same money either way — converted at a rate fixed for the session.
   */
  currency: string;
  /** The player's display currency at launch. */
  display_currency: string;
  /** Why `currency` differs from `display_currency`; null when they match. */
  currency_fallback: 'UNSUPPORTED_BY_PROVIDER' | 'NO_RATE' | null;
}

/**
 * GET /games/live-stats — the player's own real-money rounds since `since`.
 * Amounts are exact decimal strings in `currency` (the USD wallet).
 */
export interface LiveStats {
  /** Where the window really starts, after the server clamped it. */
  since: string;
  /** The game slug the stats cover; null for every game. */
  game: string | null;
  currency: string;
  rounds: number;
  /** Settled rounds that paid more than they staked, and less. */
  wins: number;
  losses: number;
  wagered: string;
  profit: string;
  /** Running profit after each of the most recent rounds, oldest first. */
  points: string[];
}
