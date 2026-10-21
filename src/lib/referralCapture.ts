import { SIGNUP_CODE_PATTERN } from '@/constants/auth';

/**
 * The referral code a visitor arrived with (`?ref=CODE`), kept for 30 days so
 * it still applies if they sign up on a later visit. Every signup path —
 * the form, Google and Telegram — reads it from here.
 */

const KEY = 'rlk_ref';
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

interface Stored {
  code: string;
  at: number;
}

const normalise = (raw: unknown): string | null => {
  if (typeof raw !== 'string') return null;
  const code = raw.trim().toUpperCase();
  return SIGNUP_CODE_PATTERN.test(code) ? code : null;
};

/** Saves the code. True when it differs from the one already held. */
export const captureReferral = (raw: unknown): boolean => {
  const code = normalise(raw);
  if (!code) return false;
  try {
    const previous = storedReferralCode();
    localStorage.setItem(KEY, JSON.stringify({ code, at: Date.now() } satisfies Stored));
    return previous !== code;
  } catch {
    return false;
  }
};

export const storedReferralCode = (): string | null => {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Partial<Stored>;
    if (typeof stored.at !== 'number' || Date.now() - stored.at > TTL_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return normalise(stored.code);
  } catch {
    return null;
  }
};

/** Spread into a social sign-in body; only used when it creates the account. */
export const referralField = (): { referral_code?: string } => {
  const code = storedReferralCode();
  return code ? { referral_code: code } : {};
};

export const clearReferral = (): void => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Storage blocked: nothing was kept.
  }
};
