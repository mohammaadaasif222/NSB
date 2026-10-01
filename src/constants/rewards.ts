import type { TranslationKey } from '@/i18n/locales';
import type { RewardClaimStatus, RewardType } from '@/types';

/**
 * Mirrors the backend's src/constants/rewards.ts — keep the two in step.
 *
 * The API returns rewards in this order; it is also the order the tray and the
 * rewards page show them in.
 */
export const REWARD_TYPES: readonly RewardType[] = [
  'RAKEBACK',
  'CASHBACK',
  'DAILY',
  'WEEKLY',
  'MONTHLY',
];

/** Typed maps rather than a template string, so a missing translation is a compile error. */
export const REWARD_TITLE_KEYS: Record<RewardType, TranslationKey> = {
  RAKEBACK: 'rewards.type.rakeback',
  CASHBACK: 'rewards.type.cashback',
  DAILY: 'rewards.type.daily',
  WEEKLY: 'rewards.type.weekly',
  MONTHLY: 'rewards.type.monthly',
};

export const REWARD_DESCRIPTION_KEYS: Record<RewardType, TranslationKey> = {
  RAKEBACK: 'rewards.desc.rakeback',
  CASHBACK: 'rewards.desc.cashback',
  DAILY: 'rewards.desc.daily',
  WEEKLY: 'rewards.desc.weekly',
  MONTHLY: 'rewards.desc.monthly',
};

export const REWARD_STATUS_KEYS: Record<RewardClaimStatus, TranslationKey> = {
  PENDING: 'rewards.status.pending',
  CLAIMABLE: 'rewards.status.claimable',
  CLAIMED: 'rewards.status.claimed',
  EXPIRED: 'rewards.status.expired',
  ROLLED_OVER: 'rewards.status.rolledOver',
};

/** The URL segment the claim endpoint takes: POST /rewards/claim/rakeback. */
export const rewardSlug = (type: RewardType): string => type.toLowerCase();

/**
 * The server settles cycle boundaries on a pass every 15 seconds. A client
 * refetching right at a boundary would still see the old state, so it waits
 * this long past one first.
 */
export const REWARD_SETTLE_GRACE_MS = 20_000;
