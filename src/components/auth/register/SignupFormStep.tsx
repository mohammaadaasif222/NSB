import { useState, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { PASSWORD_MAX_LENGTH } from '@/constants/auth';
import { useSignupForm, type SignupTarget } from '@/hooks/useSignupForm';
import TextField from '@/components/ui/TextField';
import PasswordField from '@/components/ui/PasswordField';
import Checkbox from '@/components/ui/Checkbox';
import Button from '@/components/ui/Button';
import PhoneField from '@/components/auth/PhoneField';
import PasswordRules from '@/components/auth/PasswordRules';
import TurnstileWidget from '@/components/auth/TurnstileWidget';

import type { SignupMethod } from '@/types';

interface SignupFormStepProps {
  method: SignupMethod;
  initialMobile?: string;
  initialDialCode?: string;
  onRegistered: (target: SignupTarget) => void;
}

/**
 * The signup form for either flow. Mobile and email differ only in the
 * identifier field; username, password, codes and captcha are shared.
 */
const SignupFormStep: FC<SignupFormStepProps> = ({
  method,
  initialMobile,
  initialDialCode,
  onRegistered,
}) => {
  const { t, locale } = useTranslation();
  const { values, setField, setCaptchaToken, captchaKey, invalid, submitting, submit } =
    useSignupForm({ method, initialMobile, initialDialCode, onRegistered });
  const [passwordFocused, setPasswordFocused] = useState(false);

  const idPrefix = `reg-${method}`;
  const rulesId = `${idPrefix}-password-rules`;

  return (
    <form noValidate onSubmit={submit} className="space-y-3.5">
      <TextField
        id={`${idPrefix}-username`}
        label={t('registerModal.usernameEmail')}
        placeholder={
          method === 'mobile' ? t('registerModal.usernameMobile') : t('registerModal.usernameEmail')
        }
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        maxLength={20}
        value={values.username}
        onChange={(e) => setField('username', e.target.value)}
        invalid={invalid === 'username'}
        data-autofocus
      />

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
      ) : (
        <TextField
          id={`${idPrefix}-email`}
          label={t('registerModal.email')}
          placeholder={t('registerModal.emailPlaceholder')}
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={values.email}
          onChange={(e) => setField('email', e.target.value)}
          invalid={invalid === 'email'}
        />
      )}

      <div className="relative">
        <PasswordField
          id={`${idPrefix}-password`}
          label={t('auth.password')}
          placeholder={t('registerModal.passwordPlaceholder')}
          autoComplete="new-password"
          // The API's upper bound (utils/passwordPolicy). Capped here so an
          // over-long password is impossible to type rather than accepted by
          // the form's own rules and then refused by the server.
          maxLength={PASSWORD_MAX_LENGTH}
          value={values.password}
          onChange={(e) => setField('password', e.target.value)}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          invalid={invalid === 'password'}
          aria-describedby={rulesId}
        />
        <PasswordRules
          id={rulesId}
          password={values.password}
          visible={passwordFocused || invalid === 'password'}
        />
      </div>

      <Checkbox
        id={`${idPrefix}-codes`}
        checked={values.hasCodes}
        onChange={(checked) => setField('hasCodes', checked)}
        className="pt-1"
      >
        {t('registerModal.hasCodes')}
      </Checkbox>

      {values.hasCodes && (
        <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 min-[380px]:gap-[18px] sm:gap-4">
          <TextField
            id={`${idPrefix}-promo`}
            label={t('registerModal.promoPlaceholder')}
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={50}
            className="text-[13px] sm:text-[15px]"
            value={values.promoCode}
            onChange={(e) => setField('promoCode', e.target.value)}
            invalid={invalid === 'promoCode'}
          />
          <TextField
            id={`${idPrefix}-referral`}
            label={t('registerModal.referralPlaceholder')}
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={50}
            className="text-[13px] sm:text-[15px]"
            value={values.referralCode}
            onChange={(e) => setField('referralCode', e.target.value)}
            invalid={invalid === 'referralCode'}
          />
        </div>
      )}

      <TurnstileWidget
        key={captchaKey}
        onToken={setCaptchaToken}
        language={locale}
        className={`max-sm:!mt-[22px] sm:!mt-8 ${invalid === 'captcha' ? 'ring-2 ring-[#ef4462]/70' : ''}`}
      />

      <Button
        type="submit"
        fullWidth
        loading={submitting}
        // `space-y` leaves 14 under each row; the phone design puts Continue
        // 23 under the captcha.
        className="max-sm:!mt-[9px] sm:!mt-6"
      >
        {t('registerModal.continue')}
      </Button>
    </form>
  );
};

export default SignupFormStep;
