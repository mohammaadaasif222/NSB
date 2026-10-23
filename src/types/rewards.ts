/** Mirrors the DTOs in rolluck-backend's rewards module (dto/rewards.dto.ts). */

import type { PaginationMeta } from './api';

export type RewardType = 'RAKEBACK' | 'CASHBACK' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export type RewardClaimStatus = 'PENDING' | 'CLAIMABLE' | 'CLAIMED' | 'EXPIRED' | 'ROLLED_OVER';

/** GET /vip-levels. Rates and shares are percentages. */
export interface VipTier {
  id: string;
  name: string;
  /** Exact decimal string, in USD — lifetime wagering at which the tier starts. */
  min_wager: string;
  rakeback_percentage: number;
  rakeback_instant_share: number;
  rakeback_weekly_share: number;
  rakeback_monthly_share: number;
  cashback_percentage: number;
  cashback_instant_share: number;
  cashback_monthly_share: number;
  created_at: string;
  updated_at: string;
}

export interface RewardSplit {
  instant: number;
  weekly: number;
  monthly: number;
}

/**
 * One reward on GET /rewards/me.
 *
 * Amounts are exact decimal strings in USD, up to 8 places. Format them;
 * never add them up here.
 */
export interface RewardTypeSummary {
  type: RewardType;
  enabled: boolean;
  /** What a claim would credit right now, as a USD value. */
  claimable_amount: string;
  claimable_total: string;
  claimable_count: number;
  expires_at: string | null;
  pending_amount: string;
  /** When the pending amount turns claimable. */
  available_at: string;
  claimed_total: string;
  rate_percentage: number | null;
  split: RewardSplit | null;
}

/** The wallet a claim is paid into: the player's active currency and network. */
export interface RewardPayoutTarget {
  currency_code: string;
  network_code: string;
}

/** GET /rewards/me */
export interface RewardSummary {
  server_time: string;
  /** Rewards are valued in USD — tiers, rates and every amount here use it. */
  currency: string;
  /** Where a claim lands, converted from USD at the current exchange rate. */
  payout: RewardPayoutTarget;
  lifetime_wagered: string;
  tier: VipTier | null;
  next_tier: VipTier | null;
  /** 0–100 toward the next tier. */
  tier_progress: number;
  /** Wagering still needed to reach `next_tier`; null at the top of the ladder. */
  next_tier_remaining: string | null;
  claimed_total: string;
  rewards: RewardTypeSummary[];
}

/** What a claim actually put in the wallet. */
export interface RewardPayout extends RewardPayoutTarget {
  /** In the payout currency. */
  amount: string;
  /** USD value of one unit of the payout currency at claim time; null when nothing reached the wallet. */
  usd_rate: string | null;
}

/** POST /rewards/claim/:type */
export interface RewardClaimResult {
  type: RewardType;
  claimed_count: number;
  /** USD value credited. */
  credited_amount: string;
  weekly_accrued: string;
  monthly_accrued: string;
  payout: RewardPayout;
}

export interface RewardHistoryItem {
  id: string;
  type: RewardType;
  status: RewardClaimStatus;
  total_amount: string;
  credited_amount: string | null;
  payout_currency: string | null;
  payout_network: string | null;
  payout_amount: string | null;
  vip_level_name: string | null;
  rate_percentage: number | null;
  cycle_starts_at: string;
  cycle_ends_at: string;
  claimable_at: string | null;
  expires_at: string | null;
  claimed_at: string | null;
  updated_at: string;
}

/** GET /rewards/me/history */
export interface RewardHistoryPage {
  data: RewardHistoryItem[];
  pagination: PaginationMeta;
}
