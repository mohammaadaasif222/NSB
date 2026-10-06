/**
 * Responsible gambling — the domain the player-protection tools operate on.
 *
 * Shapes are written as the API should send them, not as the mock happens to
 * hold them: money is a decimal string rather than a number (the wallet does
 * the same — binary floats and balances do not mix), and every instant is an
 * ISO string so the client does the formatting in the player's timezone.
 */

/** What a limit caps. `session` is measured in minutes; the rest in currency. */
export type LimitKind = 'deposit' | 'loss' | 'wager' | 'session';

/** The window a limit is counted over. */
export type LimitPeriod = 'daily' | 'weekly' | 'monthly';

export interface GamblingLimit {
  kind: LimitKind;
  period: LimitPeriod;
  /** The cap. Decimal string, or whole minutes for `session`. */
  amount: string;
  /** Consumed so far in the open window — drives the usage bar. */
  used: string;
  /** ISO. When the open window rolls over and `used` returns to zero. */
  resetsAt: string;
  /**
   * A requested increase that has not taken effect yet.
   *
   * Lowering a limit applies at once; raising one waits out a cooling-off
   * period first, so the decision is never made in the moment it is regretted.
   * Both fields are set together or both are null.
   */
  pendingAmount: string | null;
  pendingEffectiveAt: string | null;
}

/** No limit set for a given kind — the UI shows the "not set" state. */
export type LimitSlot = GamblingLimit | null;

export type LimitSet = Record<LimitKind, LimitSlot>;

/* ------------------------------------------------------------------ */
/* Self-exclusion                                                      */
/* ------------------------------------------------------------------ */

export type ExclusionPeriod = '24h' | '7d' | '30d' | '3m' | '6m' | '1y' | '5y' | 'permanent';

export interface SelfExclusionState {
  active: boolean;
  period: ExclusionPeriod | null;
  /** ISO. */
  startedAt: string | null;
  /** ISO. Null while `period` is `permanent`. */
  endsAt: string | null;
}

/* ------------------------------------------------------------------ */
/* Self-assessment                                                     */
/* ------------------------------------------------------------------ */

/**
 * How a completed self-assessment is summarised.
 *
 * `band` is a prompt to reflect, never a diagnosis — see the wording in
 * `rgContent.ts`, which is deliberately careful about the difference.
 */
export type AssessmentBand = 'low' | 'moderate' | 'high';

export interface AssessmentResult {
  /** How many questions were answered "yes". */
  score: number;
  total: number;
  band: AssessmentBand;
  /** ISO. */
  takenAt: string;
}

/* ------------------------------------------------------------------ */
/* Budget calculator                                                   */
/* ------------------------------------------------------------------ */

/** The calculator runs entirely on the client; nothing is sent anywhere. */
export interface BudgetInput {
  income: string;
  housing: string;
  utilities: string;
  food: string;
  transport: string;
  debts: string;
  savings: string;
  other: string;
}

export interface BudgetResult {
  income: number;
  outgoings: number;
  /** What is left once every essential above is paid. */
  disposable: number;
}
