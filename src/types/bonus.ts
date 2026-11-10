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
  claim_by?: string | null;
  claim_mode?: 'AUTOMATIC' | 'ON_CLAIM' | 'OPT_IN';
  opt_in?: { status: 'OPTED_IN' | 'OPTED_OUT'; expires_at: string | null } | null;
  provider_shares?: { provider: string; share: number }[];
  blocked_products?: ('CASINO' | 'ORIGINALS' | 'SPORTSBOOK')[];
  texts?: DisplayTexts<RegularBonusTextField>;
  terms_slug?: string | null;
  group?: {
    id: string;
    name: string;
    max_per_player: number;
    pick_mode: 'PLAYER_PICKS' | 'AUTOMATIC';
  } | null;
}

export interface RedeemResult {
  kind: 'BONUS' | 'PROMOTION';
  bonus_id: string | null;
  program_id?: string;
  award_id: string | null;
  opted_in: boolean;
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
  welcome?: boolean;
  max_convertible?: string | null;
  released_usd?: string | null;
  captured_usd?: string | null;
  category?: 'PLAYABLE' | 'LOCKED';
  release_mode?: 'ALL_AT_ONCE' | 'STEPS' | 'CONTINUOUS';
  steps_total?: number;
  steps_released?: number;
  next_step_at?: string | null;
  locked_amount?: string;
  sticky?: boolean;
  comment?: string | null;

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

export interface WelcomeOfferOption {
  id: string;
  name: string;
  description: string | null;
  match_percentage: number;
  max_bonus_amount: string | null;
  wagering_multiplier: string;
  max_convertible: string | null;
  texts: DisplayTexts<'title' | 'details'>;
}

export type DisplayTexts<F extends string> = Partial<Record<string, Partial<Record<F, string>>>>;

export type WelcomeOfferTextField = 'title' | 'hint' | 'banner_headline' | 'banner_body';

export type WelcomeChoiceStatus = 'PENDING' | 'DECLINED' | 'APPLIED';

export interface WelcomeOffer {
  enabled: boolean;
  min_deposit: string;
  deposit_count: number;
  max_bet: string;
  validity_days: number;
  currency: string;
  options: WelcomeOfferOption[];
  choice: { bonus_id: string | null; status: WelcomeChoiceStatus; chosen_at: string } | null;
  deposits_made: number;
  eligible: boolean;
  locked: boolean;
  award: UserBonus | null;
  contributions: WelcomeContributions | null;
  texts: DisplayTexts<WelcomeOfferTextField>;
  terms_slug: string | null;
  withdrawal_cancels: string[];
}

export interface WelcomeContributions {
  rules: {
    game_id: string | null;
    category: string | null;
    provider: string | null;
    contribution: number;
  }[];
  max_rtp: number | null;
}

export type RegularBonusTextField = 'name' | 'description' | 'terms';

export interface BonusTrail {
  award_id: string;
  rollover_id: string | null;
  bets: {
    bet_id: string | null;
    source: string;
    game_id: string | null;
    game: string | null;
    bet_amount: string;
    counted_amount: string | null;
    contribution: number;
    wagering_progress: string;
    penalty_added: string | null;
    created_at: string;
  }[];
}

export type BonusMovementKind =
  'CREDITED' | 'FREE_SPINS' | 'RELEASED' | 'CAPTURED' | 'EXPIRED' | 'FORFEITED';

export interface BonusMovement {
  award_id: string;
  bonus_id: string;
  bonus: string;
  kind: BonusMovementKind;
  wallet: 'REAL' | 'BONUS';
  amount: string | null;
  at: string;
  note: string | null;
}

export interface BonusMovementsPage {
  data: BonusMovement[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface ActiveBonusTerms {
  game_id: string | null;
  bonuses: {
    award_id: string;
    name: string;
    welcome: boolean;
    stakes_counted: string;
    progress: number;
    wagering_remaining: string;
    max_bet: string | null;
    expires_at: string | null;
    rules: WelcomeContributions['rules'];
    exact_rules: boolean;
    max_rtp: number | null;
    game: { contribution: number; eligible: boolean } | null;
  }[];
}

export interface DepositBonusOffer {
  id: string;
  name: string;
  type: BonusType;
  match_percentage: number | null;
  min_deposit_amount: string | null;
  max_deposit_amount: string | null;
  max_bonus_amount: string | null;
  wagering_multiplier: string | null;
  max_bet_size: string | null;
  max_convertible: string | null;
  expiry_hours: number | null;
  estimated_amount: string | null;
  available: boolean;
  reason: string | null;
  texts: DisplayTexts<RegularBonusTextField>;
  terms_slug: string | null;
  payment_methods: string[];
  deposit_currencies: string[];
}

export interface DepositBonusOffers {
  choice: { bonus_id: string; status: string; chosen_at: string; reason: string | null } | null;
  offers: DepositBonusOffer[];
}
