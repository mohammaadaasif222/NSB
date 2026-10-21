import type { TranslationKey } from '@/i18n/locales';
import type { RewardClaimStatus, RewardSplit, RewardType } from '@/types';

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

/**
 * The standing copy behind a reward card's info button.
 *
 * Keys rather than strings, so a reward's detail dialog translates with the
 * rest of the page and a key that does not exist is a compile error. Lists are
 * arrays of keys — the same shape `ChatRules` uses — because a translator
 * needs each line as its own unit, and the lines differ in number per reward.
 *
 * What is deliberately absent: the payout split. The API reports the live
 * percentages for the player's tier, so RewardDetailModal builds those lines
 * from `reward.split` instead. Freezing them here would have them disagree
 * with the figure the card pays out the moment a tier's rates are retuned.
 */
export interface RewardDetail {
  subtitleKey: TranslationKey;
  descriptionKey: TranslationKey;
  frequencyKey: TranslationKey;
  /** What the reward is worked out from. */
  calculatedForKeys: readonly TranslationKey[];
  /** What a VIP tier adds. Empty where the reward has no tier perks. */
  vipKeys: readonly TranslationKey[];
  /** Ordered steps to claim. Empty where the reward simply lands. */
  activationKeys: readonly TranslationKey[];
  /** Only Rakeback has one today. */
  boost?: {
    titleKey: TranslationKey;
    durationKey: TranslationKey;
    descriptionKey: TranslationKey;
  };
}

export const REWARD_DETAILS: Record<RewardType, RewardDetail> = {
  RAKEBACK: {
    subtitleKey: 'content.reward.rakeback.subtitle',
    descriptionKey: 'content.reward.rakeback.desc',
    frequencyKey: 'content.reward.rakeback.frequency',
    calculatedForKeys: ['content.reward.rakeback.for1', 'content.reward.rakeback.for2'],
    vipKeys: [],
    activationKeys: [
      'content.reward.rakeback.step1',
      'content.reward.rakeback.step2',
      'content.reward.rakeback.step3',
      'content.reward.rakeback.step4',
    ],
    boost: {
      titleKey: 'content.reward.rakeback.boostTitle',
      durationKey: 'content.reward.rakeback.boostDuration',
      descriptionKey: 'content.reward.rakeback.boostDesc',
    },
  },
  CASHBACK: {
    subtitleKey: 'content.reward.cashback.subtitle',
    descriptionKey: 'content.reward.cashback.desc',
    frequencyKey: 'content.reward.cashback.frequency',
    calculatedForKeys: ['content.reward.cashback.for1'],
    vipKeys: ['content.reward.cashback.vip1', 'content.reward.cashback.vip2'],
    activationKeys: [],
  },
  DAILY: {
    subtitleKey: 'content.reward.daily.subtitle',
    descriptionKey: 'content.reward.daily.desc',
    frequencyKey: 'content.reward.daily.frequency',
    calculatedForKeys: ['content.reward.daily.for1', 'content.reward.daily.for2'],
    vipKeys: ['content.reward.daily.vip1', 'content.reward.daily.vip2'],
    activationKeys: [
      'content.reward.daily.step1',
      'content.reward.daily.step2',
      'content.reward.daily.step3',
    ],
  },
  WEEKLY: {
    subtitleKey: 'content.reward.weekly.subtitle',
    descriptionKey: 'content.reward.weekly.desc',
    frequencyKey: 'content.reward.weekly.frequency',
    calculatedForKeys: ['content.reward.weekly.for1', 'content.reward.weekly.for2'],
    vipKeys: ['content.reward.weekly.vip1', 'content.reward.weekly.vip2'],
    activationKeys: [
      'content.reward.weekly.step1',
      'content.reward.weekly.step2',
      'content.reward.weekly.step3',
    ],
  },
  MONTHLY: {
    subtitleKey: 'content.reward.monthly.subtitle',
    descriptionKey: 'content.reward.monthly.desc',
    frequencyKey: 'content.reward.monthly.frequency',
    calculatedForKeys: ['content.reward.monthly.for1', 'content.reward.monthly.for2'],
    vipKeys: ['content.reward.monthly.vip1', 'content.reward.monthly.vip2'],
    activationKeys: [
      'content.reward.monthly.step1',
      'content.reward.monthly.step2',
      'content.reward.monthly.step3',
    ],
  },
};

/**
 * How a claim divides when there is no live split to go on.
 *
 * `GET /rewards/me` reports the real percentages for the player's own tier,
 * and that is what the detail dialog shows whenever it has them. A signed-out
 * visitor has no summary at all, so the dialog would otherwise have to leave
 * its payout section blank on the one view whose whole job is explaining how
 * the rewards work. These are the documented defaults; null is a reward that
 * lands in the balance whole.
 */
export const REWARD_DEFAULT_SPLIT: Record<RewardType, RewardSplit | null> = {
  RAKEBACK: { instant: 50, weekly: 25, monthly: 25 },
  CASHBACK: { instant: 75, weekly: 0, monthly: 25 },
  DAILY: { instant: 50, weekly: 25, monthly: 25 },
  WEEKLY: null,
  MONTHLY: null,
};
