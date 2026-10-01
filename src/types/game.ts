/** Mirrors GameDto / GameShelfDto / GameLaunchDto in rolluck-backend's game module. */

import type { PaginationMeta } from './api';

export type GameCategory = 'ORIGINALS' | 'NEW_RELEASE' | 'FEATURED' | 'SLOTS';

/**
 * Query-parameter name carrying a shelf's page number (`/?slots=2`), and the
 * URL segment of that category's listing page (`/games/slots`).
 */
export type GameShelfKey = 'originals' | 'new' | 'featured' | 'slots';

export type GameType = 'STANDARD' | 'LIVE' | 'LOBBY';

export type GameVolatility = 'LOW' | 'LOW_MED' | 'MED' | 'MED_HIGH' | 'HIGH';

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
  /** Whether the game can be opened right now. */
  launchable: boolean;
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
  category: GameCategory;
  games: Game[];
  pagination: GamePagination;
}

/** GET /games/home */
export interface HomeShelvesResponse {
  shelves: GameShelf[];
}

/** GET /games?category=… */
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
  game: { id: string; slug: string; title: string };
}
