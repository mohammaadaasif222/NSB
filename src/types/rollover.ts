export type DepositRolloverStatus =
  'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'FORFEITED';

export type RolloverType = 'DEPOSIT' | 'BONUS';

export interface RolloverBonus {
  award_id: string;
  bonus_id: string;
  name: string;
  type: string;
  bonus_amount: string;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'FORFEITED';
  expires_at: string | null;
}

export interface RolloverDeposit {
  id: string;
  currency_code: string;
  network_code: string;
  amount: string;
  amount_usd: string | null;
  tx_hash: string | null;
  confirmed_at: string | null;
}

export interface DepositRollover {
  id: string;
  type: RolloverType;
  status: DepositRolloverStatus;
  provider: string | null;

  base_amount: string;
  wagering_multiplier: string;
  wagering_required: string;
  wagering_completed: string;
  wagering_remaining: string;
  progress: number;

  deposit: RolloverDeposit | null;
  bonus: RolloverBonus | null;

  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type RolloverBetSource = 'WAGER' | 'GAME_ROUND';

export interface RolloverProgression {
  id: string;
  bet_id: string | null;
  source: RolloverBetSource;
  game_id: string | null;
  bet_amount: string;
  contribution: number;
  wagering_progress: string;
  created_at: string;
}

export interface DepositRolloverDetail extends DepositRollover {
  progressions: RolloverProgression[];
}

export interface RolloverSummary {
  enabled: boolean;
  blocks_withdrawal: boolean;
  multiplier: string;

  open_count: number;
  held_count: number;
  total_required: string;
  total_completed: string;
  total_remaining: string;
  held_remaining: string;
  progress: number;

  locked: string;
  withdrawable: string;
  can_withdraw: boolean;

  open: DepositRollover[];
}
