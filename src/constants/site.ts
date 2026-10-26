import { LOCALES, type Locale } from '@/i18n/locales';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://staging.xyzlife.top').replace(
  /\/+$/,
  ''
);

export const SITE_NAME = 'ROLLUCK';

export const DEFAULT_LOCALE: Locale = 'en';

export const OG_LOCALES: Record<Locale, string> = {
  en: 'en_US',
  ar: 'ar_AR',
  tr: 'tr_TR',
  hi: 'hi_IN',
  fr: 'fr_FR',
  ru: 'ru_RU',
  pt: 'pt_PT',
  es: 'es_ES',
  it: 'it_IT',
};

export const localizedPath = (locale: string, path: string): string =>
  locale === DEFAULT_LOCALE ? path : `/${locale}${path === '/' ? '' : path}`;

export const localizedUrls = (path: string): { locale: Locale; url: string }[] =>
  LOCALES.map((locale) => ({ locale, url: absoluteUrl(localizedPath(locale, path)) }));

export const DEFAULT_SHARE_IMAGE = { url: '/og-default.jpg', width: 1200, height: 630 };

export const SITE_LOGO = '/icon-512.png';

export const INDEXED_STATIC_PATHS = [
  '/',
  '/casino',
  '/providers',
  '/live-casino',
  '/promotions',
  '/bonuses',
  '/rewards',
  '/terms-of-service',
  '/responsible-gambling',
  '/rolluck-oath',
] as const;

export const NOINDEX_ROUTES: ReadonlySet<string> = new Set([
  '/404',
  '/_error',
  '/referral',
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/auth/steam-callback',
  '/auth/unauthorized',
  '/blogs',
  '/blogs/[slug]',
  '/favourites',
  '/my-bets',
  '/profile',
  '/recents',
  '/responsible-play',
  '/sports',
  '/sports/[sport]',
  '/tournaments',
  '/tournaments/[slug]',
  '/vip-club',
  '/wallet',
]);

export const absoluteUrl = (pathOrUrl: string): string =>
  /^https?:\/\//i.test(pathOrUrl)
    ? pathOrUrl
    : `${SITE_URL}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;

export const stripQuery = (asPath: string): string => asPath.split(/[?#]/)[0] || '/';

export const clip = (text: string, max = 160): string => {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= max) {
    return flat;
  }
  const cut = flat.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:–—-]+$/, '')}…`;
};
