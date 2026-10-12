/**
 * Recognising and carrying a fraud step-up challenge.
 *
 * When the risk layer wants a one-time code before letting a request through,
 * the API answers **428 Precondition Required** with a token. The client shows
 * the code prompt and then retries the IDENTICAL request with two extra
 * headers. Nothing about the original body changes — which is what makes this
 * possible to add to a flow without rewriting it.
 *
 * ── This is not KYC ─────────────────────────────────────────────────────
 * Clearing a step-up proves the person holds the account's email or phone. It
 * says nothing about who they are — that is identity verification, and it
 * happens through Sumsub in the KYC flow. The two must never be conflated in
 * anything shown to a player.
 */

/** Header names the retry carries. Must match the backend's reader. */
export const STEP_UP_TOKEN_HEADER = 'X-Step-Up-Token';
export const STEP_UP_OTP_HEADER = 'X-Step-Up-Otp';

/** What the API tells us when it wants a code. */
export interface SeonStepUpChallenge {
  stepUpToken: string;
  /** Seconds the token stays redeemable. */
  expiresIn: number;
  /** Masked destination, e.g. "pl***@example.com". Never the full address. */
  sentTo: string | null;
  /** The flow being challenged, e.g. "withdrawal". */
  action: string;
  message: string;
}

/**
 * The shape the axios response interceptor rejects with.
 *
 * It returns `error.response.data` verbatim, so a 428 arrives as the body the
 * backend built — no status code attached. `code` is therefore what we branch
 * on, not the status.
 */
interface ApiErrorBody {
  code?: string;
  message?: string;
  requiresStepUp?: boolean;
  stepUpToken?: string;
  stepUpExpiresIn?: number;
  sentTo?: string | null;
  action?: string;
}

/** Discriminator the backend sets on a 428. */
const STEP_UP_CODE = 'SEON_STEP_UP_REQUIRED';

/** True when this rejection is a step-up challenge rather than a real failure. */
export function isStepUpRequired(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const body = error as ApiErrorBody;
  return body.code === STEP_UP_CODE && typeof body.stepUpToken === 'string';
}

/**
 * Pull the challenge out of a rejection, or null if it is not one.
 *
 * `fallbackMessage` is shown when the API sent no wording of its own. It is a
 * parameter rather than a translate() call so this file stays free of imports
 * and runs under `node --test` as it is; the provider passes the translated
 * line.
 */
export function extractChallenge(
  error: unknown,
  fallbackMessage = 'Please confirm this with the code we just sent you.'
): SeonStepUpChallenge | null {
  if (!isStepUpRequired(error)) return null;
  const body = error as ApiErrorBody;

  return {
    stepUpToken: body.stepUpToken as string,
    expiresIn: typeof body.stepUpExpiresIn === 'number' ? body.stepUpExpiresIn : 300,
    sentTo: body.sentTo ?? null,
    action: body.action ?? 'request',
    message: body.message ?? fallbackMessage,
  };
}

/**
 * Thrown when the player closes the code prompt instead of completing it.
 *
 * A distinct type so callers can tell "they changed their mind" from "it
 * failed" — cancelling should not raise an error toast, which is exactly the
 * sort of thing that makes a security prompt feel like a malfunction.
 */
export class SeonStepUpCancelledError extends Error {
  constructor() {
    super('Verification cancelled');
    this.name = 'SeonStepUpCancelledError';
  }
}

export const isStepUpCancelled = (error: unknown): boolean =>
  error instanceof SeonStepUpCancelledError ||
  (typeof error === 'object' &&
    error !== null &&
    (error as Error).name === 'SeonStepUpCancelledError');

/** The headers a retry must carry. */
export function stepUpHeaders(token: string, otp: string): Record<string, string> {
  return {
    [STEP_UP_TOKEN_HEADER]: token,
    [STEP_UP_OTP_HEADER]: otp,
  };
}
