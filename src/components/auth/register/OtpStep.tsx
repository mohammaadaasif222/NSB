import type { FC } from 'react';
import { toast } from 'react-toastify';

import { useTranslation } from '@/context/I18nContext';
import { resendSignupOtp, verifySignupOtp } from '@/services/auth';
import OtpVerification from '@/components/auth/OtpVerification';

import type { SignupTarget } from '@/hooks/useSignupForm';
import type { ApiError } from '@/types';

interface OtpStepProps {
  target: SignupTarget;
  onVerified: () => void;
}

/** Confirms the code sent to the new account's email or mobile. */
const OtpStep: FC<OtpStepProps> = ({ target, onVerified }) => {
  const { t } = useTranslation();

  const verify = async (code: string): Promise<boolean> => {
    try {
      const res = await verifySignupOtp(target.identifier, code);
      if (res?.success) {
        toast.success(t('otp.verified'));
        onVerified();
        return true;
      }
      toast.error(res?.message || t('otp.incomplete'));
    } catch (err) {
      toast.error((err as ApiError)?.message || t('otp.incomplete'));
    }
    return false;
  };

  const resend = async (): Promise<void> => {
    try {
      const res = await resendSignupOtp(target.identifier);
      if (!res?.success) toast.error(res?.message || t('registerModal.failed'));
    } catch (err) {
      toast.error((err as ApiError)?.message || t('registerModal.failed'));
    }
  };

  return (
    <OtpVerification
      channel={target.method}
      target={target.identifier}
      onSubmit={verify}
      onResend={resend}
    />
  );
};

export default OtpStep;
