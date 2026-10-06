import { useState, type FormEvent } from 'react';
import { toast } from 'react-toastify';

import { useTranslation } from '@/context/I18nContext';
import { registerAccount } from '@/services/auth';
import { TURNSTILE_ENABLED } from '@/components/auth/TurnstileWidget';
import {
  DIAL_CODES,
  EMAIL_PATTERN,
  MOBILE_PATTERN,
  PASSWORD_RULES,
  USERNAME_PATTERN,
} from '@/constants/auth';

import type { TranslationKey } from '@/i18n/locales';
import type { ApiError, RegisterRequest, SignupMethod } from '@/types';

export interface SignupValues {
  username: string;
  email: string;
  mobile: string;
  dialCode: string;
  password: string;
  hasCodes: boolean;
  promoCode: string;
  referralCode: string;
}

type FieldName = 'username' | 'email' | 'mobile' | 'password' | 'captcha';

/** What the OTP step needs once the account exists. */
export interface SignupTarget {
  method: SignupMethod;
  /** Sent back to the API with the code: the email, or the mobile digits. */
  identifier: string;
}

interface Options {
  method: SignupMethod;
  initialMobile?: string;
  initialDialCode?: string;
  onRegistered: (target: SignupTarget) => void;
}

/** Checks in display order; the first failure is the one the player sees. */
const validate = (
  method: SignupMethod,
  v: SignupValues,
  captchaToken: string | null
): { field: FieldName; message: TranslationKey } | null => {
  if (!USERNAME_PATTERN.test(v.username.trim())) {
    return { field: 'username', message: 'registerModal.errUsername' };
  }
  if (method === 'email' && !EMAIL_PATTERN.test(v.email.trim())) {
    return { field: 'email', message: 'registerModal.errEmail' };
  }
  if (method === 'mobile' && !MOBILE_PATTERN.test(v.mobile)) {
    return { field: 'mobile', message: 'registerModal.errMobile' };
  }
  if (!PASSWORD_RULES.every((rule) => rule.test(v.password))) {
    return { field: 'password', message: 'registerModal.errPassword' };
  }
  if (TURNSTILE_ENABLED && !captchaToken) {
    return { field: 'captcha', message: 'registerModal.errCaptcha' };
  }
  return null;
};

/** Only the fields the chosen flow uses; optional ones left out when blank. */
const toRequest = (
  method: SignupMethod,
  v: SignupValues,
  captchaToken: string | null
): RegisterRequest => {
  const promo = v.hasCodes ? v.promoCode.trim() : '';
  const referral = v.hasCodes ? v.referralCode.trim() : '';

  return {
    username: v.username.trim(),
    password: v.password,
    ...(method === 'email'
      ? { email: v.email.trim().toLowerCase() }
      : { mobile: v.mobile, country_code: v.dialCode }),
    ...(promo ? { promo_code: promo } : {}),
    ...(referral ? { referral_code: referral } : {}),
    ...(captchaToken ? { captcha_token: captchaToken } : {}),
  };
};

/**
 * State, validation and submit for the register modal's two signup forms.
 * The component only renders; everything that decides lives here.
 */
export const useSignupForm = ({
  method,
  initialMobile = '',
  initialDialCode,
  onRegistered,
}: Options) => {
  const { t } = useTranslation();

  const [values, setValues] = useState<SignupValues>({
    username: '',
    email: '',
    mobile: initialMobile.replace(/\D/g, ''),
    dialCode: DIAL_CODES.some((d) => d.code === initialDialCode)
      ? (initialDialCode as string)
      : DIAL_CODES[0].code,
    password: '',
    hasCodes: false,
    promoCode: '',
    referralCode: '',
  });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  // Turnstile tokens are single-use: bumping this remounts the widget for a
  // fresh challenge after a rejected submit.
  const [captchaKey, setCaptchaKey] = useState(0);
  const [invalid, setInvalid] = useState<FieldName | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const setField = <K extends keyof SignupValues>(key: K, value: SignupValues[K]): void => {
    setValues((prev) => ({ ...prev, [key]: value }));
    // Editing the flagged field clears its red outline.
    if (key === invalid) setInvalid(null);
  };

  const submit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (submitting) return;

    const error = validate(method, values, captchaToken);
    if (error) {
      setInvalid(error.field);
      toast.error(t(error.message));
      return;
    }

    const resetCaptcha = (): void => {
      if (!captchaToken) return;
      setCaptchaToken(null);
      setCaptchaKey((k) => k + 1);
    };

    setInvalid(null);
    setSubmitting(true);
    try {
      const body = toRequest(method, values, captchaToken);
      const res = await registerAccount(body);

      if (!res?.success) {
        resetCaptcha();
        toast.error(res?.message || t('registerModal.failed'));
        return;
      }

      onRegistered({
        method,
        identifier: method === 'email' ? (body.email as string) : (body.mobile as string),
      });
    } catch (err) {
      resetCaptcha();
      const apiErr = err as ApiError;
      // A 422 carries field-keyed messages; surface the first one.
      const fieldError = apiErr?.errors ? Object.values(apiErr.errors)[0] : undefined;
      toast.error(fieldError || apiErr?.message || t('registerModal.failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return { values, setField, setCaptchaToken, captchaKey, invalid, submitting, submit };
};
