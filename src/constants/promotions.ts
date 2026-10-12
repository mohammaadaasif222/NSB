import type { Countdown } from '@/components/promotions/CountdownBar';
import type { Promotion } from '@/components/promotions/PromotionCard';
import type { Review } from '@/components/promotions/ReviewCard';
import type { PromoCategory, PromoStatus } from '@/components/promotions/PromotionFilters';

import avatarJohn from '@/assets/lobby/avatar-john.webp';
import avatarTony from '@/assets/lobby/avatar-tony.webp';
import avatarWinner from '@/assets/lobby/winner-avatar.webp';
import promoArt from '@/assets/promotions/promo-horse-racing.webp';

/** A row in the list, and what the detail page needs to pick its state. */
export interface PromotionRow extends Promotion {
  category: Exclude<PromoCategory, 'all'>;
  status: PromoStatus;
  /** Shown on the ended detail page in place of the countdown. ISO dates, formatted per locale. */
  runs?: { from: string; to: string };
}

/**
 * The promotions the list and the detail page share.
 *
 * PLACEHOLDER. There is no promotions table and no endpoint, so the headline,
 * the copy, the rating, the artwork and the countdown are the design's own,
 * repeated exactly as the frame repeats them — eight live cards.
 *
 * Two things here are not in the frame and are marked where they are used: the
 * categories, so the chips filter something rather than sitting inert, and the
 * four ended promotions, so the Expired tab is not a dead end and the design's
 * "Promotions Detail Ended" state is reachable at all.
 */
const LIVE: PromotionRow[] = Array.from({ length: 8 }, (_, i) => ({
  id: `promo-${i + 1}`,
  image: promoArt,
  live: true,
  rating: '4.5',
  title: 'content.promo.clutchTitle',
  body: 'content.promo.clutchBody',
  endsIn: { day: '05', hr: '12', min: '50', sec: '24' },
  category: i % 2 === 0 ? 'sports' : 'casino',
  status: 'live',
}));

const ENDED: PromotionRow[] = Array.from({ length: 4 }, (_, i) => ({
  id: `ended-${i + 1}`,
  image: promoArt,
  live: false,
  rating: '4.5',
  title: 'content.promo.clutchTitle',
  body: 'content.promo.clutchBody',
  endsIn: { day: '00', hr: '00', min: '00', sec: '00' },
  category: i % 2 === 0 ? 'sports' : 'casino',
  status: 'expired',
  runs: { from: '2026-07-31', to: '2026-08-07' },
}));

export const PROMOTIONS: readonly PromotionRow[] = [...LIVE, ...ENDED];

export const findPromotion = (id: string): PromotionRow | undefined =>
  PROMOTIONS.find((p) => p.id === id);

/**
 * The promotion detail page's copy, straight from the design.
 *
 * PLACEHOLDER. There is no promotions table and no endpoint — the route was a
 * "coming soon" page until the list was built — so every string here is the
 * frame's own and the same promotion answers for every slug. Replace with the
 * feed when there is one; the components already take the shapes they need.
 */
export const DETAIL_COPY = {
  title: 'content.sample.wagerRace',
  rating: '4.5',
  endsIn: { day: '05', hr: '12', min: '50', sec: '24' } satisfies Countdown,

  /* The frame repeats the one paragraph three times. */
  details: ['content.promo.detailsBody', 'content.promo.detailsBody', 'content.promo.detailsBody'],

  /* Lorem, exactly as the frame leaves it — there is no signed-off promotion
     wording to put here, and inventing terms that read as real would be worse
     than leaving the placeholder visible. */
  terms: [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra.',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra.',
  ],
} as const;

/**
 * The nine reviews the design draws, with its usernames, scores and copy.
 *
 * PLACEHOLDER, like the rest of the page. The three avatars are the app's own
 * sample faces rather than nine downloaded from the frame — these are stand-in
 * portraits either way, and three is enough to keep the grid from reading as
 * one repeated person.
 */
const FACES = [avatarJohn, avatarTony, avatarWinner];

const REVIEW_ROWS: Omit<Review, 'id' | 'avatar'>[] = [
  {
    username: 'johnmathew_154',
    when: { value: 1, unit: 'day' },
    stars: 4,
    body: 'content.promo.review1',
  },
  {
    username: 'saralynn_23',
    when: { value: 3, unit: 'hour' },
    stars: 4,
    body: 'content.promo.review2',
  },
  {
    username: 'mark_taylor_89',
    when: { value: 2, unit: 'day' },
    stars: 4,
    body: 'content.promo.review3',
  },
  {
    username: 'emily_rose77',
    when: { value: 5, unit: 'hour' },
    stars: 4,
    body: 'content.promo.review4',
  },
  {
    username: 'kevin_liu_2020',
    when: { value: 1, unit: 'week' },
    stars: 4,
    body: 'content.promo.review5',
  },
  {
    username: 'olivia_perez',
    when: { value: 12, unit: 'hour' },
    stars: 4,
    body: 'content.promo.review6',
  },
  {
    username: 'david_chen_45',
    when: { value: 4, unit: 'day' },
    stars: 4,
    body: 'content.promo.review7',
  },
  {
    username: 'natalie_kim',
    when: { value: 6, unit: 'hour' },
    stars: 4,
    body: 'content.promo.review8',
  },
  {
    username: 'ryan_smith_101',
    when: { value: 3, unit: 'day' },
    stars: 4,
    body: 'content.promo.review9',
  },
];

export const REVIEWS: readonly Review[] = REVIEW_ROWS.map((r, i) => ({
  ...r,
  id: `review-${i + 1}`,
  avatar: FACES[i % FACES.length],
}));
