import type {
  AssessmentBand,
  AssessmentResult,
  ExclusionPeriod,
  GamblingLimit,
  LimitKind,
  LimitPeriod,
  LimitSet,
  SelfExclusionState,
} from '@/types/responsible';
import {
  ASSESSMENT_QUESTIONS,
  ASSESSMENT_THRESHOLDS,
  LIMIT_INCREASE_COOLING_OFF_HOURS,
} from '@/components/responsible/rgContent';

/**
 * ═══════════════════════════════════════════════════════════════════════
 *  NOT WIRED — every function below resolves from an in-memory store.
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  There is no responsible-gambling module in the backend yet (checked:
 *  `rolluck-backend/src/modules` has nothing for limits or exclusion), so
 *  this stands in for one. State lives for the lifetime of the tab and is
 *  gone on reload — deliberately, so nobody mistakes it for persistence.
 *
 *  ───────────────────────────────────────────────────────────────────────
 *  ⚠ READ THIS BEFORE SHIPPING
 *
 *  A limit or a self-exclusion that only exists in the browser is not a
 *  control — it is a picture of one. A player who sets a deposit limit here
 *  and is allowed to deposit anyway has been actively misled, which is worse
 *  than never having offered the feature. Both must be enforced server-side,
 *  at the deposit, wager and login paths, before this section is reachable
 *  in production.
 *
 *  Treat this file as the contract the backend should satisfy.
 *  ───────────────────────────────────────────────────────────────────────
 *
 *  TO WIRE IT UP: replace each body with the `apiService` call named in its
 *  comment and delete the store below. No component imports the store, and
 *  every signature is already async — so nothing above this file changes.
 *
 *    import apiService from './api';
 */

/* ── Mock store ─────────────────────────────────────────────────────── */

const LATENCY_MS = 260;

const settle = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));

const iso = (date: Date): string => date.toISOString();

const hoursFromNow = (hours: number): Date => new Date(Date.now() + hours * 3_600_000);

/** When the window for a period next rolls over. Approximate, as a mock. */
const windowReset = (period: LimitPeriod): string => {
  const days = period === 'daily' ? 1 : period === 'weekly' ? 7 : 30;
  return iso(hoursFromNow(days * 24));
};

/**
 * One player already has a daily deposit limit so the section does not open
 * on an entirely empty state. The rest are unset, which is the real default.
 */
const store: {
  limits: LimitSet;
  exclusion: SelfExclusionState;
  assessment: AssessmentResult | null;
} = {
  limits: {
    deposit: {
      kind: 'deposit',
      period: 'daily',
      amount: '500.00',
      used: '120.00',
      resetsAt: windowReset('daily'),
      pendingAmount: null,
      pendingEffectiveAt: null,
    },
    loss: null,
    wager: null,
    session: null,
  },
  exclusion: { active: false, period: null, startedAt: null, endsAt: null },
  assessment: null,
};

/* ── Limits ─────────────────────────────────────────────────────────── */

/** GET /responsible-gambling/limits */
export const getLimits = (): Promise<LimitSet> => settle({ ...store.limits });

/**
 * PUT /responsible-gambling/limits/:kind
 *
 * The rule the endpoint has to implement, not just the UI:
 *
 *   • A new limit, or a LOWER one, applies immediately.
 *   • A HIGHER one is recorded as pending and applies only once the
 *     cooling-off period has elapsed. Until then the old, lower figure is
 *     the one that must be enforced.
 *
 * Doing this check in the client alone is pointless — anyone can skip it.
 */
export const setLimit = (
  kind: LimitKind,
  period: LimitPeriod,
  amount: string
): Promise<GamblingLimit> => {
  const existing = store.limits[kind];
  const next = Number(amount);
  const current = existing ? Number(existing.amount) : Number.POSITIVE_INFINITY;

  // A period change on an existing limit restarts the window, so it is
  // treated as a new limit rather than compared against the old figure.
  const isIncrease = existing !== null && period === existing.period && next > current;

  if (existing && isIncrease) {
    const updated: GamblingLimit = {
      ...existing,
      pendingAmount: amount,
      pendingEffectiveAt: iso(hoursFromNow(LIMIT_INCREASE_COOLING_OFF_HOURS)),
    };
    store.limits = { ...store.limits, [kind]: updated };
    return settle(updated);
  }

  const applied: GamblingLimit = {
    kind,
    period,
    amount,
    // A tightened limit keeps what has already been spent in the window.
    used: existing && period === existing.period ? existing.used : '0.00',
    resetsAt: existing && period === existing.period ? existing.resetsAt : windowReset(period),
    pendingAmount: null,
    pendingEffectiveAt: null,
  };

  store.limits = { ...store.limits, [kind]: applied };
  return settle(applied);
};

/**
 * DELETE /responsible-gambling/limits/:kind/pending
 *
 * Cancelling a pending increase is itself a tightening, so it is immediate.
 */
export const cancelPendingIncrease = (kind: LimitKind): Promise<GamblingLimit | null> => {
  const existing = store.limits[kind];
  if (!existing) {
    return settle(null);
  }

  const updated: GamblingLimit = { ...existing, pendingAmount: null, pendingEffectiveAt: null };
  store.limits = { ...store.limits, [kind]: updated };
  return settle(updated);
};

/* ── Self-exclusion ─────────────────────────────────────────────────── */

const EXCLUSION_HOURS: Record<Exclude<ExclusionPeriod, 'permanent'>, number> = {
  '24h': 24,
  '7d': 24 * 7,
  '30d': 24 * 30,
  '3m': 24 * 90,
  '6m': 24 * 180,
  '1y': 24 * 365,
  '5y': 24 * 365 * 5,
};

/** GET /responsible-gambling/self-exclusion */
export const getSelfExclusion = (): Promise<SelfExclusionState> => settle({ ...store.exclusion });

/**
 * POST /responsible-gambling/self-exclusion
 *
 * On the server this must also: terminate every live session for the player,
 * settle and return the balance, suppress all marketing for the duration, and
 * block registration of a new account against the same identity. It is not a
 * flag on a row.
 *
 * It must also be irreversible. No support tool should be able to lift it.
 */
export const startSelfExclusion = (
  period: ExclusionPeriod,
  // Recorded for the operator's own review; never used to talk the player out
  // of it. Optional, and the UI says so.
  reason?: string
): Promise<SelfExclusionState> => {
  void reason;

  const next: SelfExclusionState = {
    active: true,
    period,
    startedAt: iso(new Date()),
    endsAt: period === 'permanent' ? null : iso(hoursFromNow(EXCLUSION_HOURS[period])),
  };

  store.exclusion = next;
  return settle(next);
};

/* ── Self-assessment ────────────────────────────────────────────────── */

export const bandFor = (score: number): AssessmentBand => {
  if (score >= ASSESSMENT_THRESHOLDS.high) {
    return 'high';
  }
  return score >= ASSESSMENT_THRESHOLDS.moderate ? 'moderate' : 'low';
};

/** GET /responsible-gambling/assessment/latest */
export const getLastAssessment = (): Promise<AssessmentResult | null> => settle(store.assessment);

/**
 * POST /responsible-gambling/assessment
 *
 * Stored so the player can see it again, and so an operator can see a rising
 * score across repeat assessments. It is a self-reported reflection tool and
 * carries no clinical weight — it must never be used to justify a marketing
 * decision.
 */
export const saveAssessment = (score: number): Promise<AssessmentResult> => {
  const result: AssessmentResult = {
    score,
    total: ASSESSMENT_QUESTIONS.length,
    band: bandFor(score),
    takenAt: iso(new Date()),
  };

  store.assessment = result;
  return settle(result);
};
