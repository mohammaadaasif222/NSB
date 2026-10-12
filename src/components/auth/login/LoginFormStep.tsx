import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { useLoginForm } from '@/hooks/useLoginForm';
import TextField from '@/components/ui/TextField';
import PasswordField from '@/components/ui/PasswordField';
import Button from '@/components/ui/Button';
import PhoneField from '@/components/auth/PhoneField';
import NeedHelpLink from '@/components/auth/NeedHelpLink';

import type { LoginMethod } from '@/types';

interface LoginFormStepProps {
  method: LoginMethod;
  initialIdentifier?: string;
  onForgotPassword: () => void;
  onLoggedIn: () => void;
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
}) => {
  const { t } = useTranslation();
  const { values, setField, invalid, submitting, submit } = useLoginForm({
    method,
    initialIdentifier,
    onLoggedIn,
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

      <div className="flex justify-end !mt-4">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-[14px] text-white/80 transition-colors hover:text-white"
        >
          {t('loginModal.forgot')}
        </button>
      </div>

      <Button type="submit" fullWidth loading={submitting} className="!mt-6">
        {t('loginModal.submit')}
      </Button>

      <div className="!mt-6 text-center">
        <NeedHelpLink subject={t('misc.help.loginSubject')} />
      </div>
    </form>
  );
};

export default LoginFormStep;
