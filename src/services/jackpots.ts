import apiService from '@/services/api';

/**
 * Provider jackpots — GET /jackpots and GET /jackpot-winners.
 *
 * One shape for every provider: the backend translates each provider's
 * feed, so nothing here knows which studio runs a jackpot. Amounts are
 * decimal strings in the currency they come with.
 */

export type JackpotTierLabel = 'MINI' | 'MINOR' | 'MAJOR' | 'GRAND';

export interface JackpotGame {
  id: string;
  slug: string;
  title: string;
  image_url: string | null;
}

export interface Jackpot {
  id: string;
  aggregator: string;
  name: string;
  scope: string | null;
  status: 'ACTIVE' | 'PAUSED';
  currency: string;
  /** Lowest first. */
  tiers: { tier: number; label: JackpotTierLabel | null; amount: string }[];
  total: string;
  games: JackpotGame[];
  updated_at: string;
}

export interface JackpotWinner {
  id: string;
  aggregator: string;
  /** Already masked by the backend. */
  player: string;
  amount: string;
  currency: string;
  win_type: 'STANDARD' | 'COMMUNITY' | 'NON_PROGRESSIVE' | 'OTHER';
  won_at: string;
  jackpot: { name: string; tier: number; label: JackpotTierLabel | null } | null;
  game: JackpotGame | null;
}

/** Null when the request failed, so a caller can keep what it last showed. */
export const fetchJackpots = (): Promise<Jackpot[] | null> =>
  apiService
    .get<Jackpot[]>('/jackpots')
    .then((res) => (res?.success && Array.isArray(res.data) ? res.data : null))
    .catch(() => null);

export const fetchJackpotWinners = (limit = 20): Promise<JackpotWinner[] | null> =>
  apiService
    .get<JackpotWinner[]>('/jackpot-winners', { limit })
    .then((res) => (res?.success && Array.isArray(res.data) ? res.data : null))
    .catch(() => null);
