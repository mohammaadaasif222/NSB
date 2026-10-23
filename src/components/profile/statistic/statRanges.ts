import type { TranslationKey } from '@/i18n/locales';
import type { StatisticsRange } from '@/types';

export const STAT_RANGES = [
  { key: 'lifetime', labelKey: 'stats.lifetime', apiRange: 'lifetime' },
  { key: 'weekly', labelKey: 'stats.weekly', apiRange: 'week' },
  { key: 'lastMonthly', labelKey: 'stats.lastMonthly', apiRange: 'month' },
  { key: 'last6Month', labelKey: 'stats.last6Month', apiRange: 'six_months' },
  { key: 'yearly', labelKey: 'stats.yearly', apiRange: 'year' },
] as const satisfies readonly {
  key: string;
  labelKey: TranslationKey;
  apiRange: StatisticsRange;
}[];

export type StatRange = (typeof STAT_RANGES)[number]['key'];

export const apiRangeOf = (range: StatRange): StatisticsRange =>
  STAT_RANGES.find((r) => r.key === range)?.apiRange ?? 'lifetime';

export interface StatTile {
  key: string;
  labelKey: TranslationKey;
  value: string;
}
