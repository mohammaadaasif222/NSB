import type { HelpCenterData } from '@/components/responsible/helpContent';

const API_BASE_URL =
  process.env.API_BASE_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:5000/api';

const FETCH_TIMEOUT_MS = 8000;

/** The Responsible Gambling content and which sections the player may see. */
export async function fetchHelpCenterServer(): Promise<HelpCenterData> {
  const response = await fetch(`${API_BASE_URL}/help-center`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Help Center API responded ${response.status}`);
  }
  const body = (await response.json()) as { data?: HelpCenterData };
  if (!body?.data) {
    throw new Error('Help Center API returned no data');
  }
  return body.data;
}
