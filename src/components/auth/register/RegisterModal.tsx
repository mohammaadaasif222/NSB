import { useCallback, useState, type FC } from 'react';
import { toast } from 'react-toastify';

import { useTranslation } from '@/context/I18nContext';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import AuthModalShell from '@/components/auth/AuthModalShell';
import AuthModalFooter from '@/components/auth/AuthModalFooter';
import MethodStep from '@/components/auth/register/MethodStep';
import SignupFormStep from '@/components/auth/register/SignupFormStep';
import OtpStep from '@/components/auth/register/OtpStep';

import type { TranslationKey } from '@/i18n/locales';
import type { SignupTarget } from '@/hooks/useSignupForm';
import type { SignupMethod } from '@/types';

export interface RegisterPrefill {
  /** Skip the picker and open this form directly. */
  method?: SignupMethod;
  /** Digits typed into the lobby's signup teaser; implies the mobile form. */
  mobile?: string;
  /** Dial code picked beside that number. */
  dialCode?: string;
}

interface RegisterModalProps {
  onClose: () => void;
  /** Swap to the login modal (the footer's Login, and after verification). */
  onSwitchToLogin: () => void;
  prefill?: RegisterPrefill;
}

type Step = 'method' | 'form' | 'otp';

const FORM_TITLE: Record<SignupMethod, TranslationKey> = {
  mobile: 'registerModal.withMobile',
  email: 'registerModal.withEmail',
};

/**
 * Registration as a modal: method picker → mobile or email form → OTP.
 *
 * Mounted only while open (see AuthModalContext), so every open starts clean.
 * The form stays mounted, hidden, behind the OTP step: Back from the code
 * screen returns to the form exactly as the player left it.
 */
const RegisterModal: FC<RegisterModalProps> = ({ onClose, onSwitchToLogin, prefill }) => {
  const { t } = useTranslation();
  const google = useGoogleAuth();
  const telegram = useTelegramAuth();

  const initialMethod = prefill?.mobile ? 'mobile' : prefill?.method;
  const [step, setStep] = useState<Step>(initialMethod ? 'form' : 'method');
  const [method, setMethod] = useState<SignupMethod>(initialMethod ?? 'mobile');
  const [target, setTarget] = useState<SignupTarget | null>(null);

  const chooseMethod = (next: SignupMethod): void => {
    setMethod(next);
    setStep('form');
  };

  const handleRegistered = useCallback((next: SignupTarget): void => {
    setTarget(next);
    setStep('otp');
  }, []);

  const title =
    step === 'method'
      ? t('registerModal.title')
      : step === 'form'
        ? t(FORM_TITLE[method])
        : t('registerModal.otpTitle');

  return (
    <AuthModalShell
      titleId="register-modal-title"
      title={title}
      hero={step === 'method'}
      onBack={() => setStep(step === 'otp' ? 'form' : 'method')}
      onClose={onClose}
      footer={
        step === 'method' && (
          <AuthModalFooter actionLabel={t('register.login')} onAction={onSwitchToLogin} />
        )
      }
    >
      {step === 'method' && (
        <MethodStep
          onSelectMethod={chooseMethod}
          onGoogle={google.signIn}
          onTelegram={telegram.signIn}
          onUnavailable={(provider) => toast.info(t('auth.methodSoon', { method: provider }))}
          googleBusy={google.loading}
        />
      )}

      {step !== 'method' && (
        <div hidden={step === 'otp'}>
          <SignupFormStep
            key={method}
            method={method}
            initialMobile={prefill?.mobile}
            initialDialCode={prefill?.dialCode}
            onRegistered={handleRegistered}
          />
        </div>
      )}

      {step === 'otp' && target && <OtpStep target={target} onVerified={onSwitchToLogin} />}

      {step !== 'otp' && (
        <p className="mx-auto mt-6 max-w-[300px] text-center text-[13px] leading-relaxed text-white/60 sm:text-[14px]">
          {t('registerModal.legal')}
        </p>
      )}
    </AuthModalShell>
  );
};

export default RegisterModal;
