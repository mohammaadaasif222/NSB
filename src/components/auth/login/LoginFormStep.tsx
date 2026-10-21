import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { useLoginForm } from '@/hooks/useLoginForm';
import TextField from '@/components/ui/TextField';
import PasswordField from '@/components/ui/PasswordField';
import Button from '@/components/ui/Button';
import PhoneField from '@/components/auth/PhoneField';
import NeedHelpLink from '@/components/auth/NeedHelpLink';

import type { TwoFactorChallenge } from '@/hooks/useTwoFactorLogin';
import type { LoginMethod } from '@/types';

interface LoginFormStepProps {
  method: LoginMethod;
  initialIdentifier?: string;
  onForgotPassword: () => void;
  onLoggedIn: () => void;
  onTwoFactor?: (challenge: TwoFactorChallenge) => void;
}

/**
 * Password login for any of the three credentials. Only the first field
 * changes with the method; password, Forgot Password and submit are shared.
 */
const LoginFormStep: FC<LoginFormStepProps> = ({
  method,
  initialIdentifier,
  onForgotPassword,
  onLoggedIn,
  onTwoFactor,
}) => {
  const { t } = useTranslation();
  const { values, setField, invalid, submitting, submit } = useLoginForm({
    method,
    initialIdentifier,
    onLoggedIn,
    onTwoFactor,
  });
  const idPrefix = `login-${method}`;

  return (
    <form noValidate onSubmit={submit} className="space-y-3.5">
      {method === 'mobile' ? (
        <PhoneField
          id={`${idPrefix}-mobile`}
          label={t('registerModal.mobile')}
          placeholder={t('registerModal.mobilePlaceholder')}
          dialLabel={t('registerModal.dialCode')}
          dialCode={values.dialCode}
          onDialCodeChange={(code) => setField('dialCode', code)}
          value={values.mobile}
          onChange={(digits) => setField('mobile', digits)}
          invalid={invalid === 'mobile'}
        />
      ) : method === 'email' ? (
        <TextField
          id={`${idPrefix}-email`}
          label={t('registerModal.email')}
          placeholder={t('registerModal.emailPlaceholder')}
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={values.identifier}
          onChange={(e) => setField('identifier', e.target.value)}
          invalid={invalid === 'identifier'}
        />
      ) : (
        <TextField
          id={`${idPrefix}-username`}
          label={t('loginModal.username')}
          placeholder={t('loginModal.usernamePlaceholder')}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          value={values.identifier}
          onChange={(e) => setField('identifier', e.target.value)}
          invalid={invalid === 'identifier'}
        />
      )}

      <PasswordField
        id={`${idPrefix}-password`}
        label={t('auth.password')}
        placeholder={t('loginModal.passwordPlaceholder')}
        autoComplete="current-password"
        value={values.password}
        onChange={(e) => setField('password', e.target.value)}
        invalid={invalid === 'password'}
      />

      {/* `space-y` already leaves 14 under each row: the phone design wants
          Forgot 5 under the password, Login 24 under it, Need help 20 under
          that. */}
      <div className="flex justify-end max-sm:!-mt-[9px] sm:!mt-4">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-[14px] text-[#c8ccd8] transition-colors hover:text-white sm:text-white/80"
        >
          {t('loginModal.forgot')}
        </button>
      </div>

      <Button type="submit" fullWidth loading={submitting} className="max-sm:!mt-[10px] sm:!mt-6">
        {t('loginModal.submit')}
      </Button>

      <div className="text-center max-sm:!mt-[6px] sm:!mt-6">
        <NeedHelpLink subject={t('misc.help.loginSubject')} />
      </div>
    </form>
  );
};

export default LoginFormStep;
