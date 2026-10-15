import { useEffect, useRef, useState, type FC } from 'react';
import SumsubWebSdk from '@sumsub/websdk-react';
import kycApi from '@/services/kyc.api';
import { useTranslation } from '@/context/I18nContext';
import KycLevel1Form from '@/components/profile/kyc/KycLevel1Form';
import type { PlayerKycProfile } from '@/types/kyc';
import { useModalA11y } from '@/hooks/useModalA11y';
import { CloseIcon, AlertTriangleIcon, RefreshCwIcon, ShieldCheckIcon } from '@/components/icons';

interface Props {
  onClose: () => void;
  onSubmitted?: () => void;
  /**
   * Which verification level to open.
   *
   *   1       the Level 1 details form on its own — what the deposit gate asks
   *           for. No provider call is made.
   *   2 / —   the Level 2 ID and liveness flow, preceded by the Level 1 form
   *           if those details are not on file yet.
   *   3 / 4   their own Sumsub level, which the backend resolves from config.
   */
  tier?: number;
  /** A liveness re-check staff asked for, on its own Sumsub level. */
  liveness?: boolean;
}

/**
 * What the dialog is showing right now.
 *
 *   resolving  working out which step the player actually needs
 *   level1     the details form — no provider involved
 *   sdk        the Sumsub widget
 *   error      a provider or network failure, with a retry
 */
type Step = 'resolving' | 'level1' | 'sdk' | 'error';

const KycVerifyModal: FC<Props> = ({ onClose, onSubmitted, tier, liveness = false }) => {
  // Tab stays inside, Escape closes, focus returns where it came from, and a
  // screen reader is told a dialog opened. None of that was true before.
  const dialogRef = useModalA11y(onClose);
  const { t, locale } = useTranslation();
  const isUpperTier = liveness || (typeof tier === 'number' && tier > 2);
  const isLevel1Only = tier === 1;
  const [step, setStep] = useState<Step>('resolving');
  const [profile, setProfile] = useState<PlayerKycProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** True when the error is something the player can act on, not an outage. */
  const [errorActionable, setErrorActionable] = useState(false);
  /**
   * Every path through `resolveStep` ends at a billable token mint, so a
   * double-clicked Retry must not reach it twice. A ref, not state: it has to
   * be true for the second click immediately, not after a re-render.
   */
  const inFlight = useRef(false);

  /**
   * `keepWidget` is for the SDK's own expiry callback, which asks for a fresh
   * token while its iframe is still on screen. Moving the step back to
   * `resolving` there would unmount the widget mid-session and throw away
   * whatever the player had captured — so the refresh is silent, and only a
   * failure is allowed to change what is rendered.
   */
  const fetchToken = async (opts: { keepWidget?: boolean } = {}): Promise<string> => {
    try {
      if (!opts.keepWidget) setStep('resolving');
      setError(null);
      const res = liveness
        ? await kycApi.getLivenessToken()
        : isUpperTier
          ? await kycApi.getTierToken(tier as number)
          : await kycApi.getSumsubToken();
      setToken(res.token);
      setStep('sdk');
      return res.token;
    } catch (err: any) {
      const msg = err?.message || t('acct.kycModal.connectFailed');
      // 400 is the ladder refusing to mint (Level 4 before Level 3), not an
      // outage: nothing is down and retrying can never succeed.
      setErrorActionable(err?.status === 400);
      setError(msg);
      setStep('error');
      throw err;
    }
  };

  /**
   * Decide what to open BEFORE asking the provider for anything.
   *
   * The token endpoint refuses to mint while Level 1 is incomplete, and it is
   * right to: there would be nothing to check the document against. But this
   * dialog used to ask for the token regardless and render the refusal as
   * "Service Temporarily Unavailable", which is both wrong and a dead end —
   * the details form lives on the profile page, so the button that promised
   * to fix the problem could not reach the only thing that would.
   *
   * The deposit gate made that reachable on the first screen a new player
   * sees: it asks for Level 1 (`requiredLevel: 1`) and this dialog treated
   * every tier below 3 as the Sumsub flow.
   */
  const resolveStep = async (): Promise<void> => {
    if (inFlight.current) return;
    inFlight.current = true;

    try {
      // Levels 3 and 4 sit above an approved Level 2, so Level 1 is settled by
      // definition. The backend still checks; no reason to ask twice.
      if (isUpperTier) {
        await fetchToken().catch(() => undefined);
        return;
      }

      setStep('resolving');
      const me = await kycApi.getKycMe();
      setProfile(me);

      if (isLevel1Only || !me?.isLevel1Complete) {
        setStep('level1');
        return;
      }

      await fetchToken().catch(() => undefined);
    } finally {
      inFlight.current = false;
    }
  };

  useEffect(() => {
    void resolveStep();
  }, []);

  /**
   * Level 1 is saved. Where that leads depends on who opened the dialog.
   *
   * Opened for Level 1 alone (the deposit gate), the player is done — hand
   * back to the caller, which re-requests the deposit address. Opened for
   * Level 2, this was the prerequisite, so carry straight on into the widget
   * rather than making them find the button again.
   */
  const handleLevel1Saved = (updated: PlayerKycProfile): void => {
    setProfile(updated);
    onSubmitted?.();

    if (isLevel1Only) {
      onClose();
      return;
    }

    void fetchToken().catch(() => undefined);
  };

  const handleExpiration = async (): Promise<string> => {
    return fetchToken({ keepWidget: true });
  };

  /**
   * The player actually finished a step in THIS session.
   *
   * `idCheck.applicantStatus` is deliberately absent: the SDK emits it
   * whenever applicant status loads, which would close the modal before the
   * player starts.
   */
  const COMPLETION_EVENTS = [
    'idCheck.onApplicantSubmitted',
    'idCheck.applicantSubmitted',
    'idCheck.onApplicantVerificationCompleted',
  ];

  /**
   * A status change only means something once the player has submitted here.
   *
   * It carries the CURRENT status, so reopening a level that already has a
   * verdict — a rejected proof of address being resubmitted — fires it while
   * the widget is still initialising. Treated as completion, it closed the
   * dialog before the form had rendered, and the player could never get back
   * in to replace the document.
   */
  const STATUS_EVENTS = ['idCheck.onApplicantStatusChanged'];
  const submittedHere = useRef(false);

  const handleMessage = (type: string, _payload: unknown) => {
    if (COMPLETION_EVENTS.includes(type)) submittedHere.current = true;

    if (COMPLETION_EVENTS.includes(type) || (STATUS_EVENTS.includes(type) && submittedHere.current)) {
      // Level 2 only. This modal is also opened for Levels 3 and 4, and the
      // applicant has been moved onto that level by then — so a Level 2 sync
      // here asks the API to read a proof-of-address verdict into the
      // identity profile. The caller's `onSubmitted` runs the tier sync,
      // which is the right one for those. (The API refuses the mismatched
      // verdict either way; this just stops asking for it.)
      if (!isUpperTier) {
        void kycApi.syncKyc();
      }
      if (onSubmitted) {
        onSubmitted();
      }
    }
  };

  const handleError = (err: unknown) => {
    // eslint-disable-next-line no-console
    console.error('Sumsub WebSDK error:', err);
    // Surface it — otherwise the widget fails silently and the player is stuck
    // staring at a blank frame with no way to retry. The step has to move too:
    // the error panel renders on `step`, so setting only the message would
    // leave the broken iframe on screen and the explanation nowhere.
    setError(t('acct.kycModal.widgetError'));
    setStep('error');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      {/* Wider than the other dialogs, and it has to be — Sumsub's widget
          renders in an iframe with its own minimum. Everything around it is
          the design's glass: 34 of radius, the blurred fill, the chip. */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="kyc-verify-title"
        tabIndex={-1}
        className="rl-modal-glass relative flex max-h-[96vh] w-full max-w-2xl flex-col overflow-hidden outline-none sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--rl-gold)/15 text-(--rl-gold)">
              <ShieldCheckIcon size={18} />
            </div>
            <div className="min-w-0">
              {/* Named for the level being opened: 3 and 4 are a proof of
                  address and a questionnaire, not identity verification. */}
              <h2 id="kyc-verify-title" className="rl-h-card truncate text-[#f0f1f5]">
                {step === 'level1'
                  ? t('acct.kycModal.personalInfo')
                  : liveness
                    ? t('acct.verify.livenessTitle')
                    : tier === 3
                    ? t('acct.verify.tier3Title')
                    : tier === 4
                      ? t('acct.verify.tier4Title')
                      : t('acct.kycModal.identity')}
              </h2>
              {/* Sumsub is not involved in the details form, so crediting them
                  there would be both wrong and faintly alarming — the player
                  is being asked for their address, not their passport. */}
              <p className="truncate text-xs text-[#9da2b4]">
                {step === 'level1'
                  ? isLevel1Only
                    ? t('acct.kycModal.level1Sub')
                    : t('acct.kycModal.step1of2')
                  : t('acct.kycModal.poweredBy')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rl-chip flex h-10 w-10 shrink-0 items-center justify-center text-[#f0f1f5]"
            aria-label={t('common.close')}
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Content area */}
        <div className="thin-scrollbar max-h-[75vh] min-h-[420px] flex-1 overflow-y-auto p-4 sm:p-6">
          {step === 'resolving' && (
            <div className="flex h-96 flex-col items-center justify-center space-y-3 text-[#9da2b4]">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-(--rl-gold) border-t-transparent" />
              <p className="text-sm font-medium">{t('acct.kycModal.connecting')}</p>
            </div>
          )}

          {step === 'level1' && (
            <div className="space-y-4">
              {!isLevel1Only && (
                <p className="text-xs leading-relaxed text-[#9da2b4]">
                  {t('acct.kycModal.level1Intro')}
                </p>
              )}
              <KycLevel1Form profile={profile} onSuccess={handleLevel1Saved} />
            </div>
          )}

          {step === 'error' && (
            <div className="flex h-96 flex-col items-center justify-center space-y-4 px-4 text-center">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  errorActionable
                    ? 'bg-(--rl-gold)/15 text-(--rl-gold)'
                    : 'bg-[#ef4462]/12 text-[#ef4462]'
                }`}
              >
                <AlertTriangleIcon size={24} />
              </div>
              <div>
                {errorActionable ? (
                  <h3 className="max-w-sm text-base font-medium text-[#f0f1f5]">{error}</h3>
                ) : (
                  <>
                    <h3 className="text-base font-medium text-[#f0f1f5]">
                      {t('acct.kycModal.unavailable')}
                    </h3>
                    <p className="mt-1 max-w-sm text-sm leading-6 text-[#9da2b4]">{error}</p>
                  </>
                )}
              </div>
              {/* Retry only where retrying can work. */}
              {errorActionable ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="rl-btn-gold inline-flex h-12 items-center gap-2 rounded-[34px] px-6 text-base font-medium"
                >
                  <span>{t('rgc.close')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void resolveStep()}
                  className="rl-btn-gold inline-flex h-12 items-center gap-2 rounded-[34px] px-6 text-base font-medium"
                >
                  <RefreshCwIcon size={15} />
                  <span>{t('acct.retry')}</span>
                </button>
              )}
            </div>
          )}

          {step === 'sdk' && token && (
            <div className="min-h-[460px] w-full">
              <SumsubWebSdk
                accessToken={token}
                expirationHandler={handleExpiration}
                config={{
                  lang: locale,
                  theme: 'dark',
                }}
                options={{
                  addViewportTag: false,
                  adaptIframeHeight: true,
                }}
                onMessage={handleMessage}
                onError={handleError}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KycVerifyModal;
