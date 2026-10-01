import type { TranslationKey } from '@/i18n/locales';
import type { BonusType, UserBonusStatus } from '@/types';

/**
 * Mirrors the backend's src/constants/bonus.ts — keep the two in step.
 *
 * The API returns campaigns in this order; it is also the order the bonuses
 * page shows them in.
 */
export const BONUS_TYPES: readonly BonusType[] = [
  'DEPOSIT_MATCH',
  'DEPOSIT_BONUS_FREE_SPINS',
  'FREE_SPINS',
  'FREE_SPINS_WAGERING',
  'BONUS_CASH',
  'FREE_BET',
];

/** Typed maps rather than a template string, so a missing translation is a compile error. */
export const BONUS_TITLE_KEYS: Record<BonusType, TranslationKey> = {
  DEPOSIT_MATCH: 'bonus.type.depositMatch',
  DEPOSIT_BONUS_FREE_SPINS: 'bonus.type.depositFreeSpins',
  FREE_SPINS: 'bonus.type.freeSpins',
  FREE_SPINS_WAGERING: 'bonus.type.freeSpinsWagering',
  BONUS_CASH: 'bonus.type.bonusCash',
  FREE_BET: 'bonus.type.freeBet',
};

export const BONUS_DESCRIPTION_KEYS: Record<BonusType, TranslationKey> = {
  DEPOSIT_MATCH: 'bonus.desc.depositMatch',
  DEPOSIT_BONUS_FREE_SPINS: 'bonus.desc.depositFreeSpins',
  FREE_SPINS: 'bonus.desc.freeSpins',
  FREE_SPINS_WAGERING: 'bonus.desc.freeSpinsWagering',
  BONUS_CASH: 'bonus.desc.bonusCash',
  FREE_BET: 'bonus.desc.freeBet',
};

export const BONUS_STATUS_KEYS: Record<UserBonusStatus, TranslationKey> = {
  ACTIVE: 'bonus.status.active',
  COMPLETED: 'bonus.status.completed',
  EXPIRED: 'bonus.status.expired',
  FORFEITED: 'bonus.status.forfeited',
};
