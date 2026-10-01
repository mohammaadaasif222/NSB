/** Mirrors rolluck-backend's dice module (modules/dice/dto/dice.dto.ts). */

export type DiceCondition = 'OVER' | 'UNDER';

/** GET /dice/config */
export interface DiceConfig {
  /** True only while the "Demo dice" setting is on and the catalogue game is active. */
  enabled: boolean;
  /** Bets are play money, valued in this currency (USD). */
  currency: string;
  rtp: number;
  house_edge: number;
  min_bet: number;
  max_bet: number;
  /** Win-chance bounds, in percent. */
  min_win_chance: number;
  max_win_chance: number;
}

export interface DiceAccrual {
  /** Exact decimal string, 8 places. */
  pending_amount: string;
  cycle_ends_at: string;
}

/** POST /dice/roll. Money and roll figures are exact decimal strings. */
export interface DiceRoll {
  id: string;
  roll: string;
  target: string;
  condition: DiceCondition;
  win_chance: string;
  multiplier: string;
  won: boolean;
  amount: string;
  payout: string;
  /** Negative on a loss. */
  profit: string;
  created_at: string;
  rewards: {
    lifetime_wagered: string;
    tier: string | null;
    rakeback: DiceAccrual | null;
    cashback: DiceAccrual | null;
  };
}
