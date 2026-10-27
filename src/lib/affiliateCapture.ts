/**
 * The Affilka stag a visitor arrived with (`?stag=[partner]_[visit]`), kept
 * for 30 days so it still applies if they sign up on a later visit. A newer
 * affiliate link replaces it (last click wins). Every signup path — the form,
 * Google and Telegram — sends it as `affiliate_tag`.
 */

const KEY = 'rlk_stag';
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const STAG_PATTERN = /^[A-Za-z0-9-]{1,36}_[A-Za-z0-9]{1,24}$/;

interface Stored {
  tag: string;
  at: number;
}

const normalise = (raw: unknown): string | null => {
  if (typeof raw !== 'string') return null;
  const tag = raw.trim();
  return STAG_PATTERN.test(tag) ? tag : null;
};

export const captureAffiliateTag = (raw: unknown): void => {
  const tag = normalise(raw);
  if (!tag) return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ tag, at: Date.now() } satisfies Stored));
  } catch {
    // Storage blocked: the visit is simply not attributed.
  }
};

export const storedAffiliateTag = (): string | null => {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Partial<Stored>;
    if (typeof stored.at !== 'number' || Date.now() - stored.at > TTL_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return normalise(stored.tag);
  } catch {
    return null;
  }
};

/** Spread into any signup body; the backend only uses it when the account is new. */
export const affiliateField = (): { affiliate_tag?: string } => {
  const tag = storedAffiliateTag();
  return tag ? { affiliate_tag: tag } : {};
};

export const clearAffiliateTag = (): void => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Storage blocked: nothing was kept.
  }
};
