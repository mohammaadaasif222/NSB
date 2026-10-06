import { useEffect, useState, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import {
  CheckIcon,
  ShieldCheckIcon,
  ClockIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  LockIcon,
  ChevronDownIcon,
} from '@/components/icons';
import KycVerifyModal from '@/components/modals/profile/KycVerifyModal';
import KycLevel1Form from '@/components/profile/kyc/KycLevel1Form';
import ContactCards from '@/components/profile/kyc/ContactCards';
import kycApi from '@/services/kyc.api';
import { resolveKycGateState, getKycRejectReason } from '@/utils/kyc-status';
import { analytics } from '@/services/analytics';
import type { ApiUser } from '@/types/profile';
import type { PlayerKycProfile, PlayerKycTiers } from '@/types/kyc';

/** Longest gap between checks once a verdict is clearly not imminent. */
const POLL_MAX_MS = 120_000;
/** After this, stop asking. The refresh button remains. */
const POLL_GIVE_UP_MS = 60 * 60 * 1000;

interface Props {
  me: ApiUser;
  onChangeEmail: () => void;
}

/**
 * Presentation for the two progressive levels. Status comes from the API; only
 * the wording lives here.
 *
 * Deliberately free of specific limits — the caps are operator-configurable, so
 * printing a number here would be a promise the platform has not made.
 */
const UPPER_TIERS = [
  {
    tier: 3,
    title: 'Proof of Address',
    subtitle: 'Utility bill or bank statement verification',
    body: 'Proof of your current residential address — a utility bill or official bank statement dated within the last 3 months.',
  },
  {
    tier: 4,
    title: 'Source of Funds',
    subtitle: 'Evidence of where your funds come from',
    body: 'Evidence of your source of funds — recent payslips, business accounts, or records of crypto holdings.',
  },
] as const;

/*
 * The account area's shared shapes, pulled out so this tab reads as part of it
 * rather than a different product.
 *
 * Only the surfaces and the type are shared — the colours below stay semantic.
 * Green means approved, gold means waiting, red means something is wrong, and
 * flattening those into the house grey would cost a player the one thing this
 * page is for.
 */
const LEVEL_CARD = 'rl-field-card overflow-hidden rounded-[34px]';
const LEVEL_HEAD =
  'flex w-full flex-col gap-2 px-4.5 py-4 text-start sm:flex-row sm:items-center sm:justify-between sm:gap-3';
/* The status and the chevron drop under the title below `sm`, indented to
   clear the mark. Held beside it they took enough of a phone's ~296 that
   "Personal Information" truncated to "Personal Inf…". */
const LEVEL_META =
  'flex shrink-0 items-center justify-between gap-3 ps-12.5 sm:ps-0 sm:justify-start';
const LEVEL_TITLE = 'text-base leading-6 font-medium text-[#f0f1f5]';
const LEVEL_HINT = 'text-xs leading-5 text-[#9da2b4]';
/** The numbered tile, on the 38px slot every row in the account area uses. */
const LEVEL_MARK =
  'flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-full text-sm leading-5 font-medium';
/** One shape for every status, whatever it is saying. */
const BADGE =
  'inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2.5 text-xs leading-5 font-medium';
/** A panel nested inside a level card — a step quieter, a step tighter. */
const PANEL = 'rounded-3xl p-4.5';
const BODY = 'text-sm leading-5 text-[#9da2b4]';
/** The pill every action in the account area is shaped like. */
const ACTION =
  'inline-flex h-12 items-center gap-2 rounded-full px-5.5 text-base leading-6 font-medium';

const VerificationSection: FC<Props> = ({ me, onChangeEmail }) => {
  const { t } = useTranslation();
  const [kycProfile, setKycProfile] = useState<PlayerKycProfile | null>(null);
  const [tiers, setTiers] = useState<PlayerKycTiers | null>(null);
  /** Which upper tier's Sumsub widget is open, if any. */
  const [tierModal, setTierModal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Accordion active tabs
  const [level1Open, setLevel1Open] = useState(true);
  const [level2Open, setLevel2Open] = useState(false);
  const [level3Open, setLevel3Open] = useState(false);
  const [level4Open, setLevel4Open] = useState(false);

  /**
   * `applyDefaults` positions the accordion for the player's current stage. Only
   * the first load passes it — the 10s review poll must not reopen panels the
   * player has since collapsed.
   */
  const fetchProfile = async (applyDefaults = false) => {
    try {
      const profile = await kycApi.getKycMe();
      setKycProfile(profile);
      if (applyDefaults && profile?.isLevel1Complete) {
        // If Level 1 is already done and Level 2 is not approved, open Level 2 by default
        if (profile.status !== 'APPROVED') {
          setLevel1Open(false);
          setLevel2Open(true);
        }
      }
    } catch {
      // Ignore error, profile stays null (NOT_STARTED)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProfile(true);
    // Supplementary: getTiers resolves to null on failure rather than throwing,
    // so Levels 1 and 2 still render if the tier endpoint is unavailable.
    void kycApi.getTiers().then(setTiers);
  }, []);

  const gateState = resolveKycGateState(kycProfile);
  const [pollingStopped, setPollingStopped] = useState(false);
  // Single source of truth: the same flag the backend gates Level 2 on.
  const isLevel1Complete = Boolean(kycProfile?.isLevel1Complete);

  // A level 3/4 submission is awaiting a verdict, so the page has something to
  // wait for even when Level 2 is long since approved.
  const tierInReview = Boolean(
    tiers?.tiers.some((t) => t.status === 'IN_PROGRESS' || t.status === 'PENDING_REVIEW')
  );

  /**
   * Poll while something is awaiting a verdict, backing off as it goes.
   *
   * A fixed 10-second interval kept asking forever: a player who left the tab
   * open overnight sent ~2,900 requests for a result that had not changed
   * since the first minute, and a provider taking a day to answer would have
   * every waiting player doing the same.
   *
   * Starting at 5s catches the common case — most verdicts land in under a
   * minute — then doubling to a 2-minute ceiling, and stopping altogether
   * after an hour. The refresh button is still there; it just becomes the
   * mechanism after a wait long enough that a person will not be watching.
   */
  useEffect(() => {
    if (gateState !== 'IN_REVIEW' && !tierInReview) return undefined;

    let delay = 5000;
    let elapsed = 0;
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const tick = (): void => {
      if (cancelled) return;

      if (gateState === 'IN_REVIEW') void fetchProfile();
      if (tierInReview) void kycApi.getTiers().then((next) => next && setTiers(next));

      elapsed += delay;
      if (elapsed >= POLL_GIVE_UP_MS) {
        setPollingStopped(true);
        return;
      }

      delay = Math.min(delay * 2, POLL_MAX_MS);
      timer = setTimeout(tick, delay);
    };

    setPollingStopped(false);
    timer = setTimeout(tick, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [gateState, tierInReview]);

  // Absent on accounts the backend has not answered for yet, which for this
  // purpose is the same as not verified.
  const emailVerified = Boolean(me.is_email_verified);

  // How many players reach verification, and how many of them arrive already
  // verified — the base rate the document flow is measured against.
  useEffect(() => {
    analytics.kyc.sectionViewed(emailVerified);
    // Once per visit to the section; the flag is read as it was on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const updated = await kycApi.syncKyc();
      if (updated) {
        setKycProfile(updated);
      }
    } finally {
      setSyncing(false);
    }
  };

  const heading = <h2 className="rl-h-section">{t('profile.verification')}</h2>;

  if (loading) {
    return (
      <div>
        {heading}
        <div className={`${LEVEL_CARD} mt-8 flex items-center justify-center gap-2 p-6 ${BODY}`}>
          <RefreshCwIcon size={16} className="animate-spin text-[#35d07f]" />
          <span>{t('kyc.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {heading}

      <div className="mt-8 space-y-7.5">
        {/* Tiered Verification Section.

            A plain labelled section rather than `FieldGroup`: each level is
            already a card, and nesting them inside another would stack two
            tints for no visual gain. */}
        <section className="space-y-1.5">
          <h3 className="text-base leading-6 font-normal text-[#9da2b4]">{t('kyc.title')}</h3>
          <div className="space-y-3">
            {/* LEVEL 1: Personal Information */}
            <div className={LEVEL_CARD}>
              <button
                type="button"
                onClick={() => setLevel1Open(!level1Open)}
                className={`${LEVEL_HEAD} transition-colors hover:bg-white/5`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className={`${LEVEL_MARK} bg-[#35d07f]/15 text-[#35d07f]`}>1</span>
                  <span className="min-w-0">
                    <span className={`block truncate ${LEVEL_TITLE}`}>{t('kyc.level1Title')}</span>
                    <span className={`block truncate ${LEVEL_HINT}`}>{t('kyc.level1Hint')}</span>
                  </span>
                </span>

                <span className={LEVEL_META}>
                  {isLevel1Complete ? (
                    <span className={`${BADGE} bg-[#35d07f]/15 text-[#35d07f]`}>
                      <CheckIcon size={12} />
                      Complete
                    </span>
                  ) : (
                    <span className={`${BADGE} bg-[#fcd535]/15 text-[#fcd535]`}>Required</span>
                  )}
                  <span
                    className={`text-[#9da2b4] transition-transform duration-200 ${level1Open ? 'rotate-180' : ''}`}
                  >
                    <ChevronDownIcon size={16} />
                  </span>
                </span>
              </button>

              {level1Open && (
                <div className="border-t border-white/8 px-4.5 pt-4 pb-4.5">
                  <KycLevel1Form
                    profile={kycProfile}
                    onSuccess={(updated) => {
                      setKycProfile(updated);
                      setLevel1Open(false);
                      setLevel2Open(true);
                    }}
                  />
                </div>
              )}
            </div>

            {/* LEVEL 2: Upload ID & Liveness Check */}
            <div className={LEVEL_CARD}>
              <button
                type="button"
                onClick={() => {
                  if (isLevel1Complete) {
                    setLevel2Open(!level2Open);
                  }
                }}
                disabled={!isLevel1Complete}
                className={`${LEVEL_HEAD} transition-colors ${
                  !isLevel1Complete
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer hover:bg-white/5'
                }`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={`${LEVEL_MARK} ${
                      !isLevel1Complete
                        ? 'bg-white/7 text-[#9da2b4]'
                        : 'bg-[#4da3ff]/15 text-[#4da3ff]'
                    }`}
                  >
                    {!isLevel1Complete ? <LockIcon size={15} /> : '2'}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-baseline gap-2">
                      <span className={`truncate ${LEVEL_TITLE}`}>{t('kyc.level2Title')}</span>
                      {!isLevel1Complete && (
                        <span className={`shrink-0 ${LEVEL_HINT}`}>(Unlock after Level 1)</span>
                      )}
                    </span>
                    <span className={`block truncate ${LEVEL_HINT}`}>{t('kyc.level2Hint')}</span>
                  </span>
                </span>

                {/* The status changes without the player doing anything — a
                  verdict arrives from the provider while they sit looking at
                  the page. A screen reader has no way to notice that unless
                  the region announces itself. */}
                <span className={LEVEL_META} aria-live="polite" aria-atomic="true">
                  {gateState === 'APPROVED' ? (
                    <span className={`${BADGE} bg-[#35d07f]/15 text-[#35d07f]`}>
                      <CheckIcon size={12} />
                      {t('kyc.statusVerified')}
                    </span>
                  ) : gateState === 'IN_REVIEW' ? (
                    <span className={`${BADGE} bg-[#fcd535]/15 text-[#fcd535]`}>
                      <ClockIcon size={12} />
                      {t('kyc.statusInReview')}
                    </span>
                  ) : gateState === 'COMPLIANCE_HOLD' ? (
                    // Held for a person to release. Without this branch the
                    // chain fell through to "Ready" and the panel below offered
                    // "Start ID & Liveness Verification" — telling a player who
                    // had already submitted, and whose documents were sitting in
                    // the review queue, that they had not started.
                    <span className={`${BADGE} bg-[#fcd535]/15 text-[#fcd535]`}>
                      <ClockIcon size={12} />
                      {t('kyc.statusInReview')}
                    </span>
                  ) : gateState === 'REJECTED_RETRY' ? (
                    <span className={`${BADGE} bg-[#ef4462]/15 text-[#ef4462]`}>
                      <AlertTriangleIcon size={12} />
                      {t('kyc.statusActionRequired')}
                    </span>
                  ) : gateState === 'REJECTED_FINAL' ? (
                    <span className={`${BADGE} bg-[#ef4462]/25 text-[#ef4462]`}>
                      <AlertTriangleIcon size={12} />
                      {t('kyc.statusBlocked')}
                    </span>
                  ) : !isLevel1Complete ? (
                    <span className={`${BADGE} bg-white/10 text-[#9da2b4]`}>
                      <LockIcon size={11} />
                      Locked
                    </span>
                  ) : (
                    <span className={`${BADGE} bg-[#4da3ff]/15 text-[#4da3ff]`}>Ready</span>
                  )}
                  <span
                    className={`text-[#9da2b4] transition-transform duration-200 ${level2Open ? 'rotate-180' : ''}`}
                  >
                    <ChevronDownIcon size={16} />
                  </span>
                </span>
              </button>

              {level2Open && isLevel1Complete && (
                <div className="space-y-4 border-t border-white/8 px-4.5 pt-4 pb-4.5">
                  {gateState === 'APPROVED' ? (
                    <div className={`${PANEL} flex items-center gap-3 bg-[#35d07f]/8`}>
                      <span className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-full bg-[#35d07f]/20 text-[#35d07f]">
                        <ShieldCheckIcon size={20} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-base leading-6 font-medium text-[#35d07f]">
                          {t('kyc.approvedHeading')}
                        </span>
                        <span className={`block ${BODY}`}>
                          {kycProfile?.docType
                            ? `${kycProfile.docType.replace(/_/g, ' ')} (${kycProfile.docCountry || 'Verified'})`
                            : 'Government Document Verified'}
                        </span>
                      </span>
                    </div>
                  ) : gateState === 'IN_REVIEW' ? (
                    <div className={`${PANEL} space-y-3 bg-[#fcd535]/8`}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-base leading-6 font-medium text-[#fcd535]">
                          <ClockIcon size={16} />
                          {t('kyc.inReview')}
                        </span>
                        <button
                          type="button"
                          onClick={handleSync}
                          disabled={syncing}
                          className="rl-chip-active inline-flex h-8 items-center gap-1.5 px-3.75 text-xs leading-5 font-medium text-[#fcd535] disabled:opacity-50"
                        >
                          <RefreshCwIcon size={12} className={syncing ? 'animate-spin' : ''} />
                          {syncing ? t('kyc.syncChecking') : t('kyc.syncStatus')}
                        </button>
                      </div>

                      {/* Said out loud rather than just silently stopping. A
                          page that quietly gave up checking, while still
                          showing "under review", would leave the player
                          waiting on an update that was never coming. */}
                      {pollingStopped && (
                        <p className="text-xs leading-5 text-[#fcd535]/70">
                          {t('kyc.pollingStopped')}
                        </p>
                      )}
                    </div>
                  ) : gateState === 'COMPLIANCE_HOLD' ? (
                    <div className={`${PANEL} space-y-2 bg-[#fcd535]/8`}>
                      <span className="flex items-center gap-2 text-base leading-6 font-medium text-[#fcd535]">
                        <ClockIcon size={16} />
                        {kycProfile?.holdReason === 'IDENTITY_MISMATCH'
                          ? 'Your details do not match your document'
                          : 'Your documents are with our team'}
                      </span>

                      {/*
                        The mismatch case tells the player the CATEGORY and shows
                        them their OWN declaration back — never the name or date
                        of birth our OCR read off the document. Their own input
                        is a safe disclosure and is all an honest person needs:
                        they are holding the ID and can compare. Naming the
                        document's values instead would hand someone using
                        another person's ID the exact string to type next time.
                      */}
                      {kycProfile?.holdReason === 'IDENTITY_MISMATCH' ? (
                        <>
                          <p className={BODY}>
                            The name or date of birth on your account does not match the document
                            you uploaded, so a member of our team is reviewing it. These are the
                            details you gave us:
                          </p>
                          <div className="space-y-0.5 rounded-2xl bg-white/6 px-4 py-3">
                            <p className="text-base leading-6 font-medium text-[#f0f1f5]">
                              {[kycProfile?.firstName, kycProfile?.lastName]
                                .filter(Boolean)
                                .join(' ') || '—'}
                            </p>
                            <p className="text-xs leading-5 text-[#9da2b4]">
                              Date of birth: {kycProfile?.dob || '—'}
                            </p>
                          </div>
                          <p className={BODY}>
                            They must match your ID exactly, including middle names and the spelling
                            as printed. If something above is wrong, contact Customer Support — for
                            your protection these cannot be edited once documents have been
                            submitted.
                          </p>
                        </>
                      ) : (
                        <p className={BODY}>
                          We have received your ID and selfie. This one needs a person to look at it
                          rather than an automated check, so it will not update on its own. We will
                          email you as soon as it is done — there is nothing further for you to do
                          here. If it has been more than a working day, contact Customer Support.
                        </p>
                      )}
                    </div>
                  ) : gateState === 'REJECTED_RETRY' ? (
                    <div className={`${PANEL} space-y-3 bg-[#ef4462]/8`}>
                      <span className="flex items-center gap-2 text-base leading-6 font-medium text-[#ef4462]">
                        <AlertTriangleIcon size={16} />
                        {getKycRejectReason(kycProfile) || t('kyc.rejectedRetry')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setModalOpen(true)}
                        className={`${ACTION} rl-chip-danger text-[#ef4462]`}
                      >
                        Resubmit Documents
                      </button>
                    </div>
                  ) : gateState === 'REJECTED_FINAL' ? (
                    <div className={`${PANEL} space-y-2 bg-[#ef4462]/12`}>
                      <span className="flex items-center gap-2 text-base leading-6 font-medium text-[#ef4462]">
                        <AlertTriangleIcon size={16} />
                        Verification permanently declined
                      </span>
                      <p className={BODY}>
                        {getKycRejectReason(kycProfile) ||
                          'Your identity verification could not be approved.'}{' '}
                        This decision cannot be retried from here — please contact Customer Support
                        if you believe it is a mistake.
                      </p>
                    </div>
                  ) : (
                    <div className={`${PANEL} space-y-3 bg-white/6`}>
                      <p className={BODY}>
                        Please have your official Government ID (Passport, National ID card, or
                        Driver's License) ready. You will also be asked to take a quick interactive
                        3D selfie.
                      </p>
                      <button
                        type="button"
                        onClick={() => setModalOpen(true)}
                        className={`${ACTION} rl-chip-success text-[#35d07f]`}
                      >
                        <ShieldCheckIcon size={16} />
                        {t('kyc.startLevel2')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* LEVELS 3 & 4: driven by real tier state, not markup */}
            {UPPER_TIERS.map((meta) => {
              const state = tiers?.tiers.find((t) => t.tier === meta.tier);
              const isOpen = meta.tier === 3 ? level3Open : level4Open;
              const setOpen = meta.tier === 3 ? setLevel3Open : setLevel4Open;

              const verified = state?.status === 'APPROVED';
              const inReview =
                state?.status === 'PENDING_REVIEW' || state?.status === 'IN_PROGRESS';
              const rejected = state?.status === 'REJECTED';
              const required = Boolean(state?.required) && !verified;

              return (
                <div
                  key={meta.tier}
                  className={`${LEVEL_CARD} ${verified || required ? '' : 'opacity-75'}`}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(!isOpen)}
                    className={`${LEVEL_HEAD} transition-colors hover:bg-white/5`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className={`${LEVEL_MARK} ${
                          verified
                            ? 'bg-[#35d07f]/15 text-[#35d07f]'
                            : required
                              ? 'bg-[#fcd535]/15 text-[#fcd535]'
                              : 'bg-white/7 text-[#9da2b4]'
                        }`}
                      >
                        {verified || required ? meta.tier : <LockIcon size={15} />}
                      </span>
                      <span className="min-w-0">
                        <span className={`block truncate ${LEVEL_TITLE}`}>
                          Level {meta.tier} — {meta.title}
                        </span>
                        <span className={`block truncate ${LEVEL_HINT}`}>{meta.subtitle}</span>
                      </span>
                    </span>

                    <span className={LEVEL_META}>
                      {verified ? (
                        <span className={`${BADGE} bg-[#35d07f]/15 text-[#35d07f]`}>
                          <CheckIcon size={12} />
                          {t('kyc.statusVerified')}
                        </span>
                      ) : inReview ? (
                        <span className={`${BADGE} bg-[#fcd535]/15 text-[#fcd535]`}>
                          <ClockIcon size={12} />
                          {t('kyc.statusInReview')}
                        </span>
                      ) : rejected ? (
                        <span className={`${BADGE} bg-[#ef4462]/15 text-[#ef4462]`}>
                          <AlertTriangleIcon size={12} />
                          {t('kyc.statusActionRequired')}
                        </span>
                      ) : required ? (
                        <span className={`${BADGE} bg-[#fcd535]/15 text-[#fcd535]`}>Required</span>
                      ) : (
                        <span className={`${BADGE} bg-white/10 text-[#9da2b4]`}>
                          <LockIcon size={11} />
                          {t('kyc.statusNotRequired')}
                        </span>
                      )}
                      <span
                        className={`text-[#9da2b4] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      >
                        <ChevronDownIcon size={16} />
                      </span>
                    </span>
                  </button>

                  {isOpen && (
                    <div className={`space-y-2 border-t border-white/8 px-4.5 pt-4 pb-4.5 ${BODY}`}>
                      <p>{meta.body}</p>

                      {required && state?.requiredReason && (
                        <p className="text-[#fcd535]">{state.requiredReason}</p>
                      )}

                      {rejected && (
                        <p className="text-[#ef4462]">
                          The document submitted for this level was not accepted. Reopen the
                          verification to see what was wrong and upload a replacement.
                        </p>
                      )}

                      {state?.canSubmit && !verified && (
                        <button
                          type="button"
                          onClick={() => setTierModal(meta.tier)}
                          className={`${ACTION} mt-1 ${
                            rejected
                              ? 'rl-chip-danger text-[#ef4462]'
                              : 'rl-chip-success text-[#35d07f]'
                          }`}
                        >
                          <ShieldCheckIcon size={16} />
                          {rejected
                            ? 'Resubmit documents'
                            : inReview
                              ? 'Continue verification'
                              : `Start Level ${meta.tier} verification`}
                        </button>
                      )}

                      {required && !state?.canSubmit && (
                        <p>Our compliance team will contact you with what to send and how.</p>
                      )}

                      {!required && !verified && !rejected && !inReview && (
                        <p>
                          {tiers?.enabled
                            ? 'Only requested for higher-volume accounts. We will let you know if it applies to you.'
                            : 'Not currently required on this account.'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* The contact points the KYC check is judged against. */}
        <ContactCards me={me} onChangeEmail={onChangeEmail} />
      </div>

      {/* Sumsub WebSDK Modal — Level 3 / 4 */}
      {tierModal !== null && (
        <KycVerifyModal
          tier={tierModal}
          onClose={() => {
            setTierModal(null);
            void kycApi.syncTiers().then((next) => next && setTiers(next));
          }}
          onSubmitted={() => {
            setTierModal(null);
            void kycApi.syncTiers().then((next) => next && setTiers(next));
          }}
        />
      )}

      {/* Sumsub WebSDK Modal — Level 2 */}
      {modalOpen && (
        <KycVerifyModal
          onClose={() => {
            setModalOpen(false);
            void handleSync();
          }}
          onSubmitted={() => {
            setModalOpen(false);
            void handleSync();
          }}
        />
      )}
    </div>
  );
};

export default VerificationSection;
