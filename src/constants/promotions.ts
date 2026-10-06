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
  /** Shown on the ended detail page in place of the countdown. */
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
  title: '$20,000 - Clutch Up!',
  body: 'Get your selections settled early if the team you back goes 2 goals up',
  endsIn: { day: '05', hr: '12', min: '50', sec: '24' },
  category: i % 2 === 0 ? 'sports' : 'casino',
  status: 'live',
}));

const ENDED: PromotionRow[] = Array.from({ length: 4 }, (_, i) => ({
  id: `ended-${i + 1}`,
  image: promoArt,
  live: false,
  rating: '4.5',
  title: '$20,000 - Clutch Up!',
  body: 'Get your selections settled early if the team you back goes 2 goals up',
  endsIn: { day: '00', hr: '00', min: '00', sec: '00' },
  category: i % 2 === 0 ? 'sports' : 'casino',
  status: 'expired',
  runs: { from: '31/07/2026', to: '07/08/2026' },
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
  title: 'Endorphina Wager Race',
  rating: '4.5',
  endsIn: { day: '05', hr: '12', min: '50', sec: '24' } satisfies Countdown,

  details: [
    "Discover our exclusive casino promotion designed to bring you unbeatable value and thrilling rewards like never before. Enjoy a generous welcome bonus of up to 200% on your first deposit, plus 50 free spins on our most popular slot games. Loyal members unlock VIP perks including cashback offers, priority withdrawals, and access to high-stakes tournament events every weekend. Whether you're spinning the reels, hitting the blackjack tables, or trying your luck at live dealer games — this limited-time offer is crafted to maximize your winnings and elevate every moment of play.",
    "Discover our exclusive casino promotion designed to bring you unbeatable value and thrilling rewards like never before. Enjoy a generous welcome bonus of up to 200% on your first deposit, plus 50 free spins on our most popular slot games. Loyal members unlock VIP perks including cashback offers, priority withdrawals, and access to high-stakes tournament events every weekend. Whether you're spinning the reels, hitting the blackjack tables, or trying your luck at live dealer games — this limited-time offer is crafted to maximize your winnings and elevate every moment of play.",
    "Discover our exclusive casino promotion designed to bring you unbeatable value and thrilling rewards like never before. Enjoy a generous welcome bonus of up to 200% on your first deposit, plus 50 free spins on our most popular slot games. Loyal members unlock VIP perks including cashback offers, priority withdrawals, and access to high-stakes tournament events every weekend. Whether you're spinning the reels, hitting the blackjack tables, or trying your luck at live dealer games — this limited-time offer is crafted to maximize your winnings and elevate every moment of play.",
  ],

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

export const REVIEWS: readonly Review[] = [
  {
    username: 'johnmathew_154',
    when: '1 day ago',
    stars: 4,
    body: 'The promotion was easy to join and the bonus was credited instantly. Ended up winning more than I expected.',
  },
  {
    username: 'saralynn_23',
    when: '3 hours ago',
    stars: 4,
    body: 'Super smooth sign-up process. The bonus made my week! Highly recommend.',
  },
  {
    username: 'mark_taylor_89',
    when: '2 days ago',
    stars: 4,
    body: "Didn't expect to win, but this promotion really paid off. Instant credit too.",
  },
  {
    username: 'emily_rose77',
    when: '5 hours ago',
    stars: 4,
    body: 'Joining was straightforward and I appreciated how quickly the bonus showed up.',
  },
  {
    username: 'kevin_liu_2020',
    when: '1 week ago',
    stars: 4,
    body: 'Great promotion with instant rewards. It boosted my experience significantly.',
  },
  {
    username: 'olivia_perez',
    when: '12 hours ago',
    stars: 4,
    body: 'The ease of entry and quick bonus credit made this my favorite promotion yet.',
  },
  {
    username: 'david_chen_45',
    when: '4 days ago',
    stars: 4,
    body: 'Fast and reliable! The bonus was credited right away and helped me win big.',
  },
  {
    username: 'natalie_kim',
    when: '6 hours ago',
    stars: 4,
    body: 'A hassle-free promotion with instant bonuses. I ended up winning more than expected.',
  },
  {
    username: 'ryan_smith_101',
    when: '3 days ago',
    stars: 4,
    body: 'Smooth process and quick bonus credit. Definitely participating again next time.',
  },
].map((r, i) => ({ ...r, id: `review-${i + 1}`, avatar: FACES[i % FACES.length] }));
