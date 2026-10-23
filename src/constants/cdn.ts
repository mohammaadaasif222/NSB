import type { StaticImageData } from 'next/image';

/**
 * Artwork served from the asset CDN instead of bundled with the app.
 *
 * Marketing re-exports these — payment marks, the wordmark, the lobby banner
 * — without a deploy, so they live on the CDN rather than in `src/assets`.
 *
 * Still the *staging* bucket, and the host is spelt out a second time in
 * `next.config.mjs` (next/image refuses a remote host that is not in its
 * allowlist). Both have to change together when there is a production one.
 */
const ASSET_CDN = 'https://rolluck-staging-assets-2026.fra1.cdn.digitaloceanspaces.com';

/**
 * A CDN image in the shape `next/image` expects from a static import, so call
 * sites keep passing a `StaticImageData` and keep their intrinsic sizing. The
 * dimensions are the file's own — they are what stops the layout shifting
 * while the image loads, so they are measured, not guessed.
 *
 * Path segments are escaped individually: the bucket has files with spaces in
 * their names, and nothing stops the next upload landing among them.
 */
const cdnImage = (path: string, width: number, height: number): StaticImageData => ({
  src: `${ASSET_CDN}/${path.split('/').map(encodeURIComponent).join('/')}`,
  width,
  height,
});

/*
 * The sport renders are deliberately not here. The CDN carries all nineteen
 * under `icon/`, but as JPEGs flattened onto black, and they sit on a
 * translucent tile — so each one came through as a black square. SportsRow
 * keeps the bundled cut-outs until the CDN has versions with alpha.
 */

/* ==================================================================== */
/* Glyphs                                                                */
/* ==================================================================== */

/**
 * Line icons the CDN carries.
 *
 * Only Telegram so far. The bucket was also meant to hold facebook,
 * instagram, whatsapp, gift, wallet and mediarail-suggestion, but every one
 * of those still answers 403, so their call sites keep the bundled SVGs.
 */
export const ICON = {
  telegram: cdnImage('icon/telegram.svg', 24, 24),
};

/* ==================================================================== */
/* Payment marks                                                         */
/* ==================================================================== */

/**
 * The issuers' own artwork. Visa, Apple Pay and Google Pay are not here —
 * those three are still bundled SVGs.
 */
export const PAYMENT_MARK = {
  paypal: cdnImage('icon/paypal.jpeg', 150, 93),
  ebay: cdnImage('icon/ebay.jpeg', 150, 93),
  mastercard: cdnImage('icon/mastercard.jpeg', 150, 93),
  cirrus: cdnImage('icon/cirrus.jpeg', 150, 93),
};

/* ==================================================================== */
/* Brand                                                                 */
/* ==================================================================== */

/** The Rolluck wordmark, as the bar, the rail and the footer draw it. */
export const ROLLUCK_LOGO = cdnImage('icon/rolluck-logo.svg', 228, 48);

/** The promotions artwork behind the casino and sportsbook banner. */
export const LOBBY_BANNER = cdnImage('icon/casino_banner.jpeg', 776, 336);

/** Shadow-free artwork for the lobby's Casino and Sports section cards. */
export const SECTION_ART = {
  casino: cdnImage('icon/casino-roulette.webp', 631, 475),
  sportsbook: cdnImage('icon/sports-football.webp', 506, 503),
};
