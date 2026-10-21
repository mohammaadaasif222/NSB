import type { Tournament } from '@/components/tournaments/TournamentCard';
import type { LeaderboardRow, PodiumPlace } from '@/components/tournaments/TournamentLeaderboard';
import type { PromoCategory, PromoStatus } from '@/components/promotions/PromotionFilters';

import avatarJohn from '@/assets/lobby/avatar-john.webp';
import avatarTony from '@/assets/lobby/avatar-tony.webp';
import avatarWinner from '@/assets/lobby/winner-avatar.webp';

/**
 * The same horse-racing still the promotions frame uses — Figma serves the
 * identical fill on both cards, so the file is shared rather than committed
 * twice under a second name.
 */
import tournamentArt from '@/assets/promotions/promo-horse-racing.webp';

/** A row in the list, plus what the chips and the tabs filter on. */
export interface TournamentRow extends Tournament {
  category: Exclude<PromoCategory, 'all'>;
  status: PromoStatus;
}

/**
 * The tournaments the list draws.
 *
 * PLACEHOLDER. There is no tournaments table and no endpoint, so the headline,
 * the prize pool, the seat count, the artwork and the countdown are the
 * design's own, repeated exactly as the frame repeats them — six live cards.
 *
 * The four-to-two split across the chips is the design's: the All frame draws
 * six cards and the Casino frame draws four of them, so Casino takes the first
 * four and Sports the last two.
 *
 * One thing here is not in the frame and is marked where it is used: the two
 * ended tournaments — four, as the Expired tab's frame draws them, each with
 * the week it ran.
 */
const LIVE: TournamentRow[] = Array.from({ length: 6 }, (_, i) => ({
  id: `tournament-${i + 1}`,
  image: tournamentArt,
  active: true,
  title: 'content.sample.wagerRace',
  prizePool: '$40 000',
  joined: 15,
  capacity: 50,
  endsIn: { day: '05', hr: '12', min: '50', sec: '24' },
  category: i < 4 ? 'casino' : 'sports',
  status: 'live',
}));

/* When the ended ones ran — the frame's own 31/07 to 07/08 first, then a
   week each further back, so the Expired tab has several to open. */
const ENDED_WEEKS: readonly [string, string][] = [
  ['2026-07-31', '2026-08-07'],
  ['2026-07-24', '2026-07-31'],
  ['2026-07-17', '2026-07-24'],
  ['2026-07-10', '2026-07-17'],
];

const EXPIRED: TournamentRow[] = ENDED_WEEKS.map(([startDate, endDate], i) => ({
  id: `tournament-ended-${i + 1}`,
  image: tournamentArt,
  active: false,
  title: 'content.sample.wagerRace',
  prizePool: '$40 000',
  joined: 15,
  capacity: 50,
  endsIn: { day: '00', hr: '00', min: '00', sec: '00' },
  startDate,
  endDate,
  category: i < 2 ? 'casino' : 'sports',
  status: 'expired',
}));

export const TOURNAMENTS: readonly TournamentRow[] = [...LIVE, ...EXPIRED];

export const findTournament = (id: string): TournamentRow | undefined =>
  TOURNAMENTS.find((x) => x.id === id);

/* Lorem, exactly as the frame leaves it — there is no signed-off tournament
   wording to put here, and inventing terms that read as real would be worse
   than leaving the placeholder visible. The frame runs these three blocks in
   this order, the third repeating the first two. */
const LOREM_A =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
const LOREM_B =
  'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra.';

export const TOURNAMENT_TERMS: readonly string[] = [
  LOREM_A,
  LOREM_B,
  `${LOREM_A} ${LOREM_B} ${LOREM_B}`,
];

/**
 * What the ended detail page reports in place of a countdown.
 *
 * PLACEHOLDER, like the rest — the frame's own figures.
 */
export const TOURNAMENT_SUMMARY = {
  /** ISO dates — the page writes them out per locale. */
  startDate: '2026-07-31',
  endDate: '2026-08-07',
  /** How many tournaments the player has entered, as the frame labels it. */
  record: '10',
} as const;

/**
 * The podium and the standings on the ended detail page.
 *
 * PLACEHOLDER. There is no results endpoint, so every name, wager and prize
 * here is the frame's own, in its order.
 *
 * The three portraits are the app's own sample faces rather than the frame's
 * stand-ins: a leaderboard portrait is the player's own avatar in production,
 * so it is data the API supplies and not artwork to carry across.
 */
export const PODIUM: readonly PodiumPlace[] = [
  { rank: 1, name: 'nwk***', wagered: '$87,742.90', points: '2,350', avatar: avatarWinner },
  { rank: 2, name: 'minhzo', wagered: '$76,688.25', points: '1,200', avatar: avatarJohn },
  {
    rank: 3,
    name: 'Hidden',
    wagered: '$19,530.40',
    points: '800',
    avatar: avatarTony,
    masked: true,
  },
];

export const LEADERBOARD: readonly LeaderboardRow[] = [
  { rank: 1, name: 'john**', wager: '$87,742.9', prize: '$1,200' },
  { rank: 2, name: 'Minh**', wager: '$87,742.3', prize: '$850' },
  { rank: 3, name: 'Hidden', wager: '$19,530.4', prize: '$650', masked: true },
  { rank: 4, name: 'Minh**', wager: '$22,145.7', prize: '$720' },
  { rank: 5, name: 'Hidden', wager: '$18,900.2', prize: '$610', masked: true },
  { rank: 6, name: 'Minh**', wager: '$20,300.1', prize: '$675' },
  { rank: 7, name: 'Hidden', wager: '$21,050.9', prize: '$690', masked: true },
  { rank: 8, name: 'john**', wager: '$19,800.0', prize: '$660' },
  { rank: 9, name: 'Hidden', wager: '$23,400.3', prize: '$730', masked: true },
  { rank: 10, name: 'john**', wager: '$700,750.5', prize: '—' },
];
