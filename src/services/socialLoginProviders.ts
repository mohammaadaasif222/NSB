import apiService from '@/services/api';

/** The social sign-in providers players can be offered (Facebook and WhatsApp are buttons only for now). */
export type SocialLoginProvider = 'google' | 'telegram' | 'facebook' | 'whatsapp' | 'steam';

/** What players got before the admin setting existed — used if the fetch fails. */
export const DEFAULT_SOCIAL_LOGIN_ORDER: SocialLoginProvider[] = [
  'google',
  'telegram',
  'facebook',
  'whatsapp',
  'steam',
];

const KNOWN = new Set<string>(DEFAULT_SOCIAL_LOGIN_ORDER);

const CACHE_MS = 5 * 60_000;

let cached: { at: number; value: Promise<SocialLoginProvider[]> } | null = null;

/** The last answer, readable synchronously so a remount does not flash. */
let last: SocialLoginProvider[] | null = null;

export const peekSocialLoginProviders = (): SocialLoginProvider[] | null => last;

/**
 * The switched-on providers in the admin's order. Falls back to every provider
 * if the request fails: the backend refuses a switched-off provider's sign-ins
 * anyway, so showing one too many is the safe way to be wrong.
 */
export const fetchSocialLoginProviders = (): Promise<SocialLoginProvider[]> => {
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return cached.value;
  }
  const value = apiService
    .get<string[]>('/social-login-providers')
    .then((res) => {
      if (!res?.success || !Array.isArray(res.data)) throw new Error('bad response');
      const order = res.data.filter((p): p is SocialLoginProvider => KNOWN.has(p));
      last = order;
      return order;
    })
    .catch(() => {
      cached = null;
      return last ?? DEFAULT_SOCIAL_LOGIN_ORDER;
    });
  cached = { at: Date.now(), value };
  return value;
};
