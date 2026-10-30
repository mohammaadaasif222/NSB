import type { LiveStream } from '@/services/liveStreams';

const API_BASE_URL =
  process.env.API_BASE_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:5000/api';

const FETCH_TIMEOUT_MS = 8000;

export async function fetchLiveStreamsServer(): Promise<LiveStream[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/live-streams`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new Error(`Live streams API responded ${response.status}`);
    }
    const body = (await response.json()) as { data?: LiveStream[] };
    return Array.isArray(body?.data) ? body.data : [];
  } catch (error) {
    console.error('[live-streams] fetch failed:', error instanceof Error ? error.message : error);
    return [];
  }
}
