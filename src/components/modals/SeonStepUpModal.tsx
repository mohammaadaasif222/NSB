import { useEffect, useRef, useState, type FC } from 'react';
import { ShieldCheck } from 'lucide-react';
import ButtonLoader from '@/components/ButtonLoader';
import { CloseIcon } from '@/components/icons';
import CircleIconButton from '@/components/ui/CircleIconButton';
import { useTranslation } from '@/context/I18nContext';
import type { TranslationKey } from '@/i18n/locales';
import type { SeonStepUpChallenge } from '@/lib/seon-guard';

interface Props {
  challenge: SeonStepUpChallenge;
  /** Non-null while the last attempt was rejected. */
  error: string | null;
  submitting: boolean;
  onSubmit: (otp: string) => void;
  onCancel: () => void;
}

const OTP_LENGTH = 6;

/* The shape the design gives both actions in a dialog. */
const BUTTON =
  'flex h-14 w-full items-center justify-center rounded-[34px] px-2 text-[18px] leading-7 font-medium transition-colors';

/**
 * Flow names as a player would describe them — each as the whole closing
 * sentence, since the noun's grammar changes the sentence around it in most
 * languages.
 */
const ACTION_LABELS: Record<string, TranslationKey> = {
  withdrawal: 'acct.stepup.continueWithdrawal',
  deposit: 'acct.stepup.continueDeposit',
  login: 'acct.stepup.continueLogin',
  registration: 'acct.stepup.continueRegistration',
  account_edit: 'acct.stepup.continueAccountEdit',
};

/**
 * The one-time code prompt.
 *
 * Shown when the risk layer wants a second factor before a sensitive request
 * goes through. Deliberately plain and short: a security prompt that appears
 * unexpectedly mid-withdrawal is alarming enough without ceremony, so it says
 * what happened, where the code went, and nothing else.
 *
 * It does NOT mention identity verification or KYC. Clearing this proves the
 * player holds the account's email or phone — not who they are — and blurring
 * the two would teach players that a six-digit SMS is "verification".
 */
const SeonStepUpModal: FC<Props> = ({ challenge, error, submitting, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Clear on rejection so the player is not editing a dead code, and put the
  // cursor back where they need it.
  useEffect(() => {
    if (error) {
      setOtp('');
      inputRef.current?.focus();
    }
  }, [error]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Escape cancels, like every other dialog in the app.
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && !submitting) onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel, submitting]);

  const handleChange = (raw: string): void => {
    const digits = raw.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtp(digits);
    // Auto-submit on the last digit — the player has nothing else to decide,
    // and a Confirm button they must then hunt for is pure friction.
    if (digits.length === OTP_LENGTH && !submitting) {
      onSubmit(digits);
    }
  };

  const continueLine = t(ACTION_LABELS[challenge.action] ?? 'acct.stepup.continueRequest');
  // `{target}` is left unfilled so the address can be set in its own weight.
  const [sentBefore, sentAfter = ''] = challenge.sentTo
    ? t('acct.stepup.sentTo', { digits: OTP_LENGTH }).split('{target}')
    : [t('acct.stepup.sent', { digits: OTP_LENGTH })];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="presentation"
    >
      <div aria-hidden className="rl-modal-overlay pointer-events-none fixed inset-0" />
      {/* Narrower than the 581 the other dialogs take — this one holds a
          sentence and six digits, and a wide card around that reads as more
          ceremony than a security prompt should have. Everything else is the
          design's: the glass, the 34 radius, the chip, the stacked actions. */}
      <div
        className="rl-modal-card rl-modal-rim rl-rim-top scrollbar-none max-h-[calc(100dvh-24px)] w-full max-w-[420px] overflow-y-auto overscroll-contain p-5 max-sm:!rounded-b-none max-sm:!rounded-t-[34px] sm:max-h-[calc(100dvh-32px)] sm:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stepup-title"
      >
        <div className="flex items-start gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--rl-gold)/15">
              <ShieldCheck size={17} className="text-(--rl-gold)" />
            </span>
            <h2 id="stepup-title" className="rl-h-card min-w-0 text-[#f0f1f5]">
              {t('acct.stepup.title')}
            </h2>
          </div>
          <CircleIconButton
            data-sound="close"
            label={t('acct.stepup.cancelAria')}
            onClick={onCancel}
            disabled={submitting}
            className="-mt-1 max-sm:h-12 max-sm:w-12 disabled:opacity-40"
          >
            <CloseIcon size={33} strokeWidth={1.45} />
          </CircleIconButton>
        </div>

        <p className="mt-4 text-sm leading-6 text-[#9da2b4]">
          {sentBefore}
          {challenge.sentTo ? (
            <span className="font-medium text-[#f0f1f5]">{challenge.sentTo}</span>
          ) : null}
          {sentAfter} {continueLine}
        </p>

        <input
          ref={inputRef}
          value={otp}
          onChange={(e) => handleChange(e.target.value)}
          disabled={submitting}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          aria-label={t('acct.stepup.codeAria')}
          aria-invalid={Boolean(error)}
          className="rl-modal-field mt-4 h-14 w-full px-6 text-center text-[18px] leading-6 font-bold tracking-[0.5em] text-[#f0f1f5] outline-none transition-colors placeholder:font-normal placeholder:tracking-[0.5em] placeholder:text-[#9ca3af] focus-visible:border-white/30 disabled:opacity-60"
        />

        {error && (
          <p role="alert" className="mt-2 text-sm leading-5 text-[#ef4462]">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => onSubmit(otp)}
          disabled={submitting || otp.length !== OTP_LENGTH}
          className={`rl-btn-gold mt-6 ${BUTTON} gap-2 disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {submitting ? <ButtonLoader /> : t('acct.stepup.confirm')}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className={`${BUTTON} rl-option mt-2.5 disabled:opacity-40`}
        >
          {t('common.cancel')}
        </button>
      </div>
    </div>
  );
};

export default SeonStepUpModal;
