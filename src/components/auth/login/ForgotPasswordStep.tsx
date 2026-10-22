import { useState, type FC, type FormEvent } from 'react';
import { toast } from 'react-toastify';

import { useTranslation } from '@/context/I18nContext';
import TextField from '@/components/ui/TextField';
import Button from '@/components/ui/Button';
import PhoneField from '@/components/auth/PhoneField';
import { DIAL_CODES, EMAIL_PATTERN, MOBILE_PATTERN } from '@/constants/auth';

import type { ResetTarget } from '@/hooks/usePasswordReset';
import type { ContactChannel } from '@/types';

interface ForgotPasswordStepProps {
  initialChannel: ContactChannel;
  busy: boolean;
  /** Sends the code; resolves true once it is on its way. */
  onRequest: (target: ResetTarget) => Promise<boolean>;
}

/** Ask for the reset code by mobile or email; the link under Send swaps channel. */
const ForgotPasswordStep: FC<ForgotPasswordStepProps> = ({ initialChannel, busy, onRequest }) => {
  const { t } = useTranslation();
  const [channel, setChannel] = useState<ContactChannel>(initialChannel);
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [dialCode, setDialCode] = useState(DIAL_CODES[0].code);
  const [invalid, setInvalid] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const valid =
      channel === 'email' ? EMAIL_PATTERN.test(email.trim()) : MOBILE_PATTERN.test(mobile);
    if (!valid) {
      setInvalid(true);
      toast.error(t(channel === 'email' ? 'registerModal.errEmail' : 'registerModal.errMobile'));
      return;
    }
    await onRequest({
      channel,
      identifier: channel === 'email' ? email.trim().toLowerCase() : mobile,
      ...(channel === 'mobile' ? { countryCode: dialCode } : {}),
    });
  };

  const switchChannel = (): void => {
    setChannel((c) => (c === 'email' ? 'mobile' : 'email'));
    setInvalid(false);
  };

  return (
    <form noValidate onSubmit={submit} className="text-center">
      <p className="mx-auto max-w-[360px] text-[14px] leading-relaxed text-white/65">
        {t(channel === 'email' ? 'loginModal.forgotEmailHint' : 'loginModal.forgotMobileHint')}
      </p>

      <div className="mt-6 text-start">
        {channel === 'mobile' ? (
          <PhoneField
            id="forgot-mobile"
            label={t('registerModal.mobile')}
            placeholder={t('registerModal.mobilePlaceholder')}
            dialLabel={t('registerModal.dialCode')}
            dialCode={dialCode}
            onDialCodeChange={setDialCode}
            value={mobile}
            onChange={(digits) => {
              setMobile(digits);
              setInvalid(false);
            }}
            invalid={invalid}
          />
        ) : (
          <TextField
            id="forgot-email"
            label={t('registerModal.email')}
            placeholder={t('registerModal.emailPlaceholder')}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setInvalid(false);
            }}
            invalid={invalid}
          />
        )}
      </div>

      <Button type="submit" fullWidth loading={busy} className="mt-8">
        {t('loginModal.send')}
      </Button>

      <button
        type="button"
        onClick={switchChannel}
        className="mt-6 text-[14px] text-white/80 underline underline-offset-2 transition-colors hover:text-white"
      >
        {t(channel === 'email' ? 'loginModal.useMobile' : 'loginModal.useEmail')}
      </button>
    </form>
  );
};

export default ForgotPasswordStep;
