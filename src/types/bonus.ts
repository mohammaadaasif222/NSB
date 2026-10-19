/** Mirrors the DTOs in rolluck-backend's bonus module (dto/bonus.dto.ts). */

export type BonusType =
  | 'DEPOSIT_MATCH'
  | 'DEPOSIT_BONUS_FREE_SPINS'
  | 'FREE_SPINS'
  | 'FREE_SPINS_WAGERING'
  | 'BONUS_CASH'
  | 'FREE_BET';

export type UserBonusStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'FORFEITED';

/**
 * One campaign on offer, with whether THIS player can take it.
 *
 * A bonus they cannot claim yet is still listed, with `reason` saying why —
 * "deposit $20 to unlock" is an offer, where a missing card is a dead end.
 * Amounts are exact decimal strings in USD; format them, never add them up.
 */
export interface AvailableBonus {
  id: string;
  name: string;
  description: string | null;
  type: BonusType;
  image_url: string | null;

  /** What they would get given their latest qualifying deposit. Null for spins-only. */
  estimated_amount: string | null;
  match_percentage: number | null;
  min_deposit_amount: string | null;
  max_bonus_amount: string | null;
  wagering_multiplier: string | null;
  max_bet_size: string | null;
  free_spins_count: number | null;

  valid_until: string | null;
  expiry_hours: number | null;

  claimable: boolean;
  reason: string | null;
  /** True when claiming needs a qualifying deposit this player does not have. */
  needs_deposit: boolean;
}

/** One award the player holds, or once held. */
export interface UserBonus {
  id: string;
  status: UserBonusStatus;
  bonus: {
    id: string;
    name: string;
    type: BonusType;
    description: string | null;
    image_url: string | null;
  };

  bonus_amount: string;
  deposit_amount: string | null;
  wagering_required: string;
  wagering_completed: string;
  wagering_remaining: string;
  /** 0-100, one decimal place. 100 when there is no requirement. */
  progress: number;

  free_spins_awarded: number;
  free_spins_used: number;
  free_spins_winnings: string;
  free_bet_amount: string | null;
  free_bet_used: boolean;

  credit_currency: string | null;
  credit_network: string | null;
  credit_amount: string | null;
  is_real_money: boolean;
  max_bet_size: string | null;

  forfeit_reason: string | null;
  claimed_at: string;
  expires_at: string | null;
  completed_at: string | null;
  ended_at: string | null;
  updated_at: string;
}

export type WelcomeStageStatus =
  'UNAVAILABLE' | 'LOCKED' | 'AVAILABLE' | 'CLAIMED' | 'COMPLETED' | 'EXPIRED' | 'FORFEITED';

export type WelcomeStageReasonCode =
  | 'NOT_STARTED'
  | 'ENDED'
  | 'OUT_OF_STOCK'
  | 'NEEDS_DEPOSIT'
  | 'NEEDS_DEPOSIT_MIN'
  | 'DEPOSIT_UNVALUED'
  | 'DEPOSIT_USED'
  | 'DEPOSIT_BELOW_MIN'
  | 'DEPOSIT_ABOVE_MAX'
  | 'WINDOW_CLOSED'
  | 'CLAIM_PREVIOUS'
  | 'WAGER_PREVIOUS'
  | 'AT_LIMIT';

export interface WelcomeStageReasonParams {
  amount?: string;
  minimum?: string;
  maximum?: string;
  stage_sequence?: number;
  count?: number;
}

export interface WelcomeStage {
  sequence: number;
  label: string;
  bonus_id: string | null;
  name: string;
  description: string | null;
  type: BonusType | null;
  image_url: string | null;

  match_percentage: number | null;
  min_deposit_amount: string | null;
  max_deposit_amount: string | null;
  max_bonus_amount: string | null;
  wagering_multiplier: string | null;
  max_bet_size: string | null;
  free_spins_count: number | null;
  expiry_hours: number | null;

  estimated_amount: string | null;
  deposit_amount: string | null;

  status: WelcomeStageStatus;
  claimable: boolean;
  needs_deposit: boolean;
  reason: string | null;
  reason_code: WelcomeStageReasonCode | null;
  reason_params: WelcomeStageReasonParams | null;
  claim_until: string | null;
  award: UserBonus | null;
}

/** GET /bonuses/me — everything the bonuses page needs, in one call. */
export interface BonusSummary {
  server_time: string;
  currency: string;
  /** False when the operator has switched bonuses off platform-wide. */
  enabled: boolean;
  welcome_enabled: boolean;
  regular_enabled: boolean;
  /** Where a grant would be credited — the player's active wallet. */
  payout: { currency_code: string; network_code: string };
  /** How many more awards they may hold at once. */
  slots_remaining: number;
  active: UserBonus[];
  history: UserBonus[];
  available: AvailableBonus[];
  welcome: WelcomeStage[];
}

export interface PublicBonuses {
  server_time: string;
  currency: string;
  enabled: boolean;
  welcome_enabled: boolean;
  regular_enabled: boolean;
  available: AvailableBonus[];
  welcome: WelcomeStage[];
}

export interface BonusesView {
  server_time: string;
  currency: string;
  enabled: boolean;
  welcome_enabled: boolean;
  regular_enabled: boolean;
  slots_remaining: number;
  welcome: WelcomeStage[];
  available: AvailableBonus[];
  active: UserBonus[];
  history: UserBonus[];
}

/** POST /bonuses/claim. */
export interface BonusClaimResult {
  award: UserBonus;
  credited: {
    currency_code: string;
    amount: string;
    usd_amount: string;
    usd_rate: string | null;
  } | null;
}
