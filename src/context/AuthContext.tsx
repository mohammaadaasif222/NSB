import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type FC,
} from 'react';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import type { AuthContextType, AuthUser, JwtPayload } from '@/types';
import { isVip } from '@/constants/roles';
import apiService from '@/services/api';
import { analytics } from '@/services/analytics';
import { translate } from '@/i18n/translate';
import { forgetAllSignedUrls } from '@/lib/signedAssets';
import { SIGNED_IN_EVENT } from '@/constants/events';
import {
  clearSession,
  expireSession,
  onSessionExpired,
  readSession,
  writeSession,
} from '@/lib/session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Read the token from sessionStorage, dropping it if past its expiry.
 *
 * Only ever called from an effect — sessionStorage does not exist while
 * Next.js renders this on the server.
 */
const getValidToken = (): string | null => {
  const stored = readSession();

  if (stored && Date.now() < stored.expiresAt) {
    return stored.token;
  }

  clearSession();
  return null;
};

const MAX_TIMEOUT_MS = 2 ** 31 - 1;

const EXPIRY_GRACE_MS = 1000;

/** Safely decode the access token into an AuthUser (id, email, role). */
const decodeUser = (token: string | null): AuthUser | null => {
  if (!token) {
    return null;
  }

  try {
    const payload = jwtDecode<JwtPayload>(token);
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
};

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  /**
   * The server render (and the first client render, which must match it) has
   * no access to sessionStorage, so the token starts as null and is restored
   * here. `hydrated` tells route guards to hold off on redirecting until the
   * real token is known — without it, a logged-in user would be bounced to
   * /login on every refresh.
   */
  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    setToken(getValidToken());
    setHydrated(true);
  }, []);

  useEffect(
    () =>
      onSessionExpired((reason) => {
        forgetAllSignedUrls();
        setToken(null);
        toast.info(
          translate(
            reason === 'ended-everywhere' ? 'sec.signedOutEverywhere' : 'misc.auth.sessionExpired'
          )
        );
      }),
    []
  );

  useEffect(() => {
    if (!token) return undefined;

    const stored = readSession();

    if (!stored) return undefined;

    const expireIfPast = (): void => {
      if (Date.now() >= stored.expiresAt) {
        expireSession();
      }
    };

    if (Date.now() >= stored.expiresAt) {
      expireSession();
      return undefined;
    }

    const timer = window.setTimeout(
      expireIfPast,
      Math.min(stored.expiresAt - Date.now() + EXPIRY_GRACE_MS, MAX_TIMEOUT_MS)
    );

    document.addEventListener('visibilitychange', expireIfPast);
    window.addEventListener('focus', expireIfPast);
    window.addEventListener('online', expireIfPast);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', expireIfPast);
      window.removeEventListener('focus', expireIfPast);
      window.removeEventListener('online', expireIfPast);
    };
  }, [token]);

  const login = (newToken: string): void => {
    writeSession(newToken);
    setToken(newToken);
    window.dispatchEvent(new Event(SIGNED_IN_EVENT));
  };

  /**
   * Sign out on the server first, then locally.
   *
   * Clearing sessionStorage only makes the browser forget the token — the
   * token itself stays valid until it expires, so anyone who copied it keeps
   * the session. POST /auth/logout deletes the session row, which is what
   * actually ends it.
   *
   * The local clear happens whatever the request does. If the network is down
   * the button must still sign you out of this browser; the session then dies
   * on its own at expiry.
   */
  const logout = (): void => {
    // Recorded before the request, not in the callback: the local sign-out
    // happens whatever the network does, so the event should too.
    analytics.auth.logout();

    void apiService
      .post('/auth/logout')
      .catch(() => undefined)
      .finally(() => {
        clearSession();
        forgetAllSignedUrls();
        setToken(null);
        toast.success(translate('misc.auth.loggedOut'));
      });
  };

  const value = useMemo<AuthContextType>(() => {
    const user = decodeUser(token);
    const role = user?.role ?? '';

    return {
      token,
      user,
      role,
      isVip: isVip(role),
      hydrated,
      login,
      logout,
    };
  }, [token, hydrated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
