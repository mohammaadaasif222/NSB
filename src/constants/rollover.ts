import type { TranslationKey } from '@/i18n/locales';
import type { DepositRolloverStatus } from '@/types';

export const ROLLOVER_STATUSES: readonly DepositRolloverStatus[] = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
  'EXPIRED',
  'FORFEITED',
];

export const ROLLOVER_STATUS_KEYS: Record<DepositRolloverStatus, TranslationKey> = {
  NOT_STARTED: 'roll.status.NOT_STARTED',
  IN_PROGRESS: 'roll.status.IN_PROGRESS',
  COMPLETED: 'roll.status.COMPLETED',
  EXPIRED: 'roll.status.EXPIRED',
  FORFEITED: 'roll.status.FORFEITED',
};

export const ROLLOVER_STATUS_STYLE: Record<DepositRolloverStatus, string> = {
  NOT_STARTED: 'bg-white/7 text-white/64',
  IN_PROGRESS: 'bg-[#f9d028]/10 text-[#f9d028]',
  COMPLETED: 'bg-[#35d07f]/10 text-[#35d07f]',
  EXPIRED: 'bg-white/7 text-white/48',
  FORFEITED: 'bg-white/7 text-white/48',
};

export const ROLLOVER_PAGE_SIZE = 10;

export const ROLLOVER_PROGRESSION_LIMIT = 50;
