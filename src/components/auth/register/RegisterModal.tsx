import { useCallback, useState, type FC } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { isPlayerToken } from '@/lib/session';
import { analytics } from '@/services/analytics';
import { ANALYTICS_SIGNUP_METHOD } from '@/constants/auth';
import { trackSignupComplete } from '@/utils/events';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import AuthModalShell from '@/components/auth/AuthModalShell';
import AuthModalFooter from '@/components/auth/AuthModalFooter';
import MethodStep from '@/components/auth/register/MethodStep';
import SignupFormStep from '@/components/auth/register/SignupFormStep';
import OtpStep from '@/components/auth/register/OtpStep';
import SocialStep from '@/components/auth/register/SocialStep';

import type { TranslationKey } from '@/i18n/locales';
import type { SignupTarget } from '@/hooks/useSignupForm';
import type { SignupMethod } from '@/types';

export interface RegisterPrefill {
  method?: SignupMethod;
  /** Open on "Register with" — the social providers — as "more option" does. */
  social?: boolean;
  mobile?: string;
  dialCode?: string;
}

interface RegisterModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
  prefill?: RegisterPrefill;
}

type Step = 'method' | 'social' | 'form' | 'otp';

const FORM_TITLE: Record<SignupMethod, TranslationKey> = {
  mobile: 'registerModal.withMobile',
  email: 'registerModal.withEmail',
};

const RegisterModal: FC<RegisterModalProps> = ({ onClose, onSwitchToLogin, prefill }) => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const router = useRouter();
  const google = useGoogleAuth();
  const telegram = useTelegramAuth();

  const initialMethod = prefill?.mobile ? 'mobile' : prefill?.method;
  const [step, setStep] = useState<Step>(
    initialMethod ? 'form' : prefill?.social ? 'social' : 'method'
  );
  const [method, setMethod] = useState<SignupMethod>(initialMethod ?? 'mobile');
  const [target, setTarget] = useState<SignupTarget | null>(null);

  const chooseMethod = (next: SignupMethod): void => {
    analytics.auth.signUpStarted(ANALYTICS_SIGNUP_METHOD[next]);
    setMethod(next);
    setStep('form');
  };

  const finishSignup = useCallback(
    (token?: string): void => {
      if (!isPlayerToken(token)) {
        onSwitchToLogin();
        return;
      }

      login(token);
      if (router.pathname !== '/') void router.push('/');
    },
    [login, onSwitchToLogin, router]
  );

  const handleRegistered = useCallback(
    (next: SignupTarget): void => {
      if (!next.otpRequired) {
        trackSignupComplete(ANALYTICS_SIGNUP_METHOD[next.method]);
        toast.success(t('registerModal.created'));
        finishSignup(next.token);
        return;
      }

      setTarget(next);
      setStep('otp');
    },
    [finishSignup, t]
  );

  const title =
    step === 'method'
      ? t('registerModal.title')
      : step === 'social'
        ? t('registerModal.registerWith')
        : step === 'form'
          ? t(FORM_TITLE[method])
          : t('registerModal.otpTitle');

  return (
    <AuthModalShell
      titleId="register-modal-title"
      title={title}
      // The phone design heads the first screen "Registration".
      phoneTitle={step === 'method' ? t('registerModal.titleLong') : undefined}
      hero={step === 'method'}
      section={step === 'social'}
      onBack={() => setStep(step === 'otp' ? 'form' : 'method')}
      onClose={onClose}
      footer={
        step === 'method' && (
          <AuthModalFooter
            actionLabel={t('register.login')}
            onAction={onSwitchToLogin}
            // The phone design sets it 15 under the terms.
            className="max-sm:!mt-[15px]"
          />
        )
      }
    >
      {step === 'method' && (
        <MethodStep
          onSelectMethod={chooseMethod}
          onGoogle={google.signIn}
          onTelegram={telegram.signIn}
          onUnavailable={(provider) => toast.info(t('auth.methodSoon', { method: provider }))}
          onMore={() => setStep('social')}
          googleBusy={google.loading}
        />
      )}
      {step === 'social' && (
        <SocialStep
          onTelegram={telegram.signIn}
          onUnavailable={(provider) => toast.info(t('auth.methodSoon', { method: provider }))}
        />
      )}

      {(step === 'form' || step === 'otp') && (
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

      {step === 'otp' && target && <OtpStep target={target} onVerified={finishSignup} />}

      {(step === 'method' || step === 'form') && (
        <p
          className={`mx-auto max-w-[300px] text-center text-[14px] leading-5 text-[#9da2b4] sm:mt-6 sm:leading-relaxed sm:text-white/60 ${
            step === 'method' ? 'mt-4' : 'mt-5'
          }`}
        >
          {t('registerModal.legal')}
        </p>
      )}
    </AuthModalShell>
  );
};

export default RegisterModal;
