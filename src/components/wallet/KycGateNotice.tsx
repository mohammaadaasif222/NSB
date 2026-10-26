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
import { useTranslation } from '@/context/I18nContext';
import type { TranslationKey } from '@/i18n/locales';
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
 * something is wrong and the player has to act. In the design's own colour
 * styles: Primary 1 #f9d028 / 2 #ffe779, State Blue #067ff0, State Red #e33827.
 */
const TONES: Record<Tone, { wrap: string; icon: string; badge: string; button: string }> = {
  wait: {
    wrap: 'border-[#067ff0]/30 bg-[#067ff0]/5',
    icon: 'bg-[#067ff0]/15 text-[#067ff0]',
    badge: 'bg-[#067ff0]/15 text-[#067ff0]',
    button: 'border-[#067ff0]/40 bg-[#067ff0]/15 text-[#f0f1f5] hover:bg-[#067ff0]/25',
  },
  warn: {
    wrap: 'border-[#f9d028]/30 bg-[#f9d028]/5',
    icon: 'bg-[#f9d028]/15 text-[#ffe779]',
    badge: 'bg-[#f9d028]/15 text-[#ffe779]',
    button: 'border-[#f9d028]/40 bg-[#f9d028]/15 text-[#ffe779] hover:bg-[#f9d028]/25',
  },
  stop: {
    wrap: 'border-[#e33827]/30 bg-[#e33827]/5',
    icon: 'bg-[#e33827]/15 text-[#e33827]',
    badge: 'bg-[#e33827]/15 text-[#e33827]',
    button: 'border-[#e33827]/40 bg-[#e33827]/15 text-[#f0f1f5] hover:bg-[#e33827]/25',
  },
};

/**
 * Why a profile is being held, in words a player can act on.
 *
 * The backend discloses a category only — the detail behind it quotes both
 * sides of a mismatch and never leaves the operator's screen — so these say
 * what is wrong and what happens next without reproducing the comparison.
 */
const HOLD_REASONS: Record<string, TranslationKey> = {
  IDENTITY_MISMATCH: 'acct.kycGate.holdIdentityMismatch',
  AGE_CHECK: 'acct.kycGate.holdAgeCheck',
  DETAILS_MISSING: 'acct.kycGate.holdDetailsMissing',
  AWAITING_PROVIDER: 'acct.kycGate.holdAwaitingProvider',
  UNDER_REVIEW: 'acct.kycGate.holdUnderReview',
};

type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string;

interface Copy {
  tone: Tone;
  Icon: FC<IconProps>;
  badge: string;
  title: string;
  body: string;
  cta: string;
}

/** Shared by the profile's own hold state and by a `KYC_REVIEW_HOLD` refusal. */
const holdCopy = (profile: PlayerKycProfile | null, t: Translate): Copy => {
  const reason = HOLD_REASONS[profile?.holdReason ?? ''];
  return {
    tone: 'warn',
    Icon: AlertTriangleIcon,
    badge: t('acct.kycGate.badgeManualCheck'),
    title: t('acct.kycGate.holdTitle'),
    body: reason ? t(reason) : t('acct.kycGate.holdDefault'),
    cta: t('acct.kycGate.ctaViewStatus'),
  };
};

const resolveCopy = (
  profile: PlayerKycProfile | null,
  action: Props['action'],
  apiMessage: string | null | undefined,
  errorCode: KycErrorCode | null | undefined,
  t: Translate
): Copy => {
  const isDeposit = action === 'deposit';

  // Checked before the profile: a tier upgrade stops a player whose Level 2 is
  // long since approved, so the profile reads APPROVED and would otherwise
  // resolve to no gate at all.
  if (errorCode === 'TIER_UPGRADE_REQUIRED') {
    return {
      tone: 'warn',
      Icon: LockIcon,
      badge: t('acct.kycGate.badgeUpgrade'),
      title: t('acct.kycGate.upgradeTitle'),
      body:
        apiMessage?.trim() ||
        t(isDeposit ? 'acct.kycGate.upgradeBodyDeposit' : 'acct.kycGate.upgradeBodyWithdraw'),
      cta: t('acct.kycGate.ctaContinue'),
    };
  }

  // Also checked before the profile, and for the same reason: a profile can be
  // APPROVED and still be held, and `resolveKycGateState` reads APPROVED first.
  // Taking the profile's word for it here would tell a verified player that
  // they are unverified.
  if (errorCode === 'KYC_REVIEW_HOLD') {
    return holdCopy(profile, t);
  }

  switch (resolveKycGateState(profile)) {
    case 'IN_REVIEW':
      return {
        tone: 'wait',
        Icon: ClockIcon,
        badge: t('acct.kycGate.badgeInReview'),
        title: t('acct.kycGate.inReviewTitle'),
        body: t(
          isDeposit ? 'acct.kycGate.inReviewBodyDeposit' : 'acct.kycGate.inReviewBodyWithdraw'
        ),
        cta: t('acct.kycGate.ctaViewStatus'),
      };

    case 'COMPLIANCE_HOLD':
      return holdCopy(profile, t);

    case 'REJECTED_RETRY':
      return {
        tone: 'stop',
        Icon: AlertTriangleIcon,
        badge: t('acct.kycGate.badgeActionNeeded'),
        title: t('acct.kycGate.rejectedTitle'),
        body:
          getKycRejectReason(profile, t('acct.kycGate.rejectedBody')) ??
          t('acct.kycGate.rejectedBody'),
        cta: t('acct.kycGate.ctaResubmit'),
      };

    case 'REJECTED_FINAL':
      return {
        tone: 'stop',
        Icon: LockIcon,
        badge: t('acct.kycGate.badgeDeclined'),
        title: t('acct.kycGate.declinedTitle'),
        body: `${
          getKycRejectReason(profile, t('acct.kycGate.declinedReason')) ??
          t('acct.kycGate.declinedReason')
        } ${t('acct.kycGate.declinedBody')}`,
        cta: t('acct.kycGate.ctaViewDetails'),
      };

    // NOT_STARTED, and APPROVED too: this component is only mounted when
    // something is blocking, so an approved profile here means the block came
    // from elsewhere and asking for verification is still the right prompt.
    default: {
      // Level 1 on file but nothing submitted — say what is actually left,
      // rather than asking again for details the player has already given.
      const body = profile?.isLevel1Complete
        ? t(isDeposit ? 'acct.kycGate.level1DoneDeposit' : 'acct.kycGate.level1DoneWithdraw')
        : apiMessage?.trim() ||
          t(isDeposit ? 'acct.kycGate.unverifiedDeposit' : 'acct.kycGate.unverifiedWithdraw');

      return {
        tone: 'warn',
        Icon: ShieldCheckIcon,
        badge: t('acct.kycGate.badgeUnverified'),
        title: t('acct.kycGate.unverifiedTitle'),
        body,
        cta: t('acct.kycGate.ctaVerify'),
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
  const { t } = useTranslation();
  const copy = resolveCopy(profile, action, apiMessage, errorCode, t);
  const tone = TONES[copy.tone];

  const goToVerification = (): void => {
    // Closed first, then navigated — see `onLeave`.
    onLeave?.();
    void router.push(VERIFICATION_HREF);
  };

  return (
    <div className={`rounded-[24px] border p-4 sm:p-5 ${tone.wrap}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 shrink-0 rounded-full p-2 ${tone.icon}`}>
          <copy.Icon size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[16px] font-semibold leading-6 text-[#f0f1f5]">{copy.title}</p>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase leading-5 tracking-wider ${tone.badge}`}
            >
              {copy.badge}
            </span>
          </div>

          <p className="mt-1 text-[14px] leading-5 text-[#9da2b4]">{copy.body}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={goToVerification}
        className={`mt-4 flex h-12 w-full items-center justify-center gap-1.5 rounded-full border text-[16px] font-semibold transition-colors ${tone.button}`}
      >
        {copy.cta}
        <ArrowUpRightIcon size={16} />
      </button>

      {/* The button leaves the wallet, and a player who has just typed an
          address deserves to know that before they press it. */}
      <p className="mt-2 text-center text-[12px] leading-5 text-[#6a7287]">
        {t('acct.kycGate.opensVerification')}
      </p>
    </div>
  );
};

export default KycGateNotice;
