import apiService from './api';
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
import { ASSESSMENT_QUESTIONS, ASSESSMENT_THRESHOLDS } from '@/components/responsible/rgContent';

/**
 * Responsible gambling, backed by the API's responsible-gambling module.
 *
 * Every limit and self-exclusion set here is enforced on the server: deposit
 * limits at the deposit endpoints, wager and loss limits on every stake, and
 * self-exclusion at sign-in. Session-time limits are refused by the API until
 * the platform records time played; the error says so.
 */

const unwrap = <T>(
  res: { success: boolean; data?: T | null; message?: string },
  fallback: string
): T => {
  if (!res.success) throw new Error(res.message || fallback);
  return res.data as T;
};

/* ── Limits ─────────────────────────────────────────────────────────── */

/** GET /responsible-gambling/limits */
export const getLimits = async (): Promise<LimitSet> =>
  unwrap(
    await apiService.get<LimitSet>('/responsible-gambling/limits'),
    'Could not load your limits'
  );

/**
 * PUT /responsible-gambling/limits/:kind
 *
 * A new or lower limit applies at once; a higher one becomes pending until the
 * cooling-off period has passed. The server decides which.
 */
export const setLimit = async (
  kind: LimitKind,
  period: LimitPeriod,
  amount: string
): Promise<GamblingLimit> =>
  unwrap(
    await apiService.put<GamblingLimit>(`/responsible-gambling/limits/${kind}`, { period, amount }),
    'Could not save your limit'
  );

/** DELETE /responsible-gambling/limits/:kind/pending */
export const cancelPendingIncrease = async (kind: LimitKind): Promise<GamblingLimit | null> =>
  unwrap(
    await apiService.delete<GamblingLimit | null>(`/responsible-gambling/limits/${kind}/pending`),
    'Could not cancel the increase'
  ) ?? null;

/* ── Self-exclusion ─────────────────────────────────────────────────── */

/** GET /responsible-gambling/self-exclusion */
export const getSelfExclusion = async (): Promise<SelfExclusionState> =>
  unwrap(
    await apiService.get<SelfExclusionState>('/responsible-gambling/self-exclusion'),
    'Could not load your self-exclusion'
  );

/**
 * POST /responsible-gambling/self-exclusion
 *
 * Signs the player out everywhere on the server, which ends this session too.
 * It cannot be undone or shortened.
 */
export const startSelfExclusion = async (
  period: ExclusionPeriod,
  // Recorded for the operator's own review; never used to talk the player out of it.
  reason?: string
): Promise<SelfExclusionState> =>
  unwrap(
    await apiService.post<SelfExclusionState>('/responsible-gambling/self-exclusion', {
      period,
      reason,
    }),
    'Could not start your self-exclusion'
  );

/* ── Self-assessment ────────────────────────────────────────────────── */

export const bandFor = (score: number): AssessmentBand => {
  if (score >= ASSESSMENT_THRESHOLDS.high) {
    return 'high';
  }
  return score >= ASSESSMENT_THRESHOLDS.moderate ? 'moderate' : 'low';
};

/** GET /responsible-gambling/assessment/latest */
export const getLastAssessment = async (): Promise<AssessmentResult | null> =>
  unwrap(
    await apiService.get<AssessmentResult | null>('/responsible-gambling/assessment/latest'),
    'Could not load your last assessment'
  ) ?? null;

/** POST /responsible-gambling/assessment */
export const saveAssessment = async (score: number): Promise<AssessmentResult> =>
  unwrap(
    await apiService.post<AssessmentResult>('/responsible-gambling/assessment', {
      score,
      total: ASSESSMENT_QUESTIONS.length,
    }),
    'Could not save your assessment'
  );
