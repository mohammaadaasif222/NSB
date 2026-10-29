import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { useSeonGuard } from '@/context/SeonGuardContext';
import { isStepUpCancelled } from '@/lib/seon-guard';
import { resendLoginOtp, verifyLoginOtp } from '@/services/auth';
import { analytics, failureReason } from '@/services/analytics';
import { isPlatformRole } from '@/constants/roles';

import type { ApiError, ContactChannel, JwtPayload } from '@/types';

/** What a password login hands back when a one-time code is still owed. */
export interface TwoFactorChallenge {
  challenge: string;
  channel: ContactChannel;
  /** The address the code was sent to; shown masked. */
  target: string;
}

interface Options {
  onLoggedIn: () => void;
  /** The challenge is spent or expired — the player has to start again. */
  onRestart: () => void;
}

/** The API's wording when the sign-in itself, not just the code, is dead. */
const isDeadChallenge = (message: string | undefined): boolean =>
  /sign in again/i.test(message ?? '');

/**
 * The second step of a two-factor login: the code that was emailed or texted
 * after the password was accepted. Completes the sign-in exactly as the
 * password form does — same role check, same session, same toast.
 */
export const useTwoFactorLogin = ({ onLoggedIn, onRestart }: Options) => {
  const { login } = useAuth();
  const { t } = useTranslation();
  const { run } = useSeonGuard();

  /** Resolves false for a rejected code, so the boxes clear for another try. */
  const verify = async (pending: TwoFactorChallenge, code: string): Promise<boolean> => {
    const tracked = pending.channel === 'email' ? 'mail' : 'phone';
    try {
      const res = await run((headers) => verifyLoginOtp(pending.challenge, code, headers));
      const token = res?.data?.token;
      if (!res?.success || !token) {
        toast.error(res?.message || t('loginModal.failed'));
        return false;
      }

      let role: string | undefined;
      try {
        role = jwtDecode<JwtPayload>(token).role;
      } catch {
        toast.error(t('loginModal.failed'));
        return false;
      }
      if (!isPlatformRole(role)) {
        toast.error(t('loginModal.operatorAccount'));
        return false;
      }

      login(token);
      analytics.auth.loginCompleted(tracked);
      toast.success(t('login.success'));
      onLoggedIn();
      return true;
    } catch (err) {
      if (isStepUpCancelled(err)) return false;
      const apiErr = err as ApiError;
      toast.error(apiErr?.message || t('loginModal.failed'));
      analytics.auth.loginFailed(tracked, failureReason(apiErr));
      if (isDeadChallenge(apiErr?.message)) {
        onRestart();
        return true;
      }
      return false;
    }
  };

  const resend = async (pending: TwoFactorChallenge): Promise<void> => {
    try {
      const res = await resendLoginOtp(pending.challenge, pending.channel);
      if (!res?.success) toast.error(res?.message || t('loginModal.codeFailed'));
    } catch (err) {
      const apiErr = err as ApiError;
      toast.error(apiErr?.message || t('loginModal.codeFailed'));
      if (isDeadChallenge(apiErr?.message)) onRestart();
    }
  };

  return { verify, resend };
};
