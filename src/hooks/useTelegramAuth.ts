import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import apiService from '@/services/api';
import { isPlatformRole } from '@/constants/roles';
import { useSeonGuard } from '@/context/SeonGuardContext';
import { isStepUpCancelled } from '@/lib/seon-guard';
import { trackSignupComplete } from '@/utils/events';
import { clearReferral, referralField } from '@/lib/referralCapture';
import { affiliateField, clearAffiliateTag } from '@/lib/affiliateCapture';
import { analytics } from '@/services/analytics';

import type { ApiError, JwtPayload, LoginResponseData } from '@/types';

/**
 * "Continue with Telegram", for both the login and the register screens.
 *
 * Telegram has no OAuth popup like Google's — instead its widget script
 * exposes `Telegram.Login.auth`, which opens Telegram's own popup and hands
 * back the signed profile fields directly (id, name, photo, auth_date,
 * hash). We forward that payload as-is to our backend, which verifies the
 * signature itself against TELEGRAM_BOT_TOKEN — there is no token to
 * redeem, so the browser never talks to Telegram's servers again after
 * the popup closes.
 *
 * This site's domain must be registered on the bot via
 * @BotFather -> /setdomain, or Telegram refuses to open the popup.
 */

const WIDGET_SRC = 'https://telegram.org/js/telegram-widget.js?22';
const BOT_ID = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID ?? '';

export interface TelegramAuthData {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramLogin {
  auth: (
    options: { bot_id: string; request_access?: string },
    callback: (data: TelegramAuthData | false) => void
  ) => void;
}

declare global {
  interface Window {
    Telegram?: {
      Login?: TelegramLogin;
    };
  }
}

export interface TelegramAuth {
  /** Opens Telegram's popup. Must be called from a click — popups need a gesture. */
  signIn: () => void;
  /** True while the popup is open or the backend call is in flight. */
  loading: boolean;
  /** False when NEXT_PUBLIC_TELEGRAM_BOT_ID is not set. */
  configured: boolean;
}

export function useTelegramPopup(onData: (data: TelegramAuthData) => void): () => void {
  const { t } = useTranslation();
  const [ready, setReady] = useState(false);

  // Loaded up front for the same reason as Google's script: the click that
  // opens the popup must be a direct user gesture, with no await in between.
  useEffect(() => {
    if (!BOT_ID || typeof window === 'undefined') return undefined;

    if (window.Telegram?.Login) {
      setReady(true);
      return undefined;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${WIDGET_SRC}"]`);
    const script = existing ?? document.createElement('script');
    const onLoad = (): void => setReady(true);

    script.addEventListener('load', onLoad);

    if (!existing) {
      script.src = WIDGET_SRC;
      script.async = true;
      document.head.appendChild(script);
    }

    return () => script.removeEventListener('load', onLoad);
  }, []);

  const open = useCallback((): void => {
    if (!BOT_ID) {
      toast.info(t('auth.telegramNotConfigured'));
      return;
    }

    const telegramLogin = window.Telegram?.Login;
    if (!ready || !telegramLogin) {
      toast.info(t('auth.telegramUnavailable'));
      return;
    }

    telegramLogin.auth({ bot_id: BOT_ID, request_access: 'write' }, (data) => {
      // A closed or declined popup calls back with `false` — not worth a red toast.
      if (!data) return;
      onData(data);
    });
  }, [ready, onData, t]);

  return open;
}

export function useTelegramAuth(): TelegramAuth {
  const { login } = useAuth();
  const { t } = useTranslation();
  // Handles a fraud step-up on a risky sign-in.
  const { run } = useSeonGuard();

  const [loading, setLoading] = useState(false);

  /** Forward Telegram's signed profile to our backend, then sign in. */
  const exchange = useCallback(
    async (data: TelegramAuthData): Promise<void> => {
      try {
        setLoading(true);

        // See the note in useGoogleAuth: existing accounts can be challenged
        // for a code, new ones are allowed through, BLOCK always refuses.
        const response = await run((headers) =>
          apiService.post<LoginResponseData>(
            '/auth/social/login',
            { type: 'telegram', telegram: data, ...referralField(), ...affiliateField() },
            { headers }
          )
        );

        const sessionToken = response?.data?.token;

        if (!response?.success || !sessionToken) {
          toast.error(response?.message || t('auth.telegramFailed'));
          return;
        }

        // Same belt-and-braces check the password login does: an operator
        // credential must never open a session in the player app.
        let role: string | undefined;
        try {
          role = jwtDecode<JwtPayload>(sessionToken).role;
        } catch {
          toast.error(t('misc.auth.malformedToken'));
          return;
        }

        if (!isPlatformRole(role)) {
          toast.error(t('loginModal.operatorAccount'));
          return;
        }

        // POST /auth/social/login both creates and signs in, so this flag is the
        // only thing separating a new player from a returning one. Without it
        // a social signup never reaches the funnel at all.
        if (response?.data?.is_new_account === true) {
          trackSignupComplete('telegram');
          clearAffiliateTag();
          if (referralField().referral_code) {
            analytics.referral.signUpAttributed('link');
            clearReferral();
          }
        }

        login(sessionToken);
        // No redirect: sign-in happens in a modal over whatever page the
        // player was on, and the modal closes itself once there is a session.
        toast.success(t('login.success'));
      } catch (err) {
        // Closing the code prompt is a decision, not a failed sign-in.
        if (isStepUpCancelled(err)) return;
        const apiErr = err as ApiError;
        toast.error(apiErr?.message || t('auth.telegramFailed'));
      } finally {
        setLoading(false);
      }
    },
    // `run` is stable (memoised in SeonGuardProvider), so listing it does
    // not rebuild this callback on every render.
    [login, t, run]
  );

  const onData = useCallback(
    (data: TelegramAuthData): void => {
      void exchange(data);
    },
    [exchange]
  );

  const signIn = useTelegramPopup(onData);

  return { signIn, loading, configured: Boolean(BOT_ID) };
}

export default useTelegramAuth;
