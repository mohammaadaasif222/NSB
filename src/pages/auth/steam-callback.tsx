import { useEffect, useRef, type FC } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { isPlatformRole } from '@/constants/roles';
import { trackSignupComplete } from '@/utils/events';
import Seo from '@/components/seo/Seo';

import type { JwtPayload } from '@/types';

/**
 * Where Steam's popup lands once sign-in finishes.
 *
 * Steam is a full-page redirect, not a JS callback like Google/Telegram —
 * the backend's GET /auth/steam/callback sends the popup here with the
 * result in the URL fragment (never a query string, so it never reaches any
 * server access log). This page's only job is to relay that fragment to the
 * window that opened the popup and close itself; useSteamAuth on the other
 * end is listening for the message.
 *
 * window.opener normally survives the round trip (the backend sends
 * Cross-Origin-Opener-Policy: unsafe-none on both Steam routes specifically
 * so it does), but if it's ever missing anyway — a stricter browser, an
 * intermediate proxy — this still has a real, signed token in hand. Bouncing
 * to the login screen would silently throw away a successful sign-in, so it
 * logs itself in directly instead.
 *
 * The postMessage/window.close() below runs exactly once by design — there
 * is nothing to "undo" it with, unlike a subscription. React 18 Strict Mode
 * deliberately mounts effects twice in development to catch exactly this
 * kind of non-idempotent one-shot effect: window.close() doesn't destroy the
 * window synchronously, so the second mount fires the same message again
 * before the first close takes effect. The ranRef guard makes it a true
 * one-shot regardless of how many times the effect itself runs.
 */

const STEAM_MESSAGE_SOURCE = 'rolluck-steam-auth';

const SteamCallback: FC = () => {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useTranslation();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const token = params.get('token') ?? undefined;
    const error = params.get('error') ?? undefined;
    // `new=1` when Steam sign-in created the account rather than matching an
    // existing one. The backend puts it in the fragment; relaying it is what
    // lets a Steam signup reach the funnel at all, since every social route
    // uses the same endpoint for signing up and signing in.
    const isNewAccount = params.get('new') === '1';

    if (window.opener) {
      window.opener.postMessage(
        { source: STEAM_MESSAGE_SOURCE, token, error, is_new_account: isNewAccount },
        window.location.origin
      );
      window.close();
      return;
    }

    if (error) {
      toast.error(error);
      void router.replace('/auth/login');
      return;
    }

    if (!token) {
      void router.replace('/auth/login');
      return;
    }

    let role: string | undefined;
    try {
      role = jwtDecode<JwtPayload>(token).role;
    } catch {
      toast.error(t('misc.auth.malformedToken'));
      void router.replace('/auth/login');
      return;
    }

    if (!isPlatformRole(role)) {
      toast.error(t('loginModal.operatorAccount'));
      void router.replace('/auth/login');
      return;
    }

    // The fallback path signs in here rather than relaying, so the event has
    // to be recorded here too — otherwise a player whose popup lost its opener
    // silently vanishes from the signup figures.
    if (isNewAccount) trackSignupComplete('steam');

    login(token);
    void router.replace('/');
  }, [router, login, t]);

  return (
    <div className="flex min-h-screen items-center justify-center text-white/70">
      <Seo title={t('misc.steam.completing')} />
      {t('misc.steam.completing')}
    </div>
  );
};

export default SteamCallback;
