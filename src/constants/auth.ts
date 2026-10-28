import type { TranslationKey } from '@/i18n/locales';

/**
 * Signup rules shared by the register modal's hints and its validation, so
 * what the tooltip promises and what the form enforces cannot drift apart.
 */

/** Link targets that open the auth modals on the lobby (see AuthModalContext). */
export const REGISTER_HREF = '/?auth=register';
export const LOGIN_HREF = '/?auth=login';
export const FORGOT_PASSWORD_HREF = '/?auth=forgot';

export const SUPPORT_EMAIL = 'support@xyzlife.top';

export const PASSWORD_MIN_LENGTH = 10;

export const PASSWORD_MAX_LENGTH = 100;

export interface PasswordRule {
  id: 'length' | 'lower' | 'upper' | 'special';
  labelKey: TranslationKey;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: 'length',
    labelKey: 'registerModal.ruleLength',
    test: (p) => p.length >= PASSWORD_MIN_LENGTH,
  },
  { id: 'lower', labelKey: 'registerModal.ruleLower', test: (p) => /[a-z]/.test(p) },
  { id: 'upper', labelKey: 'registerModal.ruleUpper', test: (p) => /[A-Z]/.test(p) },
  { id: 'special', labelKey: 'registerModal.ruleSpecial', test: (p) => /[^A-Za-z0-9\s]/.test(p) },
];

/**
 * 3–20 letters, digits or underscores, and never digits alone: login treats
 * an all-digit identifier as a mobile number (and anything with "@" as an
 * email), so such a username could never be used to sign in.
 */
export const USERNAME_PATTERN = /^(?!\d+$)[A-Za-z0-9_]{3,20}$/;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MOBILE_PATTERN = /^[0-9]{6,14}$/;

export const SIGNUP_CODE_PATTERN = /^[A-Za-z0-9_-]{3,50}$/;

export const OTP_RESEND_SECONDS = 60;

export const ANALYTICS_SIGNUP_METHOD = {
  mobile: 'phone',
  email: 'mail',
} as const;

export interface DialCode {
  /** ISO 3166 alpha-2, used as the React key and for the flag. */
  iso: string;
  code: string;
}

/** Dial codes offered beside a mobile number field, most-used first. */
export const DIAL_CODES: DialCode[] = [
  { iso: 'US', code: '+1' },
  { iso: 'GB', code: '+44' },
  { iso: 'IN', code: '+91' },
  { iso: 'AM', code: '+374' },
  { iso: 'AU', code: '+61' },
  { iso: 'DE', code: '+49' },
  { iso: 'FR', code: '+33' },
  { iso: 'ES', code: '+34' },
  { iso: 'IT', code: '+39' },
  { iso: 'BR', code: '+55' },
  { iso: 'PT', code: '+351' },
  { iso: 'TR', code: '+90' },
  { iso: 'RU', code: '+7' },
  { iso: 'AE', code: '+971' },
  { iso: 'SA', code: '+966' },
];
