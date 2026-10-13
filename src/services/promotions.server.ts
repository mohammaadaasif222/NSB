import type { PromotionItem } from '@/services/promotions';

const API_BASE_URL =
  process.env.API_BASE_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:5000/api';

const FETCH_TIMEOUT_MS = 8000;

export async function fetchPromotionServer(slug: string): Promise<PromotionItem | null> {
  const response = await fetch(`${API_BASE_URL}/promotions/${encodeURIComponent(slug)}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Promotions API responded ${response.status}`);
  }
  const body = (await response.json()) as { data?: PromotionItem };
  return body?.data ?? null;
}
