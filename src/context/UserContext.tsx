import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import apiService from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { isThemeName, type ApiUser } from '@/types/profile';
import { translate } from '@/i18n/translate';

interface UserContextType {
  /** The signed-in player, or null while logged out / not yet loaded. */
  me: ApiUser | null;
  loading: boolean;
  /** Set when the last fetch failed; null otherwise. */
  error: string | null;
  /** Re-fetch from the server. */
  refresh: () => Promise<void>;
  /** Patch the cached copy after a successful local update (no network). */
  updateMe: (patch: Partial<ApiUser>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * One `/users/me` per session, shared by the top bar, the welcome strip and
 * the profile page instead of each fetching its own copy.
 *
 * Keyed on the token: it loads when the player signs in, clears when they
 * sign out, and (because the stored theme on the server is authoritative)
 * applies that theme the moment the profile arrives.
 */
export const UserProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const { applyTheme } = useTheme();
  const [me, setMe] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    if (!token) {
      setMe(null);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.get<ApiUser>('/users/me');
      if (res?.success && res.data) {
        setMe(res.data);
        setError(null);
        if (isThemeName(res.data.theme)) {
          applyTheme(res.data.theme);
        }
      } else {
        setError(res?.message || translate('profile.loadFailed'));
      }
    } catch (err) {
      setError((err as { message?: string })?.message || translate('profile.loadFailed'));
    } finally {
      setLoading(false);
    }
    // applyTheme is stable for the life of the provider.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateMe = useCallback((patch: Partial<ApiUser>): void => {
    setMe((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const value = useMemo<UserContextType>(
    () => ({ me, loading, error, refresh, updateMe }),
    [me, loading, error, refresh, updateMe]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useMe = (): UserContextType => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useMe must be used within UserProvider');
  }
  return ctx;
};
