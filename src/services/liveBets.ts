import apiService from '@/services/api';

/**
 * The lobby's Live Bets row — GET /live-bets: rounds that just settled, newest
 * first. Amounts are decimal strings in USD, the wallet's own unit.
 */
export interface LiveBet {
  id: string;
  /** Already masked by the backend. */
  player: string;
  game: { id: string; slug: string; title: string; image_url: string | null };
  bet_usd: string;
  payout_usd: string;
  /** payout / bet, 2 decimals. */
  multiplier: string;
  settled_at: string;
  /** Put on the row by an operator, not played: shown with a Demo badge. */
  is_demo?: boolean;
}

/** Null when the request failed, so a caller can keep what it last showed. */
export const fetchLiveBets = (): Promise<LiveBet[] | null> =>
  apiService
    .get<LiveBet[]>('/live-bets')
    .then((res) => (res?.success && Array.isArray(res.data) ? res.data : null))
    .catch(() => null);
