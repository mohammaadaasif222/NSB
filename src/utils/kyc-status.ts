import type {
  KycErrorCode,
  KycErrorDetails,
  KycGateState,
  PlayerKycProfile,
} from '@/types/kyc';

/**
 * Resolves the player-facing gate state from a KYC profile,
 * according to section 1.4 of SUMSUB_INTEGRATION.md.
 */
export function resolveKycGateState(profile: PlayerKycProfile | null | undefined): KycGateState {
  if (!profile) {
    return 'NOT_STARTED';
  }

  if (profile.status === 'APPROVED') {
    return 'APPROVED';
  }

  if (profile.status === 'REJECTED') {
    return profile.reviewRejectType === 'FINAL' ? 'REJECTED_FINAL' : 'REJECTED_RETRY';
  }

  if (profile.status === 'IN_PROGRESS' || profile.status === 'PENDING_REVIEW') {
    if (!profile.isSubmitted) {
      return 'NOT_STARTED';
    }
    // Checked before the generic in-review state: both look identical on the
    // profile row, but a compliance hold will not clear on its own. Telling a
    // player "we are reviewing it" when the truth is "someone here has to
    // release it" sends them back to poll a page that will never change.
    return profile.heldBy === 'COMPLIANCE' ? 'COMPLIANCE_HOLD' : 'IN_REVIEW';
  }

  return 'NOT_STARTED';
}

const KYC_ERROR_CODES: readonly KycErrorCode[] = [
  'KYC_REQUIRED',
  'KYC_REVIEW_HOLD',
  'TIER_UPGRADE_REQUIRED',
];

export interface KycRequestError {
  code: KycErrorCode;
  message: string;
  details: KycErrorDetails;
  /** Which verification step to open. Defaults to 2 when the API omits it. */
  requiredLevel: number;
}

/**
 * Reads a KYC refusal off a failed request, or returns null if it was not one.
 *
 * The axios interceptor rejects with the response envelope itself, so the
 * error IS the payload — but a thrown network error is not, and older
 * deployments answer without a `details` block. Every shape is handled here so
 * call sites do not each re-derive it.
 *
 * `fallbackMessage` is used when the API sent no wording; callers pass the
 * translated line (this file stays import-free so it runs under `node --test`).
 */
export function readKycError(
  err: unknown,
  fallbackMessage = 'Identity verification is required before you can continue.'
): KycRequestError | null {
  if (!err || typeof err !== 'object') return null;

  const envelope =
    ((err as { response?: { data?: unknown } }).response?.data as Record<string, unknown>) ??
    (err as Record<string, unknown>);

  if (!envelope || typeof envelope !== 'object') return null;

  const nested = envelope.error as Record<string, unknown> | undefined;
  const rawCode = (envelope.code ?? nested?.code) as unknown;
  if (typeof rawCode !== 'string') return null;
  if (!KYC_ERROR_CODES.includes(rawCode as KycErrorCode)) return null;

  const details = (envelope.details ?? {}) as KycErrorDetails;
  const message = typeof envelope.message === 'string' ? envelope.message : fallbackMessage;

  return {
    code: rawCode as KycErrorCode,
    message,
    details,
    // Level 2 is the floor: every KYC refusal implies at least a completed
    // identity check, so an API that sent no level still opens something useful.
    requiredLevel:
      typeof details.requiredLevel === 'number' && details.requiredLevel >= 1
        ? details.requiredLevel
        : 2,
  };
}

/**
 * Extracts a user-friendly rejection explanation. `fallback` is the generic
 * reason when the reviewer left none — callers pass the translated line.
 */
export function getKycRejectReason(
  profile: PlayerKycProfile | null | undefined,
  fallback = 'Verification could not be approved with the provided documents. Please try again with clearer photos.'
): string | null {
  if (!profile || profile.status !== 'REJECTED') {
    return null;
  }

  if (profile.moderationComment?.trim()) {
    return profile.moderationComment.trim();
  }

  if (Array.isArray(profile.rejectLabels) && profile.rejectLabels.length > 0) {
    return profile.rejectLabels
      .map((label) =>
        label
          .replace(/_/g, ' ')
          .toLowerCase()
          .replace(/^\w/, (c) => c.toUpperCase())
      )
      .join(', ');
  }

  return fallback;
}
