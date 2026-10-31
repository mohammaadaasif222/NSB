/**
 * Auth-shape adapter for ported Win-Win Originals code.
 *
 * The Win-Win games call `useAuth()` and read `user._id`, `user.favorites`,
 * `playCurrency`, and `fetchUser()`. rlk-frontend's AuthContext exposes
 * `user.id`, `user.email`, `user.role` only — this adapter maps the two
 * so the games compile and run against the real session WITHOUT every
 * ported line being touched.
 *
 * New Originals code written specifically for rlk-frontend should import
 * from `@/context/AuthContext` directly instead.
 */
import { useAuth as useRlkAuth } from '@/context/AuthContext';

export interface OriginalsAuthUser {
  /** MongoDB-style id Win-Win games read. Maps to the rlk JWT `sub`. */
  _id: string;
  id: string;
  email: string | null;
  role: string;
  /** Games read this to pre-fill favourite status. We supply an empty list. */
  favorites: string[];
}

export interface OriginalsAuthValue {
  user: OriginalsAuthUser | null;
  playCurrency: string;
  fetchUser: () => void;
}

export const useAuth = (): OriginalsAuthValue => {
  const base = useRlkAuth();
  const u = base?.user ?? null;
  return {
    user: u
      ? {
          _id: u.id,
          id: u.id,
          email: u.email,
          role: u.role,
          favorites: [],
        }
      : null,
    playCurrency: 'USD',
    fetchUser: () => {
      /* no-op: rlk refreshes the user on token rotation already */
    },
  };
};
