import type { StaticImageData } from 'next/image';
import type { FixtureSport } from '@/constants/sportsbook';
import type { TranslationKey } from '@/i18n/locales';
import crestArsenal from '@/assets/lobby/sportsbook/crest-arsenal.webp';
import crestChelsea from '@/assets/lobby/sportsbook/crest-chelsea.webp';
import premierLeague from '@/assets/lobby/sportsbook/league-premier.webp';

/*
 * The sportsbook's fixtures — SAMPLE DATA.
 *
 * There is no fixtures or odds feed yet, so this is the design's own sample
 * content: the same Arsenal–Chelsea card it repeats, the three league rows,
 * a basketball score for the tracker. Everything the pages render comes from
 * here, in the shapes a feed would return, so wiring a real one means
 * replacing this module and nothing else.
 *
 * The crests and the league badge are the clubs' and the league's own marks,
 * as the design uses them — placeholders that need a licence (or neutral art)
 * before this goes live.
 */

export type Outcome = 'home' | 'draw' | 'away';

export interface Team {
  name: string;
  crest?: StaticImageData;
}

export interface Fixture {
  id: string;
  sport: FixtureSport;
  /** Short competition name, as the cards show it. */
  league: string;
  home: Team;
  away: Team;
  /** In play at `minute`, or starting at `kickoff` (local "HH:MM"). */
  status: { live: true; minute: number } | { live: false; kickoff: string };
  /** Score so far; null before kick-off or when not reported. */
  score: [number, number] | null;
  odds: Record<Outcome, number>;
  /** Further markets on the match, beyond 1×2. */
  markets: number;
}

export interface League {
  id: string;
  /** The competition's country, as a dictionary key — shown "England - Premier League". */
  country: TranslationKey;
  /** The competition's own name, a proper noun. */
  name: string;
  badge?: StaticImageData;
  fixtures: Fixture[];
}

const ARSENAL: Team = { name: 'Arsenal', crest: crestArsenal };
const CHELSEA: Team = { name: 'Chelsea', crest: crestChelsea };

const DESIGN_ODDS: Record<Outcome, number> = { home: 1.85, draw: 3.4, away: 4.2 };

/** The design's card, the one match every section repeats. */
const ARSENAL_CHELSEA: Fixture = {
  id: 'epl-ars-che',
  sport: 'football',
  league: 'Premier League',
  home: ARSENAL,
  away: CHELSEA,
  status: { live: true, minute: 23 },
  score: null,
  odds: DESIGN_ODDS,
  markets: 45,
};

const REAL_BARCA: Fixture = {
  id: 'liga-rma-bar',
  sport: 'football',
  league: 'La Liga',
  home: { name: 'Real Madrid' },
  away: { name: 'Barcelona' },
  status: { live: true, minute: 67 },
  score: null,
  odds: { home: 1.85, draw: 3.4, away: 4.2 },
  markets: 45,
};

const BAYERN_DORTMUND: Fixture = {
  id: 'bun-bay-bvb',
  sport: 'football',
  league: 'Bundesliga',
  home: { name: 'Bayern Munich' },
  away: { name: 'Dortmund' },
  status: { live: false, kickoff: '15:30' },
  score: null,
  odds: { home: 1.85, draw: 3.4, away: 4.2 },
  markets: 45,
};

/** Other sports, so the Top Sports chips have something to show. */
const OTHER_SPORTS: Fixture[] = [
  {
    id: 'nba-lak-cel',
    sport: 'basketball',
    league: 'NBA',
    home: { name: 'LA Lakers' },
    away: { name: 'Boston Celtics' },
    status: { live: true, minute: 36 },
    score: [78, 72],
    odds: { home: 1.72, draw: 15, away: 2.15 },
    markets: 62,
  },
  {
    id: 'atp-sin-alc',
    sport: 'tennis',
    league: 'ATP Finals',
    home: { name: 'J. Sinner' },
    away: { name: 'C. Alcaraz' },
    status: { live: false, kickoff: '18:00' },
    score: null,
    odds: { home: 1.9, draw: 26, away: 1.95 },
    markets: 38,
  },
  {
    id: 'cs2-nav-fzz',
    sport: 'esports',
    league: 'CS2 Major',
    home: { name: 'NAVI' },
    away: { name: 'FaZe Clan' },
    status: { live: false, kickoff: '20:00' },
    score: null,
    odds: { home: 1.65, draw: 9, away: 2.25 },
    markets: 24,
  },
];

/** n copies of the design's card, as each section draws it. */
const repeat = (fixture: Fixture, n: number): Fixture[] => Array.from({ length: n }, () => fixture);

/** The sportsbook lobby's sections. */
export const LOBBY_SECTIONS = {
  highlights: repeat(ARSENAL_CHELSEA, 4),
  topSports: [...repeat(ARSENAL_CHELSEA, 4), ...OTHER_SPORTS],
  topEvents: repeat(ARSENAL_CHELSEA, 8),
  upcoming: repeat(ARSENAL_CHELSEA, 8),
};

/** A sport page's sections. */
export const SPORT_SECTIONS = {
  featured: repeat(ARSENAL_CHELSEA, 4),
  liveLeagues: repeat(ARSENAL_CHELSEA, 4),
  leagues: Array.from({ length: 5 }, (_, i): League => ({
    id: `epl-${i}`,
    country: 'lobby.sports.england',
    name: 'Premier League',
    badge: premierLeague,
    fixtures: [ARSENAL_CHELSEA, REAL_BARCA, BAYERN_DORTMUND],
  })),
};

/** The Live Match Tracker's game. */
export const TRACKED_MATCH = {
  title: 'LAK vs CEL',
  period: { key: 'lobby.sports.thirdQuarter', clock: '08:14' },
  score: '78 - 72',
  stats: [
    { key: 'sports.totalFouls', value: '4 - 5' },
    { key: 'sports.timeoutsLeft', value: '2 - 1' },
  ],
} as const;

/** Every distinct sample fixture, for search across a page. */
export const ALL_FIXTURES: Fixture[] = [
  ARSENAL_CHELSEA,
  REAL_BARCA,
  BAYERN_DORTMUND,
  ...OTHER_SPORTS,
];
