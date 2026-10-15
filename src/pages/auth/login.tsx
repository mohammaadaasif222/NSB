import { useState, type ComponentProps, type FC, type FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import apiService from '@/services/api';
import { encryptPassword } from '@/utils/crypto';
import { isPlatformRole } from '@/constants/roles';
import { REGISTER_HREF } from '@/constants/auth';
import { analytics, failureReason, type AuthMethod } from '@/services/analytics';

import PublicRoute from '@/routes/PublicRoute';
import ButtonLoader from '@/components/ButtonLoader';
import AuthShell from '@/components/auth/AuthShell';
import AuthField, { MailIcon, LockIcon, PhoneIcon, UserIcon } from '@/components/auth/AuthField';
import AuthMethods, { type AuthMethodId } from '@/components/auth/AuthMethods';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useSteamAuth } from '@/hooks/useSteamAuth';
import { useTwoFactorLogin, type TwoFactorChallenge } from '@/hooks/useTwoFactorLogin';
import OtpVerification from '@/components/auth/OtpVerification';

import type { ApiError, JwtPayload, LoginResponseData } from '@/types';

/** The three credentials the backend resolves; Gmail is not wired up yet. */
type CredentialMethod = 'mail' | 'phone' | 'username';

const isCredentialMethod = (id: AuthMethodId): id is CredentialMethod =>
  id === 'mail' || id === 'phone' || id === 'username';

const Login: FC = () => {
  // One field, whichever credential the chosen method asks for. The backend
  // works out from the value itself whether it is an email, a mobile number
  // or a username, so all three post the same body.
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [step, setStep] = useState<'choose' | 'other' | CredentialMethod>('choose');

  // Set when the password was right and a one-time code is owed (2FA login).
  const [pending, setPending] = useState<TwoFactorChallenge | null>(null);

  const { login } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const google = useGoogleAuth();
  const telegram = useTelegramAuth();
  const steam = useSteamAuth();

  const twoFactor = useTwoFactorLogin({
    onLoggedIn: () => void router.push('/'),
    onRestart: () => setPending(null),
  });

  const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // This form only renders once a credential method has been picked, so
    // `step` is never 'choose' or 'other' by the time anything can be submitted.
    const method: AuthMethod = step === 'choose' || step === 'other' ? 'mail' : step;

    if (!identifier.trim() || !password) {
      analytics.auth.loginFailed(method, 'credentials_missing');
      toast.error(t('auth.credentialsRequired'));
      return;
    }

    try {
      setLoading(true);

      const securePassword = await encryptPassword(password);

      // The PLAYER login endpoint. System accounts (Super Master, Master and the
      // operations roles) belong on the admin console and are rejected here
      // by the backend with the same generic 401 as a bad password.
      const response = await apiService.post<LoginResponseData>('/auth/user/login', {
        identifier: identifier.trim(),
        password: securePassword,
      });

      const challenge = response?.data as
        | (Partial<LoginResponseData> & {
            otp_required?: boolean;
            challenge?: string;
            channel?: 'email' | 'mobile';
            target?: string;
          })
        | undefined;
      if (response?.success && challenge?.otp_required && challenge.challenge) {
        setPassword('');
        setPending({
          challenge: challenge.challenge,
          channel: challenge.channel ?? 'mobile',
          target: challenge.target ?? '',
        });
        return;
      }

      if (response?.success) {
        if (response?.data?.token) {
          // Belt and braces: the backend already restricts this endpoint to
          // platform roles, but verifying the token locally means a
          // misconfigured backend can never sign an operator into the player app.
          let role: string | undefined;
          try {
            role = jwtDecode<JwtPayload>(response.data.token).role;
          } catch {
            analytics.auth.loginFailed(method, 'malformed_token');
            toast.error(t('misc.auth.malformedToken'));
            return;
          }

          if (!isPlatformRole(role)) {
            analytics.auth.loginFailed(method, 'operator_account');
            toast.error(t('loginModal.operatorAccount'));
            return;
          }

          login(response.data.token);
          analytics.auth.loginCompleted(method);
          router.push('/');
          toast.success(t('login.success'));
        } else {
          analytics.auth.loginFailed(method, 'token_missing');
          toast.error(t('loginModal.failed'));
          console.error('Login failed: token missing from response');
        }
      } else {
        analytics.auth.loginFailed(method, failureReason(response?.message));
        toast.error(response?.message || t('loginModal.failed'));
      }
    } catch (err) {
      const apiErr = err as ApiError;
      analytics.auth.loginFailed(method, failureReason(apiErr));
      console.error(apiErr);
      toast.error(apiErr?.message || t('loginModal.failed'));
    } finally {
      setLoading(false);
    }
  };

  const PRIMARY_METHODS = [
    { id: 'phone' as const, label: t('auth.methodPhone') },
    { id: 'mail' as const, label: t('auth.methodMail') },
    { id: 'username' as const, label: t('auth.methodUsername') },
  ];

  const OTHER_METHODS = [
    { id: 'gmail' as const, label: t('auth.methodGmail') },
    { id: 'telegram' as const, label: t('auth.methodTelegram') },
    { id: 'steam' as const, label: t('auth.methodSteam') },
  ];

  // Mail, Phone and Username all reach the same endpoint; Gmail, Telegram
  // and Steam hand off to their own popups and come back with a session.
  const handleMethod = (id: AuthMethodId): void => {
    if (id === 'gmail') {
      analytics.auth.loginStarted('google');
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

    if (isCredentialMethod(id)) {
      analytics.auth.loginStarted(id);
      setIdentifier('');
      setPassword('');
      setStep(id);
      return;
    }
    // Every method this screen offers is handled above. This only fires if a
    // new entry is added without a branch here.
    toast.info(t('auth.methodSoon', { method: String(id) }));
  };

  // What the single credential field looks like for the chosen method. Only
  // presentation differs — every one of them posts `identifier`.
  const FIELD: Record<CredentialMethod, ComponentProps<typeof AuthField>> = {
    mail: {
      id: 'login-identifier',
      label: t('auth.email'),
      type: 'email',
      inputMode: 'email',
      autoComplete: 'email',
      icon: <MailIcon />,
      value: identifier,
      onChange: setIdentifier,
    },
    phone: {
      id: 'login-identifier',
      label: t('auth.mobile'),
      type: 'tel',
      inputMode: 'tel',
      autoComplete: 'tel',
      icon: <PhoneIcon />,
      value: identifier,
      onChange: setIdentifier,
    },
    username: {
      id: 'login-identifier',
      label: t('auth.methodUsername'),
      inputMode: 'text',
      autoComplete: 'username',
      icon: <UserIcon />,
      value: identifier,
      onChange: setIdentifier,
    },
  };

  if (pending) {
    return (
      <AuthShell
        subtitle={t('registerModal.otpTitle')}
        onBack={() => setPending(null)}
        backLabel={t('auth.back')}
        action={{ href: REGISTER_HREF, label: t('login.register') }}
        legal={t('auth.legal')}
      >
        <OtpVerification
          channel={pending.channel}
          target={pending.target}
          onSubmit={(code) => twoFactor.verify(pending, code)}
          onResend={() => twoFactor.resend(pending)}
        />
      </AuthShell>
    );
  }

  if (step === 'choose') {
    return (
      <AuthShell
        subtitle={t('auth.methodLogin')}
        action={{ href: REGISTER_HREF, label: t('login.register') }}
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
        action={{ href: REGISTER_HREF, label: t('login.register') }}
        legal={t('auth.legal')}
      >
        <AuthMethods
          methods={OTHER_METHODS}
          onSelect={handleMethod}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      subtitle={t('login.title')}
      caption={t('login.subtitle')}
      onBack={() => setStep('choose')}
      backLabel={t('auth.back')}
      action={{ href: REGISTER_HREF, label: t('login.register') }}
      legal={t('auth.legal')}
    >
      <form className="space-y-3.5" onSubmit={handleLogin}>
        <AuthField {...FIELD[step]} />

        <div>
          <AuthField
            id="login-password"
            label={t('auth.password')}
            type="password"
            autoComplete="current-password"
            placeholder={t('auth.password')}
            icon={<LockIcon />}
            value={password}
            onChange={setPassword}
          />
          <div className="flex justify-end mt-2">
            <Link
              href="/auth/reset-password"
              className="text-[12px] text-white/50 hover:text-white/85 transition-colors"
            >
              {t('login.forgot')}
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="glass-btn h-13 mt-1 flex items-center justify-center text-[15px] font-semibold"
        >
          {loading ? <ButtonLoader /> : t('login.submit')}
        </button>
      </form>
    </AuthShell>
  );
};

const LoginPage: FC = () => (
  <PublicRoute>
    <Login />
  </PublicRoute>
);

export default LoginPage;
