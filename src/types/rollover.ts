export type DepositRolloverStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

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
  status: DepositRolloverStatus;
  provider: string;

  deposit_amount: string;
  wagering_multiplier: string;
  wagering_required: string;
  wagering_completed: string;
  wagering_remaining: string;
  progress: number;

  deposit: RolloverDeposit;

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
  total_required: string;
  total_completed: string;
  total_remaining: string;
  progress: number;

  locked: string;
  withdrawable: string;
  can_withdraw: boolean;

  open: DepositRollover[];
}
