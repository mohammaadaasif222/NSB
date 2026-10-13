import { useCallback, useEffect, useState, type FC } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import apiService from '@/services/api';
import { useTranslation } from '@/context/I18nContext';
import PublicRoute from '@/routes/PublicRoute';
import ButtonLoader from '@/components/ButtonLoader';
import AuthShell from '@/components/auth/AuthShell';
import AuthField, { LockIcon, MailIcon } from '@/components/auth/AuthField';
import OtpInput, { OTP_LENGTH } from '@/components/auth/OtpInput';
import { analytics, failureReason } from '@/services/analytics';
import type { ApiError } from '@/types';

/**
 * Password reset, in three steps.
 *
 *   request   name the account            -> POST /auth/forgot-password
 *   code      type the 6 digits it sent   (checked server-side in the last step)
 *   password  choose the new password     -> POST /auth/reset-password
 *
 * The code and the password go up together, because the API redeems the code
 * and sets the password in one call — the code cannot be verified on its own.
 * A rejected code therefore lands the player back on the code step with the
 * boxes cleared, rather than losing the password they just typed.
 *
 * This screen used to take the address from `?email=` and send `token: ''`,
 * which let anyone reset any account. Nothing here is trusted from the URL any
 * more: the code only reaches the address and number already on the account.
 */

type Step = 'request' | 'code' | 'password';

const MIN_PASSWORD = 6; // matches the backend's Joi resetPasswordSchema

/** Matches OTP_RESEND_COOLDOWN_MS on the backend. */
const RESEND_SECONDS = 30;

const mmss = (total: number): string =>
  `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;

const ResetPassword: FC = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>('request');
  const [identifier, setIdentifier] = useState<string>('');
  const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(RESEND_SECONDS);

  // Ticks down while the code screen is up; gates the resend link the way the
  // backend gates the endpoint.
  useEffect(() => {
    if (step !== 'code' || cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, cooldown]);

  /** Step one — ask for a code. */
  const requestCode = async (): Promise<void> => {
    const account = identifier.trim();
    if (account.length < 3) {
      toast.error(t('reset.identifier'));
      return;
    }

    try {
      setLoading(true);
      analytics.auth.passwordResetRequested();
      const res = await apiService.post('/auth/forgot-password', { identifier: account });

      if (res?.success) {
        // Deliberately the same message whether or not the account exists —
        // the API answers identically, and the UI must not undo that. The same
        // goes for what is recorded here: a code was requested, nothing about
        // whether one was actually sent.
        analytics.auth.otpSent('password_reset');
        toast.success(t('reset.codeSent'));
        setCode(Array(OTP_LENGTH).fill(''));
        setCooldown(RESEND_SECONDS);
        setStep('code');
      } else {
        toast.error(res?.message || t('loginModal.codeFailed'));
      }
    } catch (err) {
      const apiErr = err as ApiError;
      toast.error(apiErr?.message || t('loginModal.codeFailed'));
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async (): Promise<void> => {
    try {
      analytics.auth.otpResent('password_reset');
      setCooldown(RESEND_SECONDS);
      const res = await apiService.post('/auth/forgot-password', {
        identifier: identifier.trim(),
      });
      if (!res?.success) {
        toast.error(res?.message || t('loginModal.codeFailed'));
      }
    } catch (err) {
      const apiErr = err as ApiError;
      toast.error(apiErr?.message || t('loginModal.codeFailed'));
    }
  };

  /** Step two — the digits are only carried forward; the API checks them. */
  const acceptCode = useCallback(
    (value: string): void => {
      if (value.length < OTP_LENGTH) {
        toast.error(t('otp.incomplete'));
        return;
      }
      setStep('password');
    },
    [t]
  );

  /** Step three — redeem the code and set the password. */
  const submitReset = async (): Promise<void> => {
    if (!password || !confirmPassword) {
      toast.error(t('misc.reset.allRequired'));
      return;
    }
    if (password.length < MIN_PASSWORD) {
      toast.error(t('misc.reset.minLength', { min: MIN_PASSWORD }));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t('reset.mismatch'));
      return;
    }

    try {
      setLoading(true);
      const res = await apiService.post('/auth/reset-password', {
        identifier: identifier.trim(),
        code: code.join(''),
        new_password: password,
      });

      if (res?.success) {
        // The code was redeemed and the password changed in the same call, so
        // this is both facts at once.
        analytics.auth.otpVerified('password_reset');
        analytics.auth.passwordResetCompleted();
        toast.success(t('loginModal.resetDone'));
        router.push('/auth/login');
      } else {
        analytics.auth.passwordResetFailed(failureReason(res?.message));
        toast.error(res?.message || t('loginModal.resetFailed'));
      }
    } catch (err) {
      const apiErr = err as ApiError;
      const firstFieldError = apiErr?.errors ? Object.values(apiErr.errors)[0] : undefined;
      analytics.auth.passwordResetFailed(failureReason(firstFieldError ?? apiErr));
      toast.error(firstFieldError || apiErr?.message || t('loginModal.resetFailed'));
      // A 400 here is very likely the code, not the password — send them back
      // with empty boxes so the next attempt starts clean.
      setCode(Array(OTP_LENGTH).fill(''));
      setStep('code');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'code') {
    return (
      <AuthShell
        subtitle={t('otp.title')}
        caption={t('otp.sentTo', { target: identifier.trim() })}
        onBack={() => setStep('request')}
        backLabel={t('auth.back')}
        action={{ href: '/auth/login', label: t('register.login') }}
        legal={t('auth.legal')}
      >
        <div className="space-y-5">
          <OtpInput value={code} onChange={setCode} onComplete={acceptCode} disabled={loading} />

          <div className="text-center">
            {cooldown > 0 ? (
              <p className="text-lg font-semibold tabular-nums text-white/85">{mmss(cooldown)}</p>
            ) : null}
            <p className="mt-1 text-[12px] text-white/50">
              {t('otp.notReceived')}{' '}
              <button
                type="button"
                onClick={resendCode}
                disabled={cooldown > 0}
                className="font-semibold text-white/85 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-white/35 disabled:no-underline"
              >
                {t('otp.resend')}
              </button>
            </p>
          </div>

          <button
            type="button"
            onClick={() => acceptCode(code.join(''))}
            disabled={loading}
            className="glass-btn h-13 flex items-center justify-center text-[15px] font-semibold"
          >
            {loading ? <ButtonLoader /> : t('reset.continue')}
          </button>
        </div>
      </AuthShell>
    );
  }

  if (step === 'password') {
    return (
      <AuthShell
        subtitle={t('reset.title')}
        caption={identifier.trim()}
        onBack={() => setStep('code')}
        backLabel={t('auth.back')}
        action={{ href: '/auth/login', label: t('register.login') }}
        legal={t('auth.legal')}
      >
        <div className="space-y-3.5">
          <AuthField
            id="reset-password"
            label={t('reset.newPassword')}
            type="password"
            autoComplete="new-password"
            placeholder={t('reset.newPassword')}
            icon={<LockIcon />}
            value={password}
            onChange={setPassword}
          />

          <AuthField
            id="reset-confirm"
            label={t('reset.confirmPassword')}
            type="password"
            autoComplete="new-password"
            placeholder={t('reset.confirmPassword')}
            icon={<LockIcon />}
            value={confirmPassword}
            onChange={setConfirmPassword}
          />

          {/* Inline validation message */}
          {confirmPassword && password !== confirmPassword && (
            <p className="text-[12px] text-red-400">{t('reset.mismatch')}</p>
          )}

          <button
            className="glass-btn h-13 mt-1 flex items-center justify-center gap-1 text-[15px] font-semibold"
            onClick={submitReset}
            disabled={loading}
            type="button"
          >
            {loading ? <ButtonLoader /> : t('reset.submit')}
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      subtitle={t('reset.title')}
      backHref="/auth/login"
      backLabel={t('auth.back')}
      action={{ href: '/auth/login', label: t('register.login') }}
      legal={t('auth.legal')}
    >
      <div className="space-y-3.5">
        <AuthField
          id="reset-identifier"
          label={t('reset.identifier')}
          type="text"
          autoComplete="username"
          placeholder={t('reset.identifier')}
          icon={<MailIcon />}
          value={identifier}
          onChange={setIdentifier}
        />

        <button
          className="glass-btn h-13 mt-1 flex items-center justify-center gap-1 text-[15px] font-semibold"
          onClick={requestCode}
          disabled={loading}
          type="button"
        >
          {loading ? <ButtonLoader /> : t('reset.sendCode')}
        </button>
      </div>
    </AuthShell>
  );
};

const ResetPasswordPage: FC = () => (
  <PublicRoute>
    <ResetPassword />
  </PublicRoute>
);

export default ResetPasswordPage;
