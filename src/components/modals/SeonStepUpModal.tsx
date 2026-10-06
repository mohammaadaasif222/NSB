import { useEffect, useRef, useState, type FC } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import ButtonLoader from '@/components/ButtonLoader';
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

/** Flow names as a player would describe them. */
const ACTION_LABELS: Record<string, string> = {
  withdrawal: 'withdrawal',
  deposit: 'deposit',
  login: 'sign-in',
  registration: 'sign-up',
  account_edit: 'account change',
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

  const action = ACTION_LABELS[challenge.action] ?? 'request';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      role="presentation"
    >
      {/* Narrower than the 581 the other dialogs take — this one holds a
          sentence and six digits, and a wide card around that reads as more
          ceremony than a security prompt should have. Everything else is the
          design's: the glass, the 34 radius, the chip, the stacked actions. */}
      <div
        className="rl-modal-glass w-full max-w-[420px] p-5 sm:p-7"
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
              Confirm it&apos;s you
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            aria-label="Cancel verification"
            className="rl-chip -mt-1 flex h-10 w-10 shrink-0 items-center justify-center text-[#f0f1f5] disabled:opacity-40"
          >
            <X size={16} />
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-[#9da2b4]">
          For your security we&apos;ve sent a {OTP_LENGTH}-digit code
          {challenge.sentTo ? (
            <>
              {' '}
              to <span className="font-medium text-[#f0f1f5]">{challenge.sentTo}</span>
            </>
          ) : null}
          . Enter it to continue with your {action}.
        </p>

        <input
          ref={inputRef}
          value={otp}
          onChange={(e) => handleChange(e.target.value)}
          disabled={submitting}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          aria-label="Verification code"
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
          {submitting ? <ButtonLoader /> : 'Confirm'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className={`${BUTTON} mt-2.5 bg-white/10 text-[#f0f1f5] hover:bg-white/15 disabled:opacity-40`}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SeonStepUpModal;
