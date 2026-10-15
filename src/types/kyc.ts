export type KycStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

/**
 * Who is holding a profile, as disclosed to the PLAYER. Narrower than the
 * backend enum on purpose — see PlayerKycProfileDto.heldBy. `AML` and `ADMIN`
 * both arrive here as `COMPLIANCE`.
 */
export type KycHeldBy = 'PROVIDER' | 'COMPLIANCE';

export type KycGateState =
  | 'NOT_STARTED'
  | 'IN_REVIEW'
  | 'COMPLIANCE_HOLD'
  | 'REJECTED_RETRY'
  | 'REJECTED_FINAL'
  | 'APPROVED';

/**
 * Machine-readable discriminators the withdrawal endpoint returns when a KYC
 * rule refuses a request. Branch on these, never on the message text.
 */
export type KycErrorCode = 'KYC_REQUIRED' | 'KYC_REVIEW_HOLD' | 'TIER_UPGRADE_REQUIRED';

/**
 * The `details` block carried alongside a KYC error code.
 *
 * `requiredLevel` is present on every one of the three codes, so a caller that
 * only wants "which step do I open" can read that single field and ignore the
 * rest.
 */
export interface KycErrorDetails {
  requiredLevel?: number;
  currentTier?: number;
  requiredTier?: number;
  capUsd?: number | null;
  projectedUsd?: number;
  kycStatus?: KycStatus;
  reviewHold?: string | null;
}

export interface PlayerKycProfile {
  id: string;
  userId: string;
  source?: string | null;
  applicantId: string | null;
  levelName: string;
  status: KycStatus;
  isSubmitted: boolean;
  submittedAt: string | null;
  reviewAnswer: string | null;
  reviewRejectType: 'RETRY' | 'FINAL' | null;
  rejectLabels: string[] | null;
  moderationComment: string | null;
  /** Who is holding the profile, if anyone. Null when nothing is. */
  heldBy?: KycHeldBy | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  dob: string | null;
  nationality: string | null;
  docType: string | null;
  docCountry: string | null;
  docValidUntil: string | null;
  lastEvent?: {
    type?: string;
    reviewStatus?: string;
    reviewResult?: {
      reviewAnswer?: string;
      reviewRejectType?: 'RETRY' | 'FINAL';
      rejectLabels?: string[];
      moderationComment?: string;
    };
  };
  addressFormatted?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  /**
   * Why the profile is held. A category only — the detail behind it quotes
   * both sides of a mismatch and never leaves the operator's screen.
   */
  holdReason?:
    | 'IDENTITY_MISMATCH'
    | 'AGE_CHECK'
    | 'DETAILS_MISSING'
    | 'AWAITING_PROVIDER'
    | 'UNDER_REVIEW'
    | null;
  isLevel1Complete?: boolean;
  /**
   * Whether the declared Level 1 identity is on file. When false, the name
   * and date of birth stay editable even after documents were submitted —
   * otherwise a profile held for want of a baseline could never supply one.
   */
  hasIdentityBaseline?: boolean;
  /** Level 2 has been approved at some point; name and date of birth never reopen. */
  identityLocked?: boolean;
  /** A current ID is asked for by this date; Level 2 stays verified until then. */
  refreshDueAt?: string | null;
  refreshReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitLevel1Payload {
  first_name: string;
  last_name: string;
  dob: string;
  country: string;
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
}

export interface SumsubTokenResponse {
  token: string;
  userId: string;
}

/** One progressive verification level above Level 2. */
export interface PlayerKycTier {
  tier: number;
  name: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  /** This level is currently being asked of the player. */
  required: boolean;
  requiredReason: string | null;
  approvedAt: string | null;
  /**
   * When the player actually sent documents for this level.
   *
   * `IN_PROGRESS` only means the widget was opened — minting its token sets
   * that — so this is what separates a level someone is waiting on from one
   * they opened and closed again.
   */
  submittedAt?: string | null;
  /**
   * Player-safe refusal text. Mapped from the tier's `moderation_comment` —
   * the only comment Sumsub permits showing the applicant.
   */
  rejectionReason: string | null;
  /** Someone here has to act; the player need do nothing. */
  onHold: boolean;
  /** When a granted level stops counting and will be asked for again. */
  expiresAt: string | null;
  /** A current document is asked for by this date; the level stays verified until then. */
  refreshDueAt?: string | null;
  refreshReason?: string | null;
  /** There is a configured Sumsub level and the level below is held. */
  canSubmit: boolean;
}

export interface PlayerKycTiers {
  /** When false, levels 3 and 4 are informational only — nothing is enforced. */
  enabled: boolean;
  currentTier: number;
  requiredTier: number;
  /** Lifetime withdrawal ceiling for the current level; null if off or uncapped. */
  capUsd: number | null;
  /** True only when tiers are on and the current level has no ceiling. */
  uncapped: boolean;
  tiers: PlayerKycTier[];
  /**
   * Level 1 or 2 our compliance team has asked of this player and they do
   * not yet hold. Absent on an older server.
   */
  operatorDemand?: { level: number; reason: string } | null;
  /** A liveness re-check staff asked for, while it is the player's to do or under review. */
  liveness?: { status: 'REQUESTED' | 'IN_PROGRESS' | 'FAILED'; requestedAt: string | null } | null;
}
