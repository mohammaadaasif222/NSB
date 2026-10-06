import type { TranslationKey } from '@/i18n/locales';

/**
 * Stand-in figures for the Statistic section.
 *
 * NOT WIRED — every number here is invented. The backend records balances but
 * keeps no bet history, so there is nothing to total up: each field below
 * needs a wagering endpoint behind it before it means anything.
 *
 * Kept in its own module so that wiring this up is a change to one file. Swap
 * `STAT_TILES` for the API's response and the components keep working — they
 * already take the tiles as data.
 */

/** How far back a figure is counted. Becomes the query the API is asked. */
export const STAT_RANGES = [
  { key: 'lifetime', labelKey: 'stats.lifetime' },
  { key: 'weekly', labelKey: 'stats.weekly' },
  { key: 'lastMonthly', labelKey: 'stats.lastMonthly' },
  { key: 'last6Month', labelKey: 'stats.last6Month' },
  { key: 'yearly', labelKey: 'stats.yearly' },
] as const satisfies readonly { key: string; labelKey: TranslationKey }[];

export type StatRange = (typeof STAT_RANGES)[number]['key'];

export interface StatTile {
  key: string;
  labelKey: TranslationKey;
  /** Pre-formatted for display — the API should send an exact decimal string. */
  value: string;
}

/**
 * The two headline counts, then the three money figures.
 *
 * Split because the design gives the first row two wide tiles and the second
 * row three narrower ones.
 */
export const HEADLINE_TILES: readonly StatTile[] = [
  { key: 'totalBets', labelKey: 'stats.totalBets', value: '3,742' },
  { key: 'totalWins', labelKey: 'stats.totalWins', value: '1,284' },
];

export const AMOUNT_TILES: readonly StatTile[] = [
  { key: 'bestBetWin', labelKey: 'stats.bestBetWin', value: '$12,450.00' },
  { key: 'bestGameWin', labelKey: 'stats.bestGameWin', value: '$8,320.00' },
  { key: 'totalWagered', labelKey: 'stats.totalWagered', value: '$156,890.50' },
];

/**
 * The range shown in the picker.
 *
 * A fixed string rather than a live date: there is no picker behind it yet, so
 * a range derived from today would drift every day and imply the control does
 * something. Replace with the selected range once the picker is real.
 */
export const MOCK_RANGE_LABEL = '01/01/2026 - 15/05/2026';
