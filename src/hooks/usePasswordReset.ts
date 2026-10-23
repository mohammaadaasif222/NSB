import { useState } from 'react';
import { toast } from 'react-toastify';

import { useTranslation } from '@/context/I18nContext';
import { requestPasswordReset, resetPassword } from '@/services/auth';
import { analytics, failureReason } from '@/services/analytics';

import type { ApiError, ContactChannel } from '@/types';

/** Where the reset code went, once one has been sent. */
export interface ResetTarget {
  channel: ContactChannel;
  /** Email, or mobile digits, as sent to the API. */
  identifier: string;
  /** Dial code for a mobile identifier, e.g. "+91". */
  countryCode?: string;
}

export type ResetOutcome = 'done' | 'bad-code' | 'failed';

const firstError = (err: unknown): string | undefined => {
  const apiErr = err as ApiError;
  return (apiErr?.errors && Object.values(apiErr.errors)[0]) || apiErr?.message;
};

/**
 * The forgot-password journey: request a code → carry the code forward →
 * redeem it together with the new password.
 *
 * The API checks the code only in the final call, so the OTP step just keeps
 * the digits; a rejection there reports `bad-code` so the modal can send the
 * player back to re-enter them.
 */
export const usePasswordReset = () => {
  const { t } = useTranslation();
  const [target, setTarget] = useState<ResetTarget | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  /** Resolves true once a code is on its way. */
  const requestCode = async (next: ResetTarget): Promise<boolean> => {
    setBusy(true);
    try {
      analytics.auth.passwordResetRequested();
      const res = await requestPasswordReset(next.identifier, next.countryCode);
      if (!res?.success) {
        toast.error(res?.message || t('loginModal.codeFailed'));
        return false;
      }
      analytics.auth.otpSent('password_reset');
      setTarget(next);
      setCode('');
      return true;
    } catch (err) {
      toast.error(firstError(err) || t('loginModal.codeFailed'));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const resendCode = async (): Promise<void> => {
    if (!target) return;
    try {
      analytics.auth.otpResent('password_reset');
      const res = await requestPasswordReset(target.identifier, target.countryCode);
      if (!res?.success) toast.error(res?.message || t('loginModal.codeFailed'));
    } catch (err) {
      toast.error(firstError(err) || t('loginModal.codeFailed'));
    }
  };

  const submitNewPassword = async (newPassword: string): Promise<ResetOutcome> => {
    if (!target) return 'failed';
    setBusy(true);
    try {
      const res = await resetPassword(target.identifier, code, newPassword);
      if (res?.success) {
        // The code was redeemed and the password changed in the same call.
        analytics.auth.otpVerified('password_reset');
        analytics.auth.passwordResetCompleted();
        toast.success(t('loginModal.resetDone'));
        return 'done';
      }
      analytics.auth.passwordResetFailed(failureReason(res?.message));
      toast.error(res?.message || t('loginModal.resetFailed'));
      return 'failed';
    } catch (err) {
      const message = firstError(err);
      analytics.auth.passwordResetFailed(failureReason(message ?? err));
      toast.error(message || t('loginModal.resetFailed'));
      // A 400 here is almost always the code (wrong or expired), not the
      // password, which was validated before sending.
      return 'bad-code';
    } finally {
      setBusy(false);
    }
  };

  return { target, setCode, busy, requestCode, resendCode, submitNewPassword };
};
