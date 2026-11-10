import apiService from '@/services/api';

/**
 * The winners strip — GET /top-wins: real settled wins operators put on it,
 * in their order. Amounts are decimal strings in USD, the wallet's own unit.
 */
export interface TopWin {
  id: string;
  /** Already masked by the backend. */
  player: string;
  avatar_url: string | null;
  game: { id: string; slug: string; title: string; image_url: string | null };
  payout_usd: string;
  /** payout / bet, 2 decimals. */
  multiplier: string;
  settled_at: string;
}

/** Null when the request failed. */
export const fetchTopWins = (): Promise<TopWin[] | null> =>
  apiService
    .get<TopWin[]>('/top-wins')
    .then((res) => (res?.success && Array.isArray(res.data) ? res.data : null))
    .catch(() => null);
