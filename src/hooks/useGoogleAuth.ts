import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import apiService from '@/services/api';
import { isPlatformRole } from '@/constants/roles';
import { useSeonGuard } from '@/context/SeonGuardContext';
import { isStepUpCancelled } from '@/lib/seon-guard';
import { analytics, failureReason } from '@/services/analytics';
import { trackSignupComplete } from '@/utils/events';
import { clearReferral, referralField } from '@/lib/referralCapture';
import { affiliateField, clearAffiliateTag } from '@/lib/affiliateCapture';

import type { ApiError, JwtPayload, LoginResponseData } from '@/types';

/**
 * "Continue with Google", for both the login and the register screens.
 *
 * The browser never learns anything about the account from Google directly:
 * it collects an access token and hands it to our backend, which asks Google
 * whose token it is and answers with the ordinary session token. Signing in
 * and signing up are the same call — the backend creates the account if it
 * has not seen this Google identity before.
 *
 * Google Identity Services is loaded from a script tag rather than an npm
 * package, which is how Google ships it; there is no bundle to add.
 */

const GSI_SRC = 'https://accounts.google.com/gsi/client';
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

/** Only the sliver of the GIS surface this hook touches. */
interface TokenResponse {
  access_token?: string;
  error?: string;
}

interface TokenClient {
  requestAccessToken: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
            error_callback?: (error: { type?: string }) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

export interface GoogleAuth {
  /** Opens Google's popup. Must be called from a click — popups need a gesture. */
  signIn: () => void;
  /** True while the popup is open or the backend call is in flight. */
  loading: boolean;
  /** False when NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. */
  configured: boolean;
}

export interface GooglePopupHandlers {
  onToken: (accessToken: string) => void;
  onFailure?: (reason: string) => void;
}

const INTENT_EVENTS = ['pointermove', 'pointerdown', 'touchstart', 'keydown', 'scroll'] as const;

const afterPageLoad = (fn: () => void): (() => void) => {
  if (document.readyState === 'complete') {
    fn();
    return () => undefined;
  }
  let idleId: number | null = null;
  let timer: number | null = null;
  const stop = (): void => {
    window.removeEventListener('load', schedule);
    for (const type of INTENT_EVENTS) window.removeEventListener(type, start);
    if (idleId !== null) window.cancelIdleCallback(idleId);
    if (timer !== null) globalThis.clearTimeout(timer);
  };
  function start(): void {
    stop();
    fn();
  }
  function schedule(): void {
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(start, { timeout: 2000 });
    } else {
      timer = globalThis.setTimeout(start, 200) as unknown as number;
    }
  }
  window.addEventListener('load', schedule, { once: true });
  for (const type of INTENT_EVENTS) {
    window.addEventListener(type, start, { once: true, passive: true });
  }
  return stop;
};

export function useGooglePopup({ onToken, onFailure }: GooglePopupHandlers): () => void {
  const { t } = useTranslation();
  const [ready, setReady] = useState(false);
  const client = useRef<TokenClient | null>(null);

  // Load the script up front, so the click that opens the popup is a direct
  // user gesture. Loading on demand would put an await between the two and
  // browsers would block the popup.
  useEffect(() => {
    if (!CLIENT_ID || typeof window === 'undefined') return undefined;

    if (window.google?.accounts?.oauth2) {
      setReady(true);
      return undefined;
    }

    const onLoad = (): void => setReady(true);
    let script: HTMLScriptElement | null = null;

    const attach = (): void => {
      if (window.google?.accounts?.oauth2) {
        setReady(true);
        return;
      }
      script = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
      if (!script) {
        script = document.createElement('script');
        script.src = GSI_SRC;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', onLoad);
    };

    const cancel = afterPageLoad(attach);

    return () => {
      cancel();
      script?.removeEventListener('load', onLoad);
    };
  }, []);

  const open = useCallback((): void => {
    if (!CLIENT_ID) {
      toast.info(t('auth.googleNotConfigured'));
      return;
    }

    const oauth2 = window.google?.accounts?.oauth2;
    if (!ready || !oauth2) {
      toast.info(t('auth.googleUnavailable'));
      return;
    }

    // Rebuilt per click: a token client holds the callback, and reusing a
    // stale one would resolve into a previous render's closure.
    client.current = oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: 'openid email profile',
      callback: (response) => {
        if (!response.access_token) {
          // A closed popup reports "access_denied" — not worth a red toast, but
          // worth counting: it is the most common way a Google signup is lost.
          onFailure?.(response.error ?? 'popup_dismissed');

          if (response.error && response.error !== 'access_denied') {
            toast.error(t('auth.googleFailed'));
          }
          return;
        }
        onToken(response.access_token);
      },
      error_callback: (error) => {
        onFailure?.(error?.type ?? 'popup_error');

        if (error?.type !== 'popup_closed') {
          toast.error(t('auth.googleFailed'));
        }
      },
    });

    client.current.requestAccessToken();
  }, [ready, onToken, onFailure, t]);

  return open;
}

export function useGoogleAuth(): GoogleAuth {
  const { login } = useAuth();
  const { t } = useTranslation();
  // Handles a fraud step-up on a risky sign-in.
  const { run } = useSeonGuard();

  const [loading, setLoading] = useState(false);

  /** Trade the Google token for one of ours, then sign in. */
  const exchange = useCallback(
    async (accessToken: string): Promise<void> => {
      try {
        setLoading(true);

        // A risky social sign-in is challenged for a one-time code. Only an
        // EXISTING account can be challenged — a brand-new one has no address
        // on file yet, so the backend lets those through (the provider has
        // already vouched for the email). A BLOCK still refuses either way.
        const response = await run((headers) =>
          apiService.post<LoginResponseData>(
            '/auth/social/login',
            { token: accessToken, type: 'google', ...referralField(), ...affiliateField() },
            { headers }
          )
        );

        const sessionToken = response?.data?.token;

        if (!response?.success || !sessionToken) {
          analytics.auth.loginFailed('google', failureReason(response?.message));
          toast.error(response?.message || t('auth.googleFailed'));
          return;
        }

        // Same belt-and-braces check the password login does: an operator
        // credential must never open a session in the player app.
        let role: string | undefined;
        try {
          role = jwtDecode<JwtPayload>(sessionToken).role;
        } catch {
          analytics.auth.loginFailed('google', 'malformed_token');
          toast.error(t('misc.auth.malformedToken'));
          return;
        }

        if (!isPlatformRole(role)) {
          analytics.auth.loginFailed('google', 'operator_account');
          toast.error(t('loginModal.operatorAccount'));
          return;
        }

        // POST /auth/social/login both creates and signs in, so this flag is the
        // only thing separating a new player from a returning one. Without it
        // a social signup never reaches the funnel at all.
        if (response?.data?.is_new_account === true) {
          trackSignupComplete('google');
          clearAffiliateTag();
          if (referralField().referral_code) {
            analytics.referral.signUpAttributed('link');
            clearReferral();
          }
        }

        login(sessionToken);
        // Signing in and signing up are the same call here, so this reports a
        // login either way; a first-time Google account shows up as a new user
        // in GA4 regardless.
        analytics.auth.loginCompleted('google');
        // No redirect: sign-in happens in a modal over whatever page the
        // player was on, and the modal closes itself once there is a session.
        toast.success(t('login.success'));
      } catch (err) {
        // Closing the code prompt is a decision, not a failed sign-in.
        if (isStepUpCancelled(err)) return;
        const apiErr = err as ApiError;
        analytics.auth.loginFailed('google', failureReason(apiErr));
        toast.error(apiErr?.message || t('auth.googleFailed'));
      } finally {
        setLoading(false);
      }
    },
    // `run` is stable (memoised in SeonGuardProvider), so listing it does
    // not rebuild this callback on every render.
    [login, t, run]
  );

  const onToken = useCallback(
    (accessToken: string): void => {
      void exchange(accessToken);
    },
    [exchange]
  );

  const onFailure = useCallback((reason: string): void => {
    analytics.auth.loginFailed('google', reason);
  }, []);

  const signIn = useGooglePopup({ onToken, onFailure });

  return { signIn, loading, configured: Boolean(CLIENT_ID) };
}

export default useGoogleAuth;
