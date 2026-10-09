import type { FC } from 'react';
import { useRouter } from 'next/router';

import {
  AlertTriangleIcon,
  ArrowUpRightIcon,
  ClockIcon,
  LockIcon,
  ShieldCheckIcon,
  type IconProps,
} from '@/components/icons';
import { getKycRejectReason, resolveKycGateState } from '@/utils/kyc-status';
import type { KycErrorCode, PlayerKycProfile } from '@/types/kyc';

/** Where every one of these leads. One page owns verification; this only points at it. */
const VERIFICATION_HREF = '/profile?section=verification';

interface Props {
  /** The player's KYC profile, or null when they have none yet. */
  profile: PlayerKycProfile | null;
  /** Which wallet action is blocked. Changes one clause of the copy, nothing else. */
  action: 'deposit' | 'withdraw';
  /**
   * Closes the wallet dialog.
   *
   * The wallet is an overlay owned by PlayerTopBar and it outlives a route
   * change — navigating without closing it lands the player on the
   * verification page with the dialog still covering it.
   */
  onLeave?: () => void;
  /**
   * The refusal message the API itself returned, when this gate came from a
   * rejected request rather than from reading the profile. Preferred over the
   * generic copy for the not-started case: the backend knows which level it
   * refused on and says so.
   */
  apiMessage?: string | null;
  /**
   * The refusal's machine-readable code, when there was one. Only
   * `TIER_UPGRADE_REQUIRED` changes what is rendered — an approved player can
   * still be stopped by it, so it cannot be derived from the profile.
   */
  errorCode?: KycErrorCode | null;
}

type Tone = 'wait' | 'warn' | 'stop';

/**
 * Semantic, not decorative — the account area draws verification the same way.
 * Gold means waiting on us, blue means waiting on someone else, red means
 * something is wrong and the player has to act.
 */
const TONES: Record<Tone, { wrap: string; icon: string; badge: string; button: string }> = {
  wait: {
    wrap: 'border-sky-500/30 bg-sky-500/5',
    icon: 'bg-sky-500/15 text-sky-400',
    badge: 'bg-sky-500/15 text-sky-300',
    button: 'border-sky-500/40 bg-sky-500/15 text-sky-100 hover:bg-sky-500/25',
  },
  warn: {
    wrap: 'border-amber-500/30 bg-amber-500/5',
    icon: 'bg-amber-500/15 text-amber-400',
    badge: 'bg-amber-500/15 text-amber-300',
    button: 'border-amber-500/40 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25',
  },
  stop: {
    wrap: 'border-red-500/30 bg-red-500/5',
    icon: 'bg-red-500/15 text-red-400',
    badge: 'bg-red-500/15 text-red-300',
    button: 'border-red-500/40 bg-red-500/15 text-red-100 hover:bg-red-500/25',
  },
};

/**
 * Why a profile is being held, in words a player can act on.
 *
 * The backend discloses a category only — the detail behind it quotes both
 * sides of a mismatch and never leaves the operator's screen — so these say
 * what is wrong and what happens next without reproducing the comparison.
 */
const HOLD_REASONS: Record<string, string> = {
  IDENTITY_MISMATCH:
    "The name or date of birth you entered doesn't match the document you uploaded. Correct your details and we'll check it again.",
  AGE_CHECK: "We're confirming the date of birth on your document meets the 18+ requirement.",
  DETAILS_MISSING:
    'Some of your personal details are missing. Fill them in and the check can carry on.',
  AWAITING_PROVIDER: "We're waiting on a result from our verification partner.",
  UNDER_REVIEW: 'Our compliance team is taking a closer look at your documents.',
};

interface Copy {
  tone: Tone;
  Icon: FC<IconProps>;
  badge: string;
  title: string;
  body: string;
  cta: string;
}

/** Shared by the profile's own hold state and by a `KYC_REVIEW_HOLD` refusal. */
const holdCopy = (profile: PlayerKycProfile | null): Copy => ({
  tone: 'warn',
  Icon: AlertTriangleIcon,
  badge: 'Manual check',
  title: 'Your verification needs a manual check',
  body:
    HOLD_REASONS[profile?.holdReason ?? ''] ??
    "Our compliance team is reviewing your verification. This one won't clear on its own.",
  cta: 'View verification status',
});

const resolveCopy = (
  profile: PlayerKycProfile | null,
  action: Props['action'],
  apiMessage: string | null | undefined,
  errorCode: KycErrorCode | null | undefined
): Copy => {
  const verb = action === 'deposit' ? 'deposit' : 'withdraw';

  // Checked before the profile: a tier upgrade stops a player whose Level 2 is
  // long since approved, so the profile reads APPROVED and would otherwise
  // resolve to no gate at all.
  if (errorCode === 'TIER_UPGRADE_REQUIRED') {
    return {
      tone: 'warn',
      Icon: LockIcon,
      badge: 'Upgrade needed',
      title: 'A higher verification level is required',
      body:
        apiMessage?.trim() ||
        `This ${verb} is above the limit for your current verification level. Completing the next level raises it.`,
      cta: 'Continue verification',
    };
  }

  // Also checked before the profile, and for the same reason: a profile can be
  // APPROVED and still be held, and `resolveKycGateState` reads APPROVED first.
  // Taking the profile's word for it here would tell a verified player that
  // they are unverified.
  if (errorCode === 'KYC_REVIEW_HOLD') {
    return holdCopy(profile);
  }

  switch (resolveKycGateState(profile)) {
    case 'IN_REVIEW':
      return {
        tone: 'wait',
        Icon: ClockIcon,
        badge: 'In review',
        title: 'Your verification is being checked',
        body: `Your documents are with our verification partner. Most checks finish within a few minutes, and you'll be able to ${verb} as soon as it clears.`,
        cta: 'View verification status',
      };

    case 'COMPLIANCE_HOLD':
      return holdCopy(profile);

    case 'REJECTED_RETRY':
      return {
        tone: 'stop',
        Icon: AlertTriangleIcon,
        badge: 'Action needed',
        title: "Your verification couldn't be approved",
        body:
          getKycRejectReason(profile) ??
          'Your documents were not accepted. You can submit them again.',
        cta: 'Fix and resubmit',
      };

    case 'REJECTED_FINAL':
      return {
        tone: 'stop',
        Icon: LockIcon,
        badge: 'Declined',
        title: 'Your verification was declined',
        body: `${
          getKycRejectReason(profile) ?? 'Your documents were not accepted.'
        } This one cannot be resubmitted — our support team can take it further.`,
        cta: 'View details',
      };

    // NOT_STARTED, and APPROVED too: this component is only mounted when
    // something is blocking, so an approved profile here means the block came
    // from elsewhere and asking for verification is still the right prompt.
    default: {
      // Level 1 on file but nothing submitted — say what is actually left,
      // rather than asking again for details the player has already given.
      const body = profile?.isLevel1Complete
        ? `Your personal details are saved. The last step is a photo of your ID and a quick selfie, and then you can ${verb}.`
        : apiMessage?.trim() ||
          `To comply with regulatory standards and protect your account, you need to verify your identity before you can ${verb}. It takes a few minutes.`;

      return {
        tone: 'warn',
        Icon: ShieldCheckIcon,
        badge: 'Unverified',
        title: 'Identity verification required',
        body,
        cta: 'Verify identity',
      };
    }
  }
};

/**
 * The one thing a player sees when a wallet action is blocked on KYC.
 *
 * It explains the hold in the terms the profile actually reports — in review,
 * held by compliance, rejected and why — and then sends them to the account
 * area, which owns every verification step. Nothing is verified in place: the
 * wallet is itself a dialog, and the flow used to open a second one inside it,
 * which stacked two scrims and two close buttons over a form the player could
 * still see through the glass.
 */
const KycGateNotice: FC<Props> = ({ profile, action, onLeave, apiMessage, errorCode }) => {
  const router = useRouter();
  const copy = resolveCopy(profile, action, apiMessage, errorCode);
  const tone = TONES[copy.tone];

  const goToVerification = (): void => {
    // Closed first, then navigated — see `onLeave`.
    onLeave?.();
    void router.push(VERIFICATION_HREF);
  };

  return (
    <div className={`rounded-xl border p-4 ${tone.wrap}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 shrink-0 rounded-lg p-1.5 ${tone.icon}`}>
          <copy.Icon size={16} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold text-white">{copy.title}</p>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${tone.badge}`}
            >
              {copy.badge}
            </span>
          </div>

          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300">{copy.body}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={goToVerification}
        className={`mt-3 flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border text-xs font-semibold transition-colors ${tone.button}`}
      >
        {copy.cta}
        <ArrowUpRightIcon size={13} />
      </button>

      {/* The button leaves the wallet, and a player who has just typed an
          address deserves to know that before they press it. */}
      <p className="mt-2 text-center text-[10px] text-slate-500">
        Opens your account verification page
      </p>
    </div>
  );
};

export default KycGateNotice;
