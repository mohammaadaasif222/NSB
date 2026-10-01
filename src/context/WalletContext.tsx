import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import { toast } from 'react-toastify';

import { useAuth } from './AuthContext';
import {
  getCurrencies,
  getDisplayCurrencies,
  getRates,
  getWalletSummary,
  updatePreferences,
  type DisplayCurrencyOption,
  type UpdatePreferencesInput,
} from '@/services/wallet';
import type {
  Currency,
  DisplayFiat,
  ExchangeRate,
  WalletBalance,
  WalletPreference,
  WalletSummary,
} from '@/types';

/**
 * Wallet global state.
 *
 * The provider is mounted once at the app root and does three things:
 *
 *   1. Fetches /wallet/summary on sign-in, and again on a poll interval
 *      while a wallet modal is open (see `beginPolling` / `endPolling`).
 *   2. Keeps a local currency catalogue and rate map, both fetched once
 *      per session — those change hourly on the server and are cheap to
 *      re-hit on demand.
 *   3. Provides a `changePreferences()` that PATCHes the backend AND
 *      updates the local cache optimistically, so the UI reflects a
 *      display-currency switch without a round trip.
 *
 * Every component that reads wallet state does so through `useWallet()`
 * — never by calling the service directly. The context is the single
 * source of truth per session and prevents two components from showing
 * different balances after one of them wrote.
 */

interface WalletContextType {
  summary: WalletSummary | null;
  currencies: Currency[];
  rates: ExchangeRate[];
  /**
   * The fiats the operator has enabled for the "Display in local currency"
   * picker. Fetched once per session — an operator's toggle takes effect
   * on the next reload for players already logged in.
   */
  displayCurrencies: DisplayCurrencyOption[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;

  /**
   * Force-refresh the summary now. Call after any action that changes
   * balance state (deposit address created, withdrawal requested,
   * wallet type flipped). Returns the fresh summary.
   */
  refresh: () => Promise<WalletSummary | null>;

  /**
   * Optimistic PATCH of preferences. Reverts on failure and toasts an
   * error. Returns the new preference row on success.
   */
  changePreferences: (patch: UpdatePreferencesInput) => Promise<WalletPreference | null>;

  /**
   * The balance row matching `active_currency + active_network`, or null
   * if the user has no funds in the active pair yet. Used by the header
   * chip so it does not have to walk `summary.balances` itself.
   */
  activeBalance: WalletBalance | null;

  /** Polling controls — the wallet modal opens/closes these. */
  beginPolling: () => void;
  endPolling: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

/**
 * Refresh interval WHILE the wallet modal is open. Deliberately short so
 * a confirmed deposit appears without a manual reload; the poll stops
 * when the modal closes.
 */
const POLL_INTERVAL_MS = 15_000;

interface Props {
  children: ReactNode;
}

export const WalletProvider: FC<Props> = ({ children }) => {
  const { token } = useAuth();

  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [displayCurrencies, setDisplayCurrencies] = useState<DisplayCurrencyOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Ref-count how many components are polling. Two modals opening at the
   * same time (unlikely, but possible on a page transition) each ask for
   * polling and each release it; the interval stays alive until the last
   * releaser calls endPolling.
   */
  const pollersRef = useRef<number>(0);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Core fetch ─────────────────────────────────────────────────── */

  const fetchSummary = useCallback(async (silent = false): Promise<WalletSummary | null> => {
    if (!silent) setRefreshing(true);
    try {
      const res = await getWalletSummary();
      if (res?.success && res.data) {
        setSummary(res.data);
        setError(null);
        return res.data;
      }
      return null;
    } catch (err) {
      // 401 clears the token on the axios interceptor — no toast needed
      // there. Any other failure is worth surfacing once.
      const message = err instanceof Error ? err.message : 'Failed to load wallet';
      setError(message);
      return null;
    } finally {
      if (!silent) setRefreshing(false);
    }
  }, []);

  const fetchCatalogue = useCallback(async (): Promise<void> => {
    try {
      const [currRes, rateRes, fiatRes] = await Promise.all([
        getCurrencies(),
        getRates((summary?.preferences.active_currency ?? 'USD') as DisplayFiat),
        getDisplayCurrencies(),
      ]);
      if (currRes?.success && currRes.data) setCurrencies(currRes.data);
      if (rateRes?.success && rateRes.data) setRates(rateRes.data);
      if (fiatRes?.success && fiatRes.data) setDisplayCurrencies(fiatRes.data);
    } catch {
      /* leave catalogue empty — the modal handles empty picker lists */
    }
    // We intentionally do NOT depend on `summary` here — the catalogue
    // fetch is once-per-session, not once-per-summary. The fiat pick is
    // the initial value at load time; subsequent display-currency changes
    // trigger a rate re-fetch through `changePreferences`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Initial + auth-driven load ─────────────────────────────────── */

  useEffect(() => {
    if (!token) {
      setSummary(null);
      setCurrencies([]);
      setRates([]);
      setDisplayCurrencies([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    void Promise.all([fetchSummary(true), fetchCatalogue()]).finally(() => {
      setLoading(false);
    });
  }, [token, fetchSummary, fetchCatalogue]);

  /* ── Poll while modal open ──────────────────────────────────────── */

  const beginPolling = useCallback((): void => {
    pollersRef.current += 1;
    if (pollTimerRef.current) return;
    pollTimerRef.current = setInterval(() => {
      // Silent refresh: no spinner flicker on the modal every 15s.
      void fetchSummary(true);
    }, POLL_INTERVAL_MS);
  }, [fetchSummary]);

  const endPolling = useCallback((): void => {
    pollersRef.current = Math.max(0, pollersRef.current - 1);
    if (pollersRef.current === 0 && pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Guard against a component that begins polling and unmounts without
    // calling end — the timer is otherwise orphaned.
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      pollersRef.current = 0;
    };
  }, []);

  /* ── Preferences ────────────────────────────────────────────────── */

  const changePreferences = useCallback(
    async (patch: UpdatePreferencesInput): Promise<WalletPreference | null> => {
      if (!summary) return null;

      // Optimistic update: apply the patch locally now, roll back if the
      // server rejects. Waiting for the round trip makes the toggle feel
      // laggy for a change that never fails in practice.
      const previous = summary.preferences;
      setSummary((current) =>
        current ? { ...current, preferences: { ...current.preferences, ...patch } } : current,
      );

      try {
        const res = await updatePreferences(patch);
        if (!res?.success || !res.data) {
          throw new Error(res?.message || 'Failed to update preferences');
        }
        // Sync canonical preference row back onto the summary.
        setSummary((current) => (current ? { ...current, preferences: res.data! } : current));

        // An active_currency change (which is the display currency in USD-native model)
        // invalidates the current rate map.
        if (patch.active_currency && patch.active_currency !== previous.active_currency) {
          try {
            const rateRes = await getRates(patch.active_currency as DisplayFiat);
            if (rateRes?.success && rateRes.data) setRates(rateRes.data);
          } catch {
            /* keep old rates rather than blanking the map */
          }
          // Refresh summary so display_amount recomputes against the new active currency.
          void fetchSummary(true);
        }

        return res.data;
      } catch (err) {
        setSummary((current) =>
          current ? { ...current, preferences: previous } : current,
        );
        const message = err instanceof Error ? err.message : 'Failed to update preferences';
        toast.error(message);
        return null;
      }
    },
    [summary, fetchSummary],
  );

  /* ── Derived state ──────────────────────────────────────────────── */

  const activeBalance = useMemo<WalletBalance | null>(() => {
    if (!summary) return null;
    // USD-native model: single balance per user, no need to filter
    return summary.balance ?? null;
  }, [summary]);

  const value = useMemo<WalletContextType>(
    () => ({
      summary,
      currencies,
      rates,
      displayCurrencies,
      loading,
      refreshing,
      error,
      refresh: () => fetchSummary(false),
      changePreferences,
      activeBalance,
      beginPolling,
      endPolling,
    }),
    [
      summary,
      currencies,
      rates,
      displayCurrencies,
      loading,
      refreshing,
      error,
      fetchSummary,
      changePreferences,
      activeBalance,
      beginPolling,
      endPolling,
    ],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};
