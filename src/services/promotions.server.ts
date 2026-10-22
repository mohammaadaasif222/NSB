import type { PromotionItem, PromotionsPage } from '@/services/promotions';

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

export async function fetchPromotionsPageServer(query: {
  status: string;
  page: number;
  limit: number;
}): Promise<PromotionsPage> {
  const params = new URLSearchParams({
    status: query.status,
    page: String(query.page),
    limit: String(query.limit),
  });
  const response = await fetch(`${API_BASE_URL}/promotions?${params}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Promotions API responded ${response.status}`);
  }
  const body = (await response.json()) as { data?: PromotionsPage };
  if (!body?.data || !Array.isArray(body.data.data)) {
    throw new Error('Promotions API returned no list');
  }
  return body.data;
}

export async function fetchLivePromotionSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  for (let page = 1, totalPages = 1; page <= totalPages && page <= 20; page += 1) {
    const response = await fetch(`${API_BASE_URL}/promotions?status=live&page=${page}&limit=50`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new Error(`Promotions API responded ${response.status}`);
    }
    const body = (await response.json()) as { data?: PromotionsPage };
    const items = body?.data?.data ?? [];
    slugs.push(...items.map((item) => item.slug).filter(Boolean));
    totalPages = body?.data?.pagination?.totalPages ?? 1;
  }
  return slugs;
}
