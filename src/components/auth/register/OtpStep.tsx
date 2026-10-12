import type { FC } from 'react';
import { toast } from 'react-toastify';

import { useTranslation } from '@/context/I18nContext';
import { resendSignupOtp, verifySignupOtp } from '@/services/auth';
import { apiErrorMessage, transportErrorKey } from '@/lib/apiError';
import { analytics, failureReason } from '@/services/analytics';
import { ANALYTICS_SIGNUP_METHOD } from '@/constants/auth';
import { trackSignupComplete } from '@/utils/events';
import OtpVerification from '@/components/auth/OtpVerification';

import type { SignupTarget } from '@/hooks/useSignupForm';

interface OtpStepProps {
  target: SignupTarget;
  onVerified: (token?: string) => void;
}

/** Confirms the code sent to the new account's email or mobile. */
const OtpStep: FC<OtpStepProps> = ({ target, onVerified }) => {
  const { t } = useTranslation();

  /**
   * The API's wording first, as on the signup form itself. It distinguishes
   * "this code is invalid or has expired" from "you asked again too soon",
   * which a single generic message would flatten into one unhelpful line.
   */
  const failureMessage = (error: unknown, fallback: string): string => {
    const transport = transportErrorKey(error);
    return transport ? t(transport) : apiErrorMessage(error, fallback);
  };

  const verify = async (code: string): Promise<boolean> => {
    try {
      const res = await verifySignupOtp(target.identifier, code);
      if (res?.success) {
        analytics.auth.otpVerified('sign_up');
        // The real end of the funnel: the account is confirmed and usable.
        trackSignupComplete(ANALYTICS_SIGNUP_METHOD[target.method]);
        toast.success(t('otp.verified'));
        onVerified(res.data?.token);
        return true;
      }
      analytics.auth.otpFailed('sign_up', failureReason(res?.message));
      toast.error(failureMessage(res, t('otp.incomplete')));
    } catch (err) {
      analytics.auth.otpFailed('sign_up', failureReason(err));
      toast.error(failureMessage(err, t('otp.incomplete')));
    }
    return false;
  };

  const resend = async (): Promise<void> => {
    analytics.auth.otpResent('sign_up');
    try {
      const res = await resendSignupOtp(target.identifier);
      if (!res?.success) toast.error(failureMessage(res, t('registerModal.failed')));
    } catch (err) {
      toast.error(failureMessage(err, t('registerModal.failed')));
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
