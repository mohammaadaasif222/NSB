/**
 * HTTP client for the rlk-originals-backend games service.
 *
 * This service lives on a separate host (NEXT_PUBLIC_ORIGINALS_API_URL,
 * default http://localhost:5000) and shares the main-backend JWT_SECRET —
 * so the same bearer token the main-backend REST uses works verbatim here.
 */
import axios, { type AxiosInstance } from 'axios';

import { readSession } from '@/lib/session';

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
export const getOriginalsGame = async (
  gameSlug: string
): Promise<OriginalsGameConfig | null> => {
  const key = `originals:${gameSlug}`;
  if (cache.has(key)) return cache.get(key) as OriginalsGameConfig;

  try {
    const res = await client.get(`/v1/originals/game/${gameSlug}`);
    const data: OriginalsGameConfig | null = res?.data ?? null;
    if (data) setCache(key, data);
    return data;
  } catch {
    return null;
  }
};

/**
 * Submit a lightweight event (balance request / resume etc.) to the
 * originals REST shim. Matches the Win-Win reference client.
 */
export const getPlayerBalanceApi = async (payload: Record<string, unknown>) => {
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
