import { useState, type FC } from 'react';
import { toast } from 'react-toastify';

import { useTranslation } from '@/context/I18nContext';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useTwoFactorLogin, type TwoFactorChallenge } from '@/hooks/useTwoFactorLogin';
import { usePasswordReset, type ResetTarget } from '@/hooks/usePasswordReset';
import { analytics } from '@/services/analytics';
import AuthModalShell from '@/components/auth/AuthModalShell';
import AuthModalFooter from '@/components/auth/AuthModalFooter';
import OtpVerification from '@/components/auth/OtpVerification';
import LoginMethodStep from '@/components/auth/login/LoginMethodStep';
import SocialStep from '@/components/auth/register/SocialStep';
import LoginFormStep from '@/components/auth/login/LoginFormStep';
import ForgotPasswordStep from '@/components/auth/login/ForgotPasswordStep';
import NewPasswordStep from '@/components/auth/login/NewPasswordStep';

import type { TranslationKey } from '@/i18n/locales';
import type { LoginMethod } from '@/types';

export type LoginEntry = 'method' | 'forgot';

interface LoginModalProps {
  onClose: () => void;
  onSwitchToRegister: () => void;
  /** Open straight on Forgot Password (the old reset link lands here). */
  entry?: LoginEntry;
}

type Step = 'method' | 'social' | 'form' | 'forgot' | 'otp' | 'newPassword' | 'twofa';

const FORM_TITLE: Record<LoginMethod, TranslationKey> = {
  username: 'loginModal.withUsername',
  mobile: 'loginModal.withMobile',
  email: 'loginModal.withEmail',
};

const STEP_TITLE: Record<Exclude<Step, 'form'>, TranslationKey> = {
  method: 'loginModal.title',
  social: 'loginModal.loginWith',
  forgot: 'loginModal.forgotTitle',
  otp: 'registerModal.otpTitle',
  newPassword: 'loginModal.newPasswordTitle',
  twofa: 'registerModal.otpTitle',
};

/**
 * Login as a modal:
 *
 *   method → form (username / mobile / email + password)
 *                 └ Forgot Password → code → new password → back to the form
 *
 * Earlier steps stay mounted, hidden, while later ones show, so Back returns
 * to each form as the player left it. A signed-in session closes the modal
 * from AuthModalContext.
 */
const LoginModal: FC<LoginModalProps> = ({ onClose, onSwitchToRegister, entry = 'method' }) => {
  const { t } = useTranslation();
  const google = useGoogleAuth();
  const telegram = useTelegramAuth();
  const reset = usePasswordReset();

  const [step, setStep] = useState<Step>(entry);
  // Set once the password was accepted and a one-time code is owed. The code
  // step only exists while this is set.
  const [pending, setPending] = useState<TwoFactorChallenge | null>(null);
  const twoFactor = useTwoFactorLogin({
    onLoggedIn: onClose,
    onRestart: () => {
      setPending(null);
      setStep('form');
    },
  });
  const [method, setMethod] = useState<LoginMethod>('mobile');
  // The form mounts once a method is chosen and then stays, hidden, behind
  // the reset steps.
  const [formOpened, setFormOpened] = useState(false);
  // After a reset the form reopens with the account filled in; the key
  // remounts it so the prefill takes.
  const [prefill, setPrefill] = useState<{ identifier: string; key: number }>({
    identifier: '',
    key: 0,
  });

  const chooseMethod = (next: LoginMethod): void => {
    analytics.auth.loginStarted(next === 'mobile' ? 'phone' : next === 'email' ? 'mail' : next);
    setMethod(next);
    setFormOpened(true);
    setStep('form');
  };

  const requestCode = async (target: ResetTarget): Promise<boolean> => {
    const sent = await reset.requestCode(target);
    if (sent) setStep('otp');
    return sent;
  };

  const submitNewPassword = async (password: string): Promise<void> => {
    const outcome = await reset.submitNewPassword(password);
    if (outcome === 'bad-code') setStep('otp');
    if (outcome === 'done' && reset.target) {
      setMethod(reset.target.channel);
      setPrefill((p) => ({ identifier: reset.target?.identifier ?? '', key: p.key + 1 }));
      setFormOpened(true);
      setStep('form');
    }
  };

  const back = (): void => {
    const previous: Record<Step, Step> = {
      method: 'method',
      social: 'method',
      form: 'method',
      // Opened straight on Forgot Password there is no form to return to.
      forgot: entry === 'forgot' ? 'method' : 'form',
      otp: 'forgot',
      newPassword: 'otp',
      twofa: 'form',
    };
    if (step === 'twofa') setPending(null);
    setStep(previous[step]);
  };

  const inResetFlow = step === 'forgot' || step === 'otp' || step === 'newPassword';
  const title = step === 'form' ? t(FORM_TITLE[method]) : t(STEP_TITLE[step]);

  return (
    <AuthModalShell
      titleId="login-modal-title"
      title={title}
      hero={step === 'method'}
      section={step === 'social'}
      onBack={back}
      onClose={onClose}
      footer={
        step === 'method' && (
          <AuthModalFooter actionLabel={t('loginModal.register')} onAction={onSwitchToRegister} />
        )
      }
    >
      {step === 'method' && (
        <LoginMethodStep
          onSelectMethod={chooseMethod}
          onGoogle={() => {
            analytics.auth.loginStarted('google');
            google.signIn();
          }}
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

      {formOpened && step !== 'method' && step !== 'social' && (
        <div hidden={step !== 'form'}>
          <LoginFormStep
            key={`${method}-${prefill.key}`}
            method={method}
            initialIdentifier={prefill.identifier}
            onForgotPassword={() => setStep('forgot')}
            onLoggedIn={onClose}
            onTwoFactor={(challenge) => {
              setPending(challenge);
              setStep('twofa');
            }}
          />
        </div>
      )}

      {inResetFlow && (
        <div hidden={step !== 'forgot'}>
          <ForgotPasswordStep
            initialChannel={method === 'email' ? 'email' : 'mobile'}
            busy={reset.busy}
            onRequest={requestCode}
          />
        </div>
      )}

      {step === 'otp' && reset.target && (
        <OtpVerification
          channel={reset.target.channel}
          target={reset.target.identifier}
          onSubmit={(code) => {
            // Only kept here; the API checks it with the new password.
            reset.setCode(code);
            setStep('newPassword');
            return true;
          }}
          onResend={reset.resendCode}
        />
      )}

      {step === 'twofa' && pending && (
        <OtpVerification
          channel={pending.channel}
          target={pending.target}
          onSubmit={(code) => twoFactor.verify(pending, code)}
          onResend={() => twoFactor.resend(pending)}
        />
      )}

      {step === 'newPassword' && <NewPasswordStep busy={reset.busy} onSubmit={submitNewPassword} />}
    </AuthModalShell>
  );
};

export default LoginModal;
