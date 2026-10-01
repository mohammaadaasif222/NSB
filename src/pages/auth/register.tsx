import { useCallback, useEffect, useState, type FC, type FormEvent } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

import apiService from '@/services/api';
import { useTranslation } from '@/context/I18nContext';
import PublicRoute from '@/routes/PublicRoute';
import ButtonLoader from '@/components/ButtonLoader';
import AuthShell from '@/components/auth/AuthShell';
import AuthField, { MailIcon, LockIcon, UserIcon, PhoneIcon } from '@/components/auth/AuthField';
import AuthMethods, { type AuthMethodId } from '@/components/auth/AuthMethods';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useSteamAuth } from '@/hooks/useSteamAuth';
import OtpInput, { OTP_LENGTH } from '@/components/auth/OtpInput';
import { analytics, failureReason } from '@/services/analytics';
import { trackSignupComplete } from '@/utils/events';

import type { ApiError } from '@/types';

const MIN_PASSWORD = 6; // matches the backend's Joi registerSchema

/** The two signup flows the backend serves. */
type SignupFlow = 'mail' | 'phone';
type SignupStep = 'choose' | 'other' | SignupFlow | 'otp';

/** Matches OTP_RESEND_COOLDOWN_MS on the backend. */
const RESEND_SECONDS = 30;

const mmss = (total: number): string =>
  `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;

interface Check {
  id: 'marketing' | 'terms';
  label: string;
  required: boolean;
}

const CHECKS: Check[] = [
  {
    id: 'marketing',
    label: 'I agree to receive marketing emails, promotions, and exclusive offers.',
    required: false,
  },
  { id: 'terms', label: 'I agree to the Terms & Conditions and confirm I am 18+', required: true },
];

const CheckRow: FC<{ checked: boolean; onToggle: () => void; label: string; id: string }> = ({
  checked,
  onToggle,
  label,
  id,
}) => (
  <label htmlFor={id} className="flex items-start gap-2.5 cursor-pointer group">
    <input id={id} type="checkbox" checked={checked} onChange={onToggle} className="sr-only peer" />
    <span
      aria-hidden="true"
      className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-white/40 ${
        checked
          ? 'bg-white border-white'
          : 'bg-white/10 border-white/25 group-hover:border-white/45'
      }`}
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke={checked ? '#0b0e14' : 'transparent'}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
    <span className="text-[12px] text-white/50 leading-snug group-hover:text-white/75 transition-colors">
      {label}
    </span>
  </label>
);

const Register: FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  // Signing up with Google, Telegram or Steam is the same call as signing
  // in: the backend creates the account when it has not seen the identity
  // before.
  const google = useGoogleAuth();
  const telegram = useTelegramAuth();
  const steam = useSteamAuth();

  // Prefilled from the homepage teaser form's query string, when it sent one.
  const initialEmail = typeof router.query.email === 'string' ? router.query.email : '';
  const initialMobile = typeof router.query.mobile === 'string' ? router.query.mobile : '';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [mobile, setMobile] = useState(initialMobile);
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState<Record<Check['id'], boolean>>({
    marketing: false,
    terms: false,
  });
  const [loading, setLoading] = useState(false);
  // 'choose' shows the method picker, 'mail' the registration form, and 'otp'
  // the code the backend issues once the account exists.
  const [step, setStep] = useState<SignupStep>('choose');
  // Which signup flow produced the account, so Back from the OTP screen
  // returns to the form the player actually filled in.
  const [via, setVia] = useState<SignupFlow>('mail');
  const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  // Phone signups have no email, so the account is addressed by its mobile.
  const otpTarget = via === 'mail' ? email.trim() : mobile;

  const handleRegister = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Mirrors the backend's Joi rules so the user gets the message inline
    // rather than as a 422 round-trip.
    if (!firstName.trim() || firstName.trim().length < 2) {
      analytics.auth.signUpFailed(via, 'first_name_invalid');
      toast.error('First name must be at least 2 characters');
      return;
    }
    if (!lastName.trim() || lastName.trim().length < 2) {
      analytics.auth.signUpFailed(via, 'last_name_invalid');
      toast.error('Last name must be at least 2 characters');
      return;
    }
    // Only the email flow asks for an address; the phone flow has none.
    if (via === 'mail' && !email.trim()) {
      analytics.auth.signUpFailed(via, 'email_missing');
      toast.error('Email is required');
      return;
    }
    if (!/^[0-9]{10,15}$/.test(mobile)) {
      analytics.auth.signUpFailed(via, 'mobile_invalid');
      toast.error('Mobile must be 10–15 digits');
      return;
    }
    if (password.length < MIN_PASSWORD) {
      analytics.auth.signUpFailed(via, 'password_too_short');
      toast.error(`Password must be at least ${MIN_PASSWORD} characters`);
      return;
    }
    if (!agreed.terms) {
      analytics.auth.signUpFailed(via, 'terms_not_accepted');
      toast.error('You must accept the Terms & Conditions');
      return;
    }

    // Past validation: what the player sent, against what comes back below.
    analytics.auth.signUpSubmitted(via);
    // Consent to marketing is a property of the signup, and the one field on
    // this form worth counting. The address it applies to is not sent.
    analytics.auth.marketingOptIn(agreed.marketing);

    try {
      setLoading(true);

      // Registration always creates a USER (player) account server-side.
      // The endpoint rejects unknown keys, so only these five are sent.
      const res = await apiService.post('/auth/register', {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        // Omitted entirely on the phone flow — the column is nullable and the
        // schema only validates the address when one is sent.
        ...(via === 'mail' ? { email: email.trim() } : {}),
        mobile,
        password,
      });

      if (res?.success) {
        // The account exists but is unverified, and a code is on its way.
        // The username was generated server-side — tell the player, because
        // it is one of the three things they can log in with.
        const issued = (res.data as { username?: string } | undefined)?.username;
        analytics.auth.signUpCompleted(via);
        analytics.auth.otpSent('sign_up', via);
        toast.success(
          issued ? t('register.usernameIssued', { username: issued }) : t('register.success')
        );
        setCode(Array(OTP_LENGTH).fill(''));
        setStep('otp');
      } else {
        analytics.auth.signUpFailed(via, failureReason(res?.message));
        toast.error(res?.message || 'Registration failed');
      }
    } catch (err) {
      const apiErr = err as ApiError;
      // The API returns field-keyed errors on 422; surface the first one.
      const firstFieldError = apiErr?.errors ? Object.values(apiErr.errors)[0] : undefined;
      analytics.auth.signUpFailed(via, failureReason(firstFieldError ?? apiErr));
      toast.error(firstFieldError || apiErr?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Ticks down while the OTP screen is up; gates the resend link the way the
  // backend gates the endpoint.
  useEffect(() => {
    if (step !== 'otp' || cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, cooldown]);

  const submitCode = useCallback(
    async (value: string): Promise<void> => {
      if (value.length < OTP_LENGTH) {
        analytics.auth.otpFailed('sign_up', 'code_incomplete');
        toast.error(t('otp.incomplete'));
        return;
      }

      try {
        setLoading(true);
        const res = await apiService.post('/auth/verify-otp', {
          identifier: otpTarget,
          code: value,
        });

        if (res?.success) {
          // The account is live from here; this is the real end of the funnel.
          analytics.auth.otpVerified('sign_up');
          // Here, not when the form was submitted: an account whose code was
          // never entered is not a signup, and counting it as one overstates
          // the top of every funnel built on this event.
          trackSignupComplete(via);
          toast.success(t('otp.verified'));
          router.push('/auth/login');
        } else {
          analytics.auth.otpFailed('sign_up', failureReason(res?.message));
          toast.error(res?.message || 'Verification failed');
        }
      } catch (err) {
        const apiErr = err as ApiError;
        analytics.auth.otpFailed('sign_up', failureReason(apiErr));
        toast.error(apiErr?.message || 'Verification failed');
        setCode(Array(OTP_LENGTH).fill(''));
      } finally {
        setLoading(false);
      }
    },
    [otpTarget, router, t, via]
  );

  const resendCode = async (): Promise<void> => {
    try {
      analytics.auth.otpResent('sign_up');
      setCooldown(RESEND_SECONDS);
      const res = await apiService.post('/auth/resend-otp', { identifier: otpTarget });
      if (!res?.success) {
        toast.error(res?.message || 'Could not send a new code');
      }
    } catch (err) {
      const apiErr = err as ApiError;
      toast.error(apiErr?.message || 'Could not send a new code');
    }
  };

  const PRIMARY_METHODS = [
    { id: 'phone' as const, label: t('auth.methodPhone') },
    { id: 'mail' as const, label: t('auth.methodMail') },
  ];

  const OTHER_METHODS = [
    { id: 'gmail' as const, label: t('auth.methodGmail') },
    { id: 'telegram' as const, label: t('auth.methodTelegram') },
    { id: 'steam' as const, label: t('auth.methodSteam') },
  ];

  // Mail and Phone are both real signup flows. Gmail, Telegram and Steam
  // hand off to their own popups and come back with a session.
  const handleMethod = (id: AuthMethodId): void => {
    if (id === 'gmail') {
      analytics.auth.signUpStarted('google');
      google.signIn();
      return;
    }

    if (id === 'telegram') {
      telegram.signIn();
      return;
    }

    if (id === 'steam') {
      steam.signIn();
      return;
    }

    if (id === 'mail' || id === 'phone') {
      analytics.auth.signUpStarted(id);
      setVia(id);
      setStep(id);
      return;
    }
    // Every method this screen offers is handled above. This only fires if a
    // new entry is added without a branch here.
    toast.info(t('auth.methodSoon', { method: String(id) }));
  };

  if (step === 'otp') {
    return (
      <AuthShell
        subtitle={t('otp.title')}
        caption={t('otp.sentTo', { target: otpTarget })}
        onBack={() => setStep(via)}
        backLabel={t('auth.back')}
        action={{ href: '/auth/login', label: t('register.login') }}
        legal={t('auth.legal')}
      >
        <div className="space-y-5">
          <OtpInput value={code} onChange={setCode} onComplete={submitCode} disabled={loading} />

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
            onClick={() => submitCode(code.join(''))}
            disabled={loading}
            className="glass-btn h-13 flex items-center justify-center text-[15px] font-semibold"
          >
            {loading ? <ButtonLoader /> : t('otp.submit')}
          </button>
        </div>
      </AuthShell>
    );
  }

  if (step === 'choose') {
    return (
      <AuthShell
        subtitle={t('auth.methodRegister')}
        action={{ href: '/auth/login', label: t('register.login') }}
        legal={t('auth.legal')}
      >
        <AuthMethods
          methods={PRIMARY_METHODS}
          onSelect={handleMethod}
          otherLabel={t('auth.methodOther')}
          onSelectOther={() => setStep('other')}
        />
      </AuthShell>
    );
  }

  if (step === 'other') {
    return (
      <AuthShell
        subtitle={t('auth.methodOther')}
        onBack={() => setStep('choose')}
        backLabel={t('auth.back')}
        action={{ href: '/auth/login', label: t('register.login') }}
        legal={t('auth.legal')}
      >
        <AuthMethods methods={OTHER_METHODS} onSelect={handleMethod} />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      width="lg"
      subtitle={t('register.title')}
      caption={t('register.subtitle')}
      onBack={() => setStep('choose')}
      backLabel={t('auth.back')}
      action={{ href: '/auth/login', label: t('register.login') }}
      legal={t('auth.legal')}
    >
      <form className="space-y-3.5" onSubmit={handleRegister}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AuthField
            id="reg-first"
            label={t('auth.firstName')}
            autoComplete="given-name"
            placeholder={t('auth.firstName')}
            icon={<UserIcon />}
            value={firstName}
            onChange={setFirstName}
          />
          <AuthField
            id="reg-last"
            label={t('auth.lastName')}
            autoComplete="family-name"
            placeholder={t('auth.lastName')}
            value={lastName}
            onChange={setLastName}
          />
        </div>

        {via === 'mail' && (
          <AuthField
            id="reg-email"
            label={t('auth.email')}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t('auth.email')}
            icon={<MailIcon />}
            value={email}
            onChange={setEmail}
          />
        )}

        <AuthField
          id="reg-mobile"
          label={t('auth.mobile')}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder={t('register.mobilePlaceholder')}
          icon={<PhoneIcon />}
          value={mobile}
          onChange={(v) => setMobile(v.replace(/\D/g, ''))}
        />

        <AuthField
          id="reg-password"
          label={t('auth.password')}
          type="password"
          autoComplete="new-password"
          placeholder={t('auth.password')}
          icon={<LockIcon />}
          value={password}
          onChange={setPassword}
          hint={`• ${t('register.passwordHint', { min: MIN_PASSWORD })}`}
        />

        <div className="space-y-2.5 pt-1.5">
          {CHECKS.map((c) => (
            <CheckRow
              key={c.id}
              id={`reg-${c.id}`}
              label={c.label}
              checked={agreed[c.id]}
              onToggle={() => setAgreed((a) => ({ ...a, [c.id]: !a[c.id] }))}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="glass-btn h-13 mt-1 flex items-center justify-center text-[15px] font-semibold"
        >
          {loading ? <ButtonLoader /> : t('register.submit')}
        </button>
      </form>
    </AuthShell>
  );
};

const RegisterPage: FC = () => (
  <PublicRoute>
    <Register />
  </PublicRoute>
);

export default RegisterPage;
