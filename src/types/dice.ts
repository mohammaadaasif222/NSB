/** Mirrors rolluck-backend's dice module (modules/dice/dto/dice.dto.ts). */

export type DiceCondition = 'OVER' | 'UNDER';

/** GET /dice/config */
export interface DiceConfig {
  enabled: boolean;
  currency: string;
  rtp: number;
  house_edge: number;
  min_bet: number;
  max_bet: number;
  /** Win-chance bounds, in percent. */
  min_win_chance: number;
  max_win_chance: number;
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
  balance: {
    real: string;
    bonus: string;
  };
}
