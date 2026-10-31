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
  /** True when this is a synthetic demo guest, not a real signed-in player. */
  isDemo?: boolean;
}

export interface OriginalsAuthValue {
  user: OriginalsAuthUser | null;
  playCurrency: string;
  fetchUser: () => void;
}

const DEMO_ID_KEY = 'originals_demo_player_id';

/**
 * Mint-or-return the demo player id for this browser session.
 *
 * sessionStorage (not localStorage) → the id lives for the tab, so a new
 * tab is a new demo player. Lets a developer open two tabs and see the
 * demo pots stay independent. SSR-safe (returns a dummy on the server).
 */
export const getOrCreateDemoPlayerId = (): string => {
  if (typeof window === 'undefined') return 'demo-ssr';
  try {
    const existing = window.sessionStorage.getItem(DEMO_ID_KEY);
    if (existing) return existing;
    const fresh =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `demo-${Math.random().toString(36).slice(2)}-${Date.now()}`;
    window.sessionStorage.setItem(DEMO_ID_KEY, `demo:${fresh}`);
    return `demo:${fresh}`;
  } catch {
    // Private-mode browsers may refuse sessionStorage. Generate without caching.
    return `demo:${Math.random().toString(36).slice(2)}`;
  }
};

/**
 * Returns the auth shape ported Win-Win Originals code expects.
 *
 * For a signed-in player → mirror the real session.
 * For an anonymous visitor → synthesize a DEMO user with a stable
 * per-tab UUID. The ported games then boot into demo mode (no real
 * wallet, no DB writes — `OriginalAPI.js` on the socket side detects
 * the demo id and short-circuits every placeBet/payout).
 */
export const useAuth = (): OriginalsAuthValue => {
  const base = useRlkAuth();
  const u = base?.user ?? null;
  if (u) {
    return {
      user: {
        _id: u.id,
        id: u.id,
        email: u.email,
        role: u.role,
        favorites: [],
      },
      playCurrency: 'USD',
      fetchUser: () => {
        /* no-op */
      },
    };
  }

  const demoId = getOrCreateDemoPlayerId();
  return {
    user: {
      _id: demoId,
      id: demoId,
      email: null,
      role: 'DEMO',
      favorites: [],
      isDemo: true,
    },
    playCurrency: 'USD',
    fetchUser: () => {
      /* no-op */
    },
  };
};
