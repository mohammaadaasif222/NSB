import apiService from '@/services/api';
import type { Locale } from '@/i18n/locales';

/** The pages with a banner slot, as the API names them. */
export type BannerPlacement = 'home' | 'casino' | 'live_casino' | 'sports';

export interface Banner {
  id: string;
  /** The artwork's alternative text, in the reader's language. */
  title: string;
  image_url: string;
  /** A phone's crop; the desktop artwork stands in when null. */
  mobile_image_url: string | null;
  /** A path on the site or an https link; null when the banner is not a link. */
  link_url: string | null;
}

/** A banner the slider can draw; anything else the server sends is skipped. */
const isDrawable = (banner: Banner): boolean =>
  !!banner && typeof banner.id === 'string' && !!banner.image_url;

const CACHE_MS = 60_000;

const cache = new Map<string, { at: number; value: Promise<Banner[]> }>();

/**
 * The live banners for one page, in slider order; empty when staff have set
 * none, and the page keeps its built-in artwork. The answer depends on who is
 * signed in, so the token is part of the cache key.
 */
export const fetchBanners = (
  placement: BannerPlacement,
  locale: Locale,
  token: string | null
): Promise<Banner[]> => {
  const key = `${placement}|${locale}|${token ?? ''}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) {
    return hit.value;
  }
  const value = apiService
    .get<Banner[]>('/banners', { placement, locale })
    .then((res) => (res?.success && Array.isArray(res.data) ? res.data.filter(isDrawable) : []))
    .catch(() => {
      cache.delete(key);
      return [];
    });
  cache.set(key, { at: Date.now(), value });
  return value;
};

/** The visitor opened a banner's link; best effort. */
export function recordBannerClick(id: string): void {
  void apiService.post(`/banners/${id}/click`).catch(() => undefined);
}
