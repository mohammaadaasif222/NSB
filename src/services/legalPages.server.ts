import type { LegalPageData } from '@/components/legal/legalContent';

const API_BASE_URL =
  process.env.API_BASE_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:5000/api';

const FETCH_TIMEOUT_MS = 8000;

export interface PublicLegalPages {
  enabled: boolean;
  updated_at: string | null;
  pages: LegalPageData[];
}

/** The pages written in the console, and the System config switch for the page. */
export async function fetchLegalPagesServer(): Promise<PublicLegalPages> {
  const response = await fetch(`${API_BASE_URL}/legal-pages`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Legal pages API responded ${response.status}`);
  }
  const body = (await response.json()) as { data?: PublicLegalPages };
  return body?.data ?? { enabled: true, updated_at: null, pages: [] };
}
