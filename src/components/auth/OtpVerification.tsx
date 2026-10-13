import { useState, type FC } from 'react';
import { toast } from 'react-toastify';

import { useTranslation } from '@/context/I18nContext';
import { formatCountdown, useCountdown } from '@/hooks/useCountdown';
import OtpInput, { OTP_LENGTH } from '@/components/auth/OtpInput';
import NeedHelpLink from '@/components/auth/NeedHelpLink';
import Button from '@/components/ui/Button';
import { OTP_RESEND_SECONDS } from '@/constants/auth';
import { maskEmail, maskMobile } from '@/utils/mask';

import type { ContactChannel } from '@/types';

const emptyCode = (): string[] => Array(OTP_LENGTH).fill('');
const resendDeadline = (): string => new Date(Date.now() + OTP_RESEND_SECONDS * 1000).toISOString();

interface OtpVerificationProps {
  channel: ContactChannel;
  /** The email or mobile digits the code went to; shown masked. */
  target: string;
  /**
   * Called with all six digits. Resolve `false` to clear the boxes for another
   * try (a rejected code); anything else leaves them as they are.
   */
  onSubmit: (code: string) => Promise<boolean> | boolean;
  onResend: () => Promise<void>;
}

/**
 * The "Enter OTP" screen body shared by signup and password reset: masked
 * target, six boxes, resend cooldown, Continue and Need help.
 *
 * Owns only the code and the cooldown; what a code means is the caller's.
 * The code went out just before this mounts, so the cooldown starts now.
 */
const OtpVerification: FC<OtpVerificationProps> = ({ channel, target, onSubmit, onResend }) => {
  const { t } = useTranslation();
  const [code, setCode] = useState<string[]>(emptyCode);
  const [busy, setBusy] = useState(false);
  const [resendAt, setResendAt] = useState(resendDeadline);
  const remaining = useCountdown(resendAt) ?? 0;

  const submit = async (value: string): Promise<void> => {
    if (busy) return;
    if (value.length < OTP_LENGTH) {
      toast.error(t('otp.incomplete'));
      return;
    }
    setBusy(true);
    try {
      const accepted = await onSubmit(value);
      if (accepted === false) setCode(emptyCode());
    } finally {
      setBusy(false);
    }
  };

  const resend = async (): Promise<void> => {
    setResendAt(resendDeadline());
    setCode(emptyCode());
    await onResend();
  };

  // The masked target is styled brighter than the sentence around it, so the
  // translated sentence is split where {target} falls rather than rebuilt.
  const [before, after] = t(
    channel === 'email' ? 'registerModal.otpSentEmail' : 'registerModal.otpSentMobile',
    { target: '\u0000' }
  ).split('\u0000');

  return (
    <div className="text-center">
      <p className="mx-auto max-w-[330px] text-[14px] leading-relaxed text-white/65">
        {before}
        <span className="text-white/85" data-clarity-mask="true">
          {channel === 'email' ? maskEmail(target) : maskMobile(target)}
        </span>
        {after}
      </p>

      <div className="mt-7">
        <OtpInput
          value={code}
          onChange={setCode}
          onComplete={submit}
          disabled={busy}
          placeholder="0"
          boxClassName="rl-field !rounded-[18px] h-14 w-11 !text-[28px] placeholder:!text-white/40 min-[400px]:h-16 min-[400px]:w-13 sm:h-[78px] sm:w-[62px] sm:!text-[32px]"
        />
      </div>

      <p className="mt-7 text-xl font-semibold tabular-nums text-white" aria-live="polite">
        {formatCountdown(remaining)}
      </p>
      <p className="mt-2 text-[14px] text-white/60 sm:text-[15px]">
        {t('otp.notReceived')}{' '}
        <button
          type="button"
          onClick={resend}
          disabled={remaining > 0}
          className="font-semibold text-white/85 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-white/40 disabled:no-underline"
        >
          {t('otp.resend')}
        </button>
      </p>

      <Button fullWidth loading={busy} onClick={() => submit(code.join(''))} className="mt-7">
        {t('registerModal.continue')}
      </Button>

      <NeedHelpLink subject={t('misc.help.otpSubject')} className="mt-5 inline-block" />
    </div>
  );
};

export default OtpVerification;
