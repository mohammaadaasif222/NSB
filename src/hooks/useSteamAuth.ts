import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { isPlatformRole } from '@/constants/roles';
import { trackSignupComplete } from '@/utils/events';

import type { JwtPayload } from '@/types';

/**
 * "Continue with Steam", for both the login and the register screens.
 *
 * Steam is OpenID 2.0, not OAuth — there is no client-side token to collect
 * like Google's, and no JS callback like Telegram's. The whole exchange is a
 * server-side redirect dance: this hook opens a popup pointed straight at
 * the backend, which sends it to steamcommunity.com and back, landing on
 * pages/auth/steam-callback.tsx, which relays the result back here via
 * postMessage.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const STEAM_MESSAGE_SOURCE = 'rolluck-steam-auth';
const POPUP_FEATURES = 'width=500,height=650,menubar=no,toolbar=no,location=no,status=no';

interface SteamAuthMessage {
  source?: string;
  token?: string;
  error?: string;
  /** True when this sign-in created the account. Relayed by steam-callback. */
  is_new_account?: boolean;
}

export interface SteamAuth {
  /** Opens Steam's popup. Must be called from a click — popups need a gesture. */
  signIn: () => void;
  /** True while the popup is open. */
  loading: boolean;
  /** False when NEXT_PUBLIC_API_BASE_URL is not set. */
  configured: boolean;
}

export function useSteamAuth(): SteamAuth {
  const { login } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopWatching = useCallback((): void => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent<SteamAuthMessage>): void => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.source !== STEAM_MESSAGE_SOURCE) return;

      stopWatching();
      popupRef.current?.close();
      popupRef.current = null;

      if (event.data.error) {
        toast.error(event.data.error);
        return;
      }

      const sessionToken = event.data.token;
      if (!sessionToken) {
        toast.error(t('auth.steamFailed'));
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

      // Steam has no OTP step, so "the account exists and is verified" is the
      // provider vouching for it plus this flag — see trackSignupComplete.
      if (event.data.is_new_account === true) {
        trackSignupComplete('steam');
      }

      login(sessionToken);
      router.push('/');
      toast.success(t('login.success'));
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [login, router, t, stopWatching]);

  const signIn = useCallback((): void => {
    if (!API_BASE_URL) {
      toast.info(t('auth.steamNotConfigured'));
      return;
    }

    setLoading(true);
    const popup = window.open(`${API_BASE_URL}/auth/steam/login`, 'steam-login', POPUP_FEATURES);
    popupRef.current = popup;

    if (!popup) {
      stopWatching();
      toast.error(t('auth.steamPopupBlocked'));
      return;
    }

    // Steam's redirect dance has no JS callback to hook into — this is the
    // only way to notice the player closed the popup without finishing.
    pollRef.current = setInterval(() => {
      if (popup.closed) {
        stopWatching();
      }
    }, 500);
  }, [stopWatching, t]);

  return { signIn, loading, configured: Boolean(API_BASE_URL) };
}

export default useSteamAuth;
