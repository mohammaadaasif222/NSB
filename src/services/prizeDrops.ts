import apiService from '@/services/api';

/**
 * Drops & Wins — GET /prize-drops.
 *
 * One shape for every provider: the backend translates each provider's
 * prize-drop feed, so nothing here knows which studio runs a campaign.
 * Amounts are decimal strings in the campaign's currency, null when the
 * provider gives none.
 */

export interface PrizeDropGame {
  id: string;
  slug: string;
  title: string;
  image_url: string | null;
}

export interface PrizeDrop {
  id: string;
  aggregator: string;
  name: string;
  level: 'NETWORK' | 'BESPOKE' | null;
  vertical: 'SLOTS' | 'LIVE' | null;
  starts_at: string;
  ends_at: string;
  currency: string;
  prize_pool: string | null;
  prizes_total: number | null;
  min_bet: string | null;
  min_rounds: number | null;
  min_wagered: string | null;
  games: PrizeDropGame[];
  updated_at: string;
}

/** Null when the request failed, so a caller can keep what it last showed. */
export const fetchPrizeDrops = (): Promise<PrizeDrop[] | null> =>
  apiService
    .get<PrizeDrop[]>('/prize-drops')
    .then((res) => (res?.success && Array.isArray(res.data) ? res.data : null))
    .catch(() => null);
