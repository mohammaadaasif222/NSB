import { useState, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { useSeonGuard } from '@/context/SeonGuardContext';
import { isStepUpCancelled } from '@/lib/seon-guard';
import { fieldErrorMessage } from '@/lib/apiError';
import { loginWithPassword } from '@/services/auth';
import { analytics, failureReason, type AuthMethod } from '@/services/analytics';
import { isPlatformRole } from '@/constants/roles';
import { DIAL_CODES, EMAIL_PATTERN, MOBILE_PATTERN } from '@/constants/auth';

import type { TwoFactorChallenge } from '@/hooks/useTwoFactorLogin';
import type { TranslationKey } from '@/i18n/locales';
import type { ApiError, JwtPayload, LoginMethod } from '@/types';

export interface LoginValues {
  /** Username or email, depending on the method. */
  identifier: string;
  mobile: string;
  dialCode: string;
  password: string;
}

type FieldName = 'identifier' | 'mobile' | 'password';

/** The analytics taxonomy predates the modal and names two methods differently. */
const ANALYTICS_METHOD: Record<LoginMethod, AuthMethod> = {
  username: 'username',
  mobile: 'phone',
  email: 'mail',
};

interface Options {
  method: LoginMethod;
  /** Prefill after a password reset, so the player only types the new password. */
  initialIdentifier?: string;
  onLoggedIn: () => void;
  /** The password was right and a one-time code was sent; collect it next. */
  onTwoFactor?: (challenge: TwoFactorChallenge) => void;
}

const validate = (
  method: LoginMethod,
  v: LoginValues
): { field: FieldName; message: TranslationKey } | null => {
  if (method === 'username' && v.identifier.trim().length < 3) {
    return { field: 'identifier', message: 'loginModal.errUsername' };
  }
  if (method === 'email' && !EMAIL_PATTERN.test(v.identifier.trim())) {
    return { field: 'identifier', message: 'registerModal.errEmail' };
  }
  if (method === 'mobile' && !MOBILE_PATTERN.test(v.mobile)) {
    return { field: 'mobile', message: 'registerModal.errMobile' };
  }
  if (!v.password) {
    return { field: 'password', message: 'loginModal.errPassword' };
  }
  return null;
};

/** The value the API resolves: mobile digits, a lowercased email, or a username. */
const identifierFor = (method: LoginMethod, v: LoginValues): string => {
  if (method === 'mobile') return v.mobile;
  if (method === 'email') return v.identifier.trim().toLowerCase();
  return v.identifier.trim();
};

/**
 * State, validation and submit for the login modal's password form. The same
 * endpoint serves all three methods; only the identifier field differs.
 */
export const useLoginForm = ({
  method,
  initialIdentifier = '',
  onLoggedIn,
  onTwoFactor,
}: Options) => {
  const { login } = useAuth();
  const { t } = useTranslation();
  // A risky sign-in is challenged for a one-time code.
  const { run } = useSeonGuard();

  const [values, setValues] = useState<LoginValues>({
    identifier: method === 'mobile' ? '' : initialIdentifier,
    mobile: method === 'mobile' ? initialIdentifier : '',
    dialCode: DIAL_CODES[0].code,
    password: '',
  });
  const [invalid, setInvalid] = useState<FieldName | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const setField = <K extends keyof LoginValues>(key: K, value: LoginValues[K]): void => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (key === invalid) setInvalid(null);
  };

  const submit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (submitting) return;

    const tracked = ANALYTICS_METHOD[method];
    const error = validate(method, values);
    if (error) {
      setInvalid(error.field);
      analytics.auth.loginFailed(tracked, 'credentials_missing');
      toast.error(t(error.message));
      return;
    }

    setInvalid(null);
    setSubmitting(true);
    try {
      const res = await run((headers) => loginWithPassword(
          identifierFor(method, values),
          values.password,
          headers,
          method === 'mobile' ? values.dialCode : undefined
        ));
      const token = res?.data?.token;

      // Password accepted, code owed: the server has sent it and holds the
      // session back. Nothing to sign in with yet.
      if (res?.success && res.data?.otp_required && res.data.challenge && onTwoFactor) {
        setValues((prev) => ({ ...prev, password: '' }));
        onTwoFactor({
          challenge: res.data.challenge,
          channel: res.data.channel ?? 'mobile',
          target: res.data.target ?? '',
        });
        return;
      }

      if (!res?.success || !token) {
        analytics.auth.loginFailed(
          tracked,
          res?.success ? 'token_missing' : failureReason(res?.message)
        );
        toast.error(res?.message || t('loginModal.failed'));
        return;
      }

      // Belt and braces: the endpoint already refuses operator accounts, but
      // checking the token here means a misconfigured backend can never sign
      // an operator into the player app.
      let role: string | undefined;
      try {
        role = jwtDecode<JwtPayload>(token).role;
      } catch {
        analytics.auth.loginFailed(tracked, 'malformed_token');
        toast.error(t('loginModal.failed'));
        return;
      }
      if (!isPlatformRole(role)) {
        analytics.auth.loginFailed(tracked, 'operator_account');
        toast.error(t('loginModal.operatorAccount'));
        return;
      }

      login(token);
      analytics.auth.loginCompleted(tracked);
      toast.success(t('login.success'));
      onLoggedIn();
    } catch (err) {
      if (isStepUpCancelled(err)) return;
      const apiErr = err as ApiError;
      analytics.auth.loginFailed(tracked, failureReason(apiErr));
      // A 422 names the exact problem in `errors` (e.g. mobile vs country code); show that, not "Validation failed".
      toast.error(fieldErrorMessage(err) || apiErr?.message || t('loginModal.failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return { values, setField, invalid, submitting, submit };
};
