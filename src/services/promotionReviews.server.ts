import type { ReviewsPage } from '@/services/promotionReviews';
import { REVIEWS_PAGE_SIZE } from '@/services/promotionReviews';

const API_BASE_URL =
  process.env.API_BASE_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:5000/api';

const FETCH_TIMEOUT_MS = 8000;

async function getJson<T>(path: string): Promise<T | undefined> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Promotion reviews API responded ${response.status}`);
  }
  const body = (await response.json()) as { data?: T };
  return body?.data;
}


export async function fetchReviewsServer(promotionId: string): Promise<ReviewsPage | null> {
  try {
    const data = await getJson<ReviewsPage>(
      `/promotion-reviews/${encodeURIComponent(promotionId)}?page=1&limit=${REVIEWS_PAGE_SIZE}`
    );
    return data && Array.isArray(data.data) ? data : null;
  } catch (error) {
    console.error('[promotion-reviews] reviews failed:', error instanceof Error ? error.message : error);
    return null;
  }
}


export async function fetchReviewsEnabledServer(): Promise<boolean> {
  try {
    const data = await getJson<{ enabled: boolean }>('/promotion-reviews/settings');
    return data?.enabled !== false;
  } catch (error) {
    console.error('[promotion-reviews] settings failed:', error instanceof Error ? error.message : error);
    return true;
  }
}
