/**
 * HTTP client for the rlk-originals-backend games service.
 *
 * This service lives on a separate host (NEXT_PUBLIC_ORIGINALS_API_URL,
 * default http://localhost:5000) and shares the main-backend JWT_SECRET —
 * so the same bearer token the main-backend REST uses works verbatim here.
 */
import axios, { type AxiosInstance } from 'axios';

import { readSession } from '@/lib/session';
import apiService from '@/services/api';
import type { WalletSummary } from '@/types';

const BASE =
  (process.env.NEXT_PUBLIC_ORIGINALS_API_URL as string | undefined) ||
  'http://localhost:5000';

const client: AxiosInstance = axios.create({
  baseURL: BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const s = readSession();
  if (s && Date.now() < s.expiresAt) {
    config.headers.Authorization = `Bearer ${s.token}`;
  }
  return config;
});

/* ------------------------------------------------------------------
 * Small in-memory cache for the game-config lookup. The response is
 * near-static (RTP, limits, image URL) and the lobby renders it on
 * every mount — cache it for 5 minutes to avoid a flood of requests.
 * ------------------------------------------------------------------ */
const cache = new Map<string, unknown>();
const setCache = (key: string, value: unknown, ttl = 5 * 60 * 1000) => {
  cache.set(key, value);
  setTimeout(() => cache.delete(key), ttl);
};

export interface OriginalsGameConfig {
  slug: string;
  name?: string;
  enabled?: boolean;
  rtp?: number;
  minBet?: number;
  maxBet?: number;
  image?: string;
  description?: string;
  [extra: string]: unknown;
}

/**
 * Fetch a game's config by its slug (e.g. "mines", "dice", "plinko").
 * The originals service exposes this at GET /v1/originals/game/:slug.
 */
/**
 * MineGame (and every other ported Win-Win game) reads
 * `response.code === 200 && response.data` — the Win-Win reference service
 * wrapped its results in that envelope. Mirror the shape so the ported
 * components work without edits. The actual rlk-originals-backend returns
 * `{ status: true, data: { ... } }` — we lift its `data` into the
 * envelope and re-attach a `code: 200` for the UI's check.
 */
export const getOriginalsGame = async (
  gameSlug: string
): Promise<{ code: number; data: OriginalsGameConfig } | null> => {
  const key = `originals:${gameSlug}`;
  if (cache.has(key))
    return cache.get(key) as { code: number; data: OriginalsGameConfig };

  try {
    const res = await client.get(`/v1/originals/game/${gameSlug}`);
    // axios: res.data is the raw body → { status: true, data: {...} }
    const config = (res?.data?.data ?? res?.data ?? null) as
      | OriginalsGameConfig
      | null;
    if (!config) return null;
    const wrapped = { code: 200, data: config };
    setCache(key, wrapped);
    return wrapped;
  } catch {
    return null;
  }
};

/**
 * Lobby pre-flight / wallet-query shim.
 *
 * The Win-Win reference client sent every lobby event through
 * POST /v1/originals/event — the games service there proxied balance
 * requests on to the main-backend wallet. In rlk we skip the proxy and
 * read from rlk-backend's /wallet/summary endpoint directly for balance
 * queries, so there is one source of truth for a player's funds. Non-
 * balance events still POST to the originals-backend for its ACK (the
 * ported MineGame fires one on first mount).
 *
 * Returns the Win-Win envelope `{ code: 200, data: { balance } }` so the
 * ported game code can read it without edits.
 */
export const getPlayerBalanceApi = async (
  payload: Record<string, unknown>
): Promise<{ code: number; data: { balance: number } } | unknown> => {
  if (payload?.action === 'balance') {
    try {
      const res = await apiService.get<WalletSummary>('/wallet/summary');
      // apiService unwraps the `{ success, data }` envelope on success —
      // but keep both paths defensive in case a caller swaps it out.
      const summary = (res as { data?: WalletSummary })?.data ?? (res as unknown as WalletSummary);
      const b = summary?.balance;
      const raw = b?.display_amount ?? b?.real_amount ?? '0';
      const balance = Number(raw);
      return {
        code: 200,
        data: { balance: Number.isFinite(balance) ? balance : 0 },
      };
    } catch {
      return { code: 500, data: { balance: 0 } };
    }
  }

  // Non-balance events — fall back to the originals-backend's ACK stub.
  try {
    const res = await client.post(`/v1/originals/event`, payload);
    if (res?.data?.code === 200) return res.data;
    return res;
  } catch (err) {
    return err;
  }
};

/** Game history for a single round — used by the "Verify" panel. */
export const getPlayerGameHistoryApi = async (
  gameId: string,
  roundId: string
) => {
  const res = await fetch(`${BASE}/game-history/${gameId}/${roundId}`);
  if (!res.ok) throw new Error('Failed to fetch game history: ' + res.status);
  return res.json();
};

export default client;
