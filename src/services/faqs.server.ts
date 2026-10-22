import type { FaqItem, PublicFaqs } from '@/services/faqs';

const API_BASE_URL =
  process.env.API_BASE_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:5000/api';

const FETCH_TIMEOUT_MS = 8000;

export async function fetchFaqsServer(): Promise<FaqItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/faqs`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new Error(`FAQ API responded ${response.status}`);
    }
    const body = (await response.json()) as { data?: PublicFaqs };
    const data = body?.data;
    return data?.enabled && Array.isArray(data.faqs) ? data.faqs : [];
  } catch (error) {
    console.error('[faqs] fetch failed:', error instanceof Error ? error.message : error);
    return [];
  }
}
