import { useEffect, useState, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { SECTION_HEADING } from '@/components/profile/SectionShell';
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
import { countryName } from '@/constants/countries';
import kycApi from '@/services/kyc.api';
import { resolveKycGateState, getKycRejectReason } from '@/utils/kyc-status';
import { analytics } from '@/services/analytics';
import type { ApiUser } from '@/types/profile';
import type { PlayerKycProfile, PlayerKycTiers } from '@/types/kyc';
import type { TranslationKey } from '@/i18n/locales';

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
    title: 'acct.verify.tier3Title',
    subtitle: 'acct.verify.tier3Subtitle',
    body: 'acct.verify.tier3Body',
  },
  {
    tier: 4,
    title: 'acct.verify.tier4Title',
    subtitle: 'acct.verify.tier4Subtitle',
    body: 'acct.verify.tier4Body',
  },
] as const satisfies readonly {
  tier: number;
  title: TranslationKey;
  subtitle: TranslationKey;
  body: TranslationKey;
}[];

/** Sumsub's document types, as a player would name them. Unknown types fall back to the raw value. */
const DOC_TYPE_LABELS: Record<string, TranslationKey> = {
  PASSPORT: 'acct.verify.docPassport',
  ID_CARD: 'acct.verify.docIdCard',
  DRIVERS: 'acct.verify.docDrivers',
  DRIVERS_LICENSE: 'acct.verify.docDrivers',
  RESIDENCE_PERMIT: 'acct.verify.docResidencePermit',
};

/*
 * The account area's shared shapes, pulled out so this tab reads as part of it
 * rather than a different product.
 *
 * Only the surfaces and the type are shared — the colours below stay semantic.
 * Green means approved, gold means waiting, red means something is wrong, and
 * flattening those into the house grey would cost a player the one thing this
 * page is for.
 */
const LEVEL_CARD = 'rl-field-card overflow-hidden rounded-[calc(var(--u)*34)] max-lg:![box-shadow:none] max-lg:before:hidden';
const LEVEL_HEAD =
  'flex w-full flex-col gap-[calc(var(--u)*8)] px-[calc(var(--u)*18)] py-[calc(var(--u)*16)] text-start sm:flex-row sm:items-center sm:justify-between sm:gap-[calc(var(--u)*12)]';
/* The status and the chevron drop under the title below `sm`, indented to
   clear the mark. Held beside it they took enough of a phone's ~296 that
   "Personal Information" truncated to "Personal Inf…". */
const LEVEL_META =
  'flex shrink-0 items-center justify-between gap-[calc(var(--u)*12)] ps-[calc(var(--u)*50)] sm:ps-0 sm:justify-start';
const LEVEL_TITLE =
  'text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-medium text-[#f0f1f5]';
const LEVEL_HINT =
  'text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[1.67] text-[#9da2b4]';
/** The numbered tile, on the 38px slot every row in the account area uses. */
const LEVEL_MARK =
  'flex h-[calc(var(--u)*38)] w-[calc(var(--u)*38)] shrink-0 items-center justify-center rounded-full text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[1.43] font-medium';
/** One shape for every status, whatever it is saying. */
const BADGE =
  'inline-flex h-[calc(var(--u)*24)] shrink-0 items-center gap-[calc(var(--u)*4)] rounded-full px-[calc(var(--u)*10)] text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[1.67] font-medium';
/** A panel nested inside a level card — a step quieter, a step tighter. */
const PANEL = 'rounded-3xl p-[calc(var(--u)*18)]';
const BODY = 'text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[1.43] text-[#9da2b4]';
/** The pill every action in the account area is shaped like. */
const ACTION =
  'inline-flex h-[calc(var(--u)*48)] items-center gap-[calc(var(--u)*8)] rounded-full px-[calc(var(--u)*22)] text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-medium';

const VerificationSection: FC<Props> = ({ me, onChangeEmail }) => {
  const { t, locale } = useTranslation();
  const [kycProfile, setKycProfile] = useState<PlayerKycProfile | null>(null);
  const [tiers, setTiers] = useState<PlayerKycTiers | null>(null);
  /** Which upper tier's Sumsub widget is open, if any. */
  const [tierModal, setTierModal] = useState<number | null>(null);
  const [livenessOpen, setLivenessOpen] = useState(false);
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

  /**
   * Both halves of the page, which no action only ever touches one of:
   * approving Level 2 is what unlocks Level 3, and a Level 3 verdict can carry
   * a hold that belongs to the profile.
   */
  const refreshAll = async (applyDefaults = false): Promise<void> => {
    await Promise.all([
      fetchProfile(applyDefaults),
      // Supplementary: resolves to null on failure rather than throwing, so
      // Levels 1 and 2 still render if the tier endpoint is unavailable.
      kycApi.getTiers().then((next) => next && setTiers(next)),
    ]);
  };

  useEffect(() => {
    void refreshAll(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * The seconds after the player does something, when one refetch is not
   * enough.
   *
   * Closing the widget refreshes immediately, but the provider's own status
   * change usually arrives a moment after that call has already returned the
   * state as it was — so the card settled on "not started" for a level that
   * had just been submitted, and only a reload corrected it. Three decreasing
   * nudges cover the gap; the ordinary review poll takes over from there.
   */
  const [lastAction, setLastAction] = useState(0);

  useEffect(() => {
    if (!lastAction) return undefined;

    const timers = [1200, 4000, 10_000].map((ms) => setTimeout(() => void refreshAll(), ms));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastAction]);

  /** Marks an action as just taken: refresh now, then settle. */
  const refreshAfterAction = (): void => {
    void refreshAll();
    setLastAction((n) => n + 1);
  };

  /**
   * Coming back to the tab. An operator can grant, reject or withdraw a level
   * while the player is looking at another tab, and nothing on this page would
   * otherwise learn of it until a reload — the poll only runs while something
   * is awaiting a verdict.
   */
  useEffect(() => {
    const onVisible = (): void => {
      if (document.visibilityState === 'visible') void refreshAll();
    };

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gateState = resolveKycGateState(kycProfile);
  // Level 1 or 2 asked of this player by our compliance team. The server drops
  // it once the level is held.
  const operatorDemand = tiers?.operatorDemand ?? null;
  const [pollingStopped, setPollingStopped] = useState(false);
  // Single source of truth: the same flag the backend gates Level 2 on.
  const isLevel1Complete = Boolean(kycProfile?.isLevel1Complete);

  // A level 3/4 submission is awaiting a verdict, so the page has something to
  // wait for even when Level 2 is long since approved.
  //
  // `IN_PROGRESS` is deliberately included even though the badge no longer
  // treats it as under review: between the player finishing the widget and
  // the provider's webhook landing, that is the only state a real submission
  // has. Narrowing this to submitted levels would leave the page waiting for
  // an update it had stopped asking for.
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
      // The button says "refresh", so it refreshes the whole page's state.
      // Reconciling the tiers too, because that is the half a missed webhook
      // strands — and it is the half the player cannot see any other way.
      const tiersNext = await kycApi.syncTiers();
      if (tiersNext) setTiers(tiersNext);
    } finally {
      setSyncing(false);
    }
  };

  const heading = <h2 className={`${SECTION_HEADING} max-lg:hidden`}>{t('profile.verification')}</h2>;

  if (loading) {
    return (
      <div>
        {heading}
        <div
          className={`${LEVEL_CARD} lg:mt-[calc(var(--u)*32)] flex items-center justify-center gap-[calc(var(--u)*8)] p-[calc(var(--u)*24)] ${BODY}`}
        >
          <RefreshCwIcon size={16} className="animate-spin text-[#35d07f]" />
          <span>{t('kyc.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {heading}

      <div className="space-y-5 lg:mt-[calc(var(--u)*32)] lg:space-y-[calc(var(--u)*30)]">
        {/* Tiered Verification Section.

            A plain labelled section rather than `FieldGroup`: each level is
            already a card, and nesting them inside another would stack two
            tints for no visual gain. */}
        <section className="space-y-[calc(var(--u)*6)]">
          <h3 className="text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-normal text-[#9da2b4]">
            {t('kyc.title')}
          </h3>
          <div className="space-y-[calc(var(--u)*12)]">
            {/* LEVEL 1: Personal Information */}
            <div className={LEVEL_CARD}>
              <button
                type="button"
                onClick={() => setLevel1Open(!level1Open)}
                className={`${LEVEL_HEAD} transition-colors hover:bg-white/5`}
              >
                <span className="flex min-w-0 items-center gap-[calc(var(--u)*12)]">
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
                      {t('acct.verify.complete')}
                    </span>
                  ) : (
                    <span className={`${BADGE} bg-[#fcd535]/15 text-[#fcd535]`}>
                      {t('acct.verify.required')}
                    </span>
                  )}
                  <span
                    className={`text-[#9da2b4] transition-transform duration-200 ${level1Open ? 'rotate-180' : ''}`}
                  >
                    <ChevronDownIcon size={16} />
                  </span>
                </span>
              </button>

              {level1Open && (
                <div className="border-t border-white/8 px-[calc(var(--u)*18)] pt-[calc(var(--u)*16)] pb-[calc(var(--u)*18)]">
                  {/* Level 1 is the first step of either level an operator can
                      push here, so it says why before the form. */}
                  {!isLevel1Complete && operatorDemand && (
                    <p className={`${BODY} mb-[calc(var(--u)*12)] text-[#fcd535]`}>
                      {operatorDemand.reason}
                    </p>
                  )}
                  <KycLevel1Form
                    profile={kycProfile}
                    onSuccess={(updated) => {
                      setKycProfile(updated);
                      setLevel1Open(false);
                      setLevel2Open(true);
                      // Completing Level 1 is what makes Level 3 and 4
                      // answerable at all, and their cards are already on
                      // screen underneath this form.
                      refreshAfterAction();
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
                <span className="flex min-w-0 items-center gap-[calc(var(--u)*12)]">
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
                    <span className="flex items-baseline gap-[calc(var(--u)*8)]">
                      <span className={`truncate ${LEVEL_TITLE}`}>{t('kyc.level2Title')}</span>
                      {!isLevel1Complete && (
                        <span className={`shrink-0 ${LEVEL_HINT}`}>
                          {t('acct.verify.unlockAfter1')}
                        </span>
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
                      {t('acct.verify.locked')}
                    </span>
                  ) : (
                    <span className={`${BADGE} bg-[#4da3ff]/15 text-[#4da3ff]`}>
                      {t('acct.verify.ready')}
                    </span>
                  )}
                  <span
                    className={`text-[#9da2b4] transition-transform duration-200 ${level2Open ? 'rotate-180' : ''}`}
                  >
                    <ChevronDownIcon size={16} />
                  </span>
                </span>
              </button>

              {level2Open && isLevel1Complete && (
                <div className="space-y-[calc(var(--u)*16)] border-t border-white/8 px-[calc(var(--u)*18)] pt-[calc(var(--u)*16)] pb-[calc(var(--u)*18)]">
                  {operatorDemand?.level === 2 && gateState !== 'APPROVED' && (
                    <p className={`${BODY} text-[#fcd535]`}>{operatorDemand.reason}</p>
                  )}
                  {gateState === 'APPROVED' ? (
                    <div
                      className={`${PANEL} flex items-center gap-[calc(var(--u)*12)] bg-[#35d07f]/8`}
                    >
                      <span className="flex h-[calc(var(--u)*38)] w-[calc(var(--u)*38)] shrink-0 items-center justify-center rounded-full bg-[#35d07f]/20 text-[#35d07f]">
                        <ShieldCheckIcon size={20} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-medium text-[#35d07f]">
                          {t('kyc.approvedHeading')}
                        </span>
                        <span className={`block ${BODY}`}>
                          {kycProfile?.docType
                            ? `${
                                DOC_TYPE_LABELS[kycProfile.docType]
                                  ? t(DOC_TYPE_LABELS[kycProfile.docType])
                                  : kycProfile.docType.replace(/_/g, ' ')
                              } (${
                                kycProfile.docCountry
                                  ? (countryName(kycProfile.docCountry, locale) ??
                                    kycProfile.docCountry)
                                  : t('kyc.statusVerified')
                              })`
                            : t('acct.verify.govDocVerified')}
                        </span>
                        {kycProfile?.refreshDueAt && kycProfile.refreshReason && (
                          <span className={`mt-[calc(var(--u)*6)] block ${BODY} text-[#fcd535]`}>
                            {kycProfile.refreshReason}
                          </span>
                        )}
                        {kycProfile?.refreshDueAt && (
                          <button
                            type="button"
                            onClick={() => setModalOpen(true)}
                            className={`${ACTION} mt-[calc(var(--u)*8)] rl-chip-success text-[#35d07f]`}
                          >
                            {t('acct.verify.resubmitDocuments')}
                          </button>
                        )}
                      </span>
                    </div>
                  ) : gateState === 'IN_REVIEW' ? (
                    <div className={`${PANEL} space-y-[calc(var(--u)*12)] bg-[#fcd535]/8`}>
                      <div className="flex flex-wrap items-center justify-between gap-[calc(var(--u)*12)]">
                        <span className="flex items-center gap-[calc(var(--u)*8)] text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-medium text-[#fcd535]">
                          <ClockIcon size={16} />
                          {t('kyc.inReview')}
                        </span>
                        <button
                          type="button"
                          onClick={handleSync}
                          disabled={syncing}
                          className="rl-chip-active inline-flex h-[calc(var(--u)*32)] items-center gap-[calc(var(--u)*6)] px-[calc(var(--u)*15)] text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[1.67] font-medium text-[#fcd535] disabled:opacity-50"
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
                        <p className="text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[1.67] text-[#fcd535]/70">
                          {t('kyc.pollingStopped')}
                        </p>
                      )}
                    </div>
                  ) : gateState === 'COMPLIANCE_HOLD' ? (
                    <div className={`${PANEL} space-y-[calc(var(--u)*8)] bg-[#fcd535]/8`}>
                      <span className="flex items-center gap-[calc(var(--u)*8)] text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-medium text-[#fcd535]">
                        <ClockIcon size={16} />
                        {kycProfile?.holdReason === 'IDENTITY_MISMATCH'
                          ? t('acct.verify.mismatchTitle')
                          : t('acct.verify.withTeamTitle')}
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
                          <p className={BODY}>{t('acct.verify.mismatchBody')}</p>
                          <div className="space-y-[calc(var(--u)*2)] rounded-2xl bg-white/6 px-[calc(var(--u)*16)] py-[calc(var(--u)*12)]">
                            <p className="text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-medium text-[#f0f1f5]">
                              {[kycProfile?.firstName, kycProfile?.lastName]
                                .filter(Boolean)
                                .join(' ') || '—'}
                            </p>
                            <p className="text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[1.67] text-[#9da2b4]">
                              {t('auth.dateOfBirth')}: {kycProfile?.dob || '—'}
                            </p>
                          </div>
                          <p className={BODY}>{t('acct.verify.mismatchAdvice')}</p>
                        </>
                      ) : (
                        <p className={BODY}>{t('acct.verify.withTeamBody')}</p>
                      )}
                    </div>
                  ) : gateState === 'REJECTED_RETRY' ? (
                    <div className={`${PANEL} space-y-[calc(var(--u)*12)] bg-[#ef4462]/8`}>
                      <span className="flex items-center gap-[calc(var(--u)*8)] text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-medium text-[#ef4462]">
                        <AlertTriangleIcon size={16} />
                        {getKycRejectReason(kycProfile, t('kyc.rejectedRetry'))}
                      </span>
                      <button
                        type="button"
                        onClick={() => setModalOpen(true)}
                        className={`${ACTION} rl-chip-danger text-[#ef4462]`}
                      >
                        {t('acct.verify.resubmitDocuments')}
                      </button>
                    </div>
                  ) : gateState === 'REJECTED_FINAL' ? (
                    <div className={`${PANEL} space-y-[calc(var(--u)*8)] bg-[#ef4462]/12`}>
                      <span className="flex items-center gap-[calc(var(--u)*8)] text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-medium text-[#ef4462]">
                        <AlertTriangleIcon size={16} />
                        {t('acct.verify.declinedTitle')}
                      </span>
                      <p className={BODY}>
                        {getKycRejectReason(kycProfile, t('acct.verify.declinedReason'))}{' '}
                        {t('acct.verify.declinedBody')}
                      </p>
                    </div>
                  ) : (
                    <div className={`${PANEL} space-y-[calc(var(--u)*12)] bg-white/6`}>
                      <p className={BODY}>{t('acct.verify.prepareId')}</p>
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

            {/* A liveness re-check staff asked for (answer 13). Above the
                levels, because it is the one thing being asked right now. */}
            {tiers?.liveness && (
              <div className={`${LEVEL_CARD} space-y-[calc(var(--u)*8)] p-[calc(var(--u)*18)]`}>
                <p className={`${LEVEL_TITLE} flex items-center gap-[calc(var(--u)*8)]`}>
                  <ShieldCheckIcon size={16} />
                  {t('acct.verify.livenessTitle')}
                </p>
                {tiers.liveness.status === 'FAILED' ? (
                  <p className={`${BODY} text-[#fcd535]`}>{t('acct.verify.livenessFailed')}</p>
                ) : (
                  <>
                    <p className={BODY}>{t('acct.verify.livenessBody')}</p>
                    <button
                      type="button"
                      onClick={() => setLivenessOpen(true)}
                      className={`${ACTION} rl-chip-success text-[#35d07f]`}
                    >
                      {t('acct.verify.livenessStart')}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* LEVELS 3 & 4: driven by real tier state, not markup */}
            {UPPER_TIERS.map((meta) => {
              const state = tiers?.tiers.find((t) => t.tier === meta.tier);
              const isOpen = meta.tier === 3 ? level3Open : level4Open;
              const setOpen = meta.tier === 3 ? setLevel3Open : setLevel4Open;

              const verified = state?.status === 'APPROVED';
              // `IN_PROGRESS` is set when the widget's token is minted, so a
              // player who opened Level 4 and closed it without uploading
              // anything was shown "In Review" for a level nobody had. Same
              // rule Level 2 already uses: it is under review once something
              // was actually sent.
              const inReview =
                state?.status === 'PENDING_REVIEW' ||
                (state?.status === 'IN_PROGRESS' && Boolean(state?.submittedAt));
              const rejected = state?.status === 'REJECTED';
              const required = Boolean(state?.required) && !verified;
              /** Opened the widget, sent nothing. Theirs to finish. */
              const started = state?.status === 'IN_PROGRESS' && !state?.submittedAt;
              // Someone here has to act; the player need do nothing. Was on
              // the wire and unused, so a held level still offered "Continue
              // verification" — which reopens the widget, mints a billable
              // token and changes nothing.
              const onHold = Boolean(state?.onHold) && !verified;
              /** Verified, with a current document asked for by a date. */
              const refreshing = verified && Boolean(state?.refreshDueAt);

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
                    <span className="flex min-w-0 items-center gap-[calc(var(--u)*12)]">
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
                          {t('acct.verify.levelTitle', { level: meta.tier, title: t(meta.title) })}
                        </span>
                        <span className={`block truncate ${LEVEL_HINT}`}>{t(meta.subtitle)}</span>
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
                        <span className={`${BADGE} bg-[#fcd535]/15 text-[#fcd535]`}>
                          {t('acct.verify.required')}
                        </span>
                      ) : started ? (
                        // Not "locked": they are inside this level already, and
                        // the panel below offers them the way back in.
                        <span className={`${BADGE} bg-white/10 text-[#9da2b4]`}>
                          {t('acct.verify.tierUnfinished')}
                        </span>
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
                    <div
                      className={`space-y-[calc(var(--u)*8)] border-t border-white/8 px-[calc(var(--u)*18)] pt-[calc(var(--u)*16)] pb-[calc(var(--u)*18)] ${BODY}`}
                    >
                      <p>{t(meta.body)}</p>

                      {required && state?.requiredReason && (
                        <p className="text-[#fcd535]">{state.requiredReason}</p>
                      )}

                      {refreshing && state?.refreshReason && (
                        <p className="text-[#fcd535]">{state.refreshReason}</p>
                      )}

                      {/* `rejectionReason` is the player-safe provider text;
                          the generic line covers a rejection without one. */}
                      {rejected && (
                        <p className="text-[#ef4462]">
                          {state?.rejectionReason || t('acct.verify.tierRejected')}
                        </p>
                      )}

                      {/*
                        Held for a person here to decide. Deliberately the
                        generic line and nothing else: on a hold the provider
                        comment, when there is one, says the provider
                        ACCEPTED the submission — which contradicts the badge
                        and would read as approval.
                      */}
                      {onHold && !verified && !rejected && (
                        <p className="text-[#fcd535]">{t('acct.verify.tierOnHold')}</p>
                      )}

                      {/* Says plainly that nothing was sent, which is the one
                          thing an abandoned level has to be clear about. */}
                      {started && !onHold && <p>{t('acct.verify.tierUnfinishedBody')}</p>}

                      {state?.canSubmit && (!verified || refreshing) && !onHold && (
                        <button
                          type="button"
                          onClick={() => setTierModal(meta.tier)}
                          className={`${ACTION} mt-[calc(var(--u)*4)] ${
                            rejected
                              ? 'rl-chip-danger text-[#ef4462]'
                              : 'rl-chip-success text-[#35d07f]'
                          }`}
                        >
                          <ShieldCheckIcon size={16} />
                          {rejected || refreshing
                            ? t('acct.verify.resubmitDocuments')
                            : inReview || started
                              ? t('acct.kycGate.ctaContinue')
                              : t('acct.verify.startLevel', { level: meta.tier })}
                        </button>
                      )}

                      {required && !state?.canSubmit && <p>{t('acct.verify.complianceContact')}</p>}

                      {!required && !verified && !rejected && !inReview && !onHold && !started && (
                        <p>
                          {tiers?.enabled
                            ? t('acct.verify.higherVolumeOnly')
                            : t('acct.verify.notRequired')}
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

      {livenessOpen && (
        <KycVerifyModal
          liveness
          onClose={() => {
            setLivenessOpen(false);
            void kycApi.syncTiers().then((next) => next && setTiers(next));
          }}
          onSubmitted={() => {
            setLivenessOpen(false);
            void kycApi.syncTiers().then((next) => next && setTiers(next));
          }}
        />
      )}

      {/* Sumsub WebSDK Modal — Level 3 / 4 */}
      {tierModal !== null && (
        <KycVerifyModal
          tier={tierModal}
          onClose={() => {
            setTierModal(null);
            void kycApi.syncTiers().then((next) => next && setTiers(next));
            refreshAfterAction();
          }}
          onSubmitted={() => {
            setTierModal(null);
            void kycApi.syncTiers().then((next) => next && setTiers(next));
            refreshAfterAction();
          }}
        />
      )}

      {/* Sumsub WebSDK Modal — Level 2 */}
      {modalOpen && (
        <KycVerifyModal
          onClose={() => {
            setModalOpen(false);
            void handleSync();
            refreshAfterAction();
          }}
          onSubmitted={() => {
            setModalOpen(false);
            void handleSync();
            refreshAfterAction();
          }}
        />
      )}
    </div>
  );
};

export default VerificationSection;
