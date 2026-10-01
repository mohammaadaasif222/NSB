import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import apiService from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { useWallet } from '@/context/WalletContext';
import { REWARDS_REFRESH_EVENT, WALLET_REFRESH_EVENT } from '@/constants/events';
import { REWARD_SETTLE_GRACE_MS, REWARD_TITLE_KEYS, rewardSlug } from '@/constants/rewards';
import { formatWalletAmount } from '@/utils/money';
import type { ApiError, RewardClaimResult, RewardSummary, RewardType } from '@/types';

/** The longest the summary is left without a refetch while something shows it. */
const MAX_REFRESH_DELAY_MS = 5 * 60 * 1000;

/** Never refetch more often than this, however close together the boundaries fall. */
const MIN_REFRESH_DELAY_MS = 5_000;

export interface UseRewards {
  summary: RewardSummary | null;
  loading: boolean;
  error: string | null;
  /** The reward whose claim is in flight, if any. */
  claiming: RewardType | null;
  /** Server clock minus device clock — pass to useCountdown. */
  clockOffset: number;
  refresh: () => Promise<void>;
  claim: (type: RewardType) => Promise<RewardClaimResult | null>;
}

/**
 * The signed-in player's rewards, for the header tray and the rewards page.
 *
 * Keeps itself current: it refetches just after the next moment the server
 * will change something (a pending reward turning claimable, a claimable one
 * lapsing), and whenever the wallet changes — so a claim made in one place
 * shows up in any other copy of this hook on screen.
 */
export const useRewards = (): UseRewards => {
  const { token } = useAuth();
  const { t } = useTranslation();

  // `t` is a new function on every render; read through a ref so callbacks
  // built on it stay stable instead of refetching on each render.
  const tRef = useRef(t);
  tRef.current = t;

  // Likewise the wallet's refresh, rebuilt every time the wallet changes.
  const { refresh: refreshWallet } = useWallet();
  const refreshWalletRef = useRef(refreshWallet);
  refreshWalletRef.current = refreshWallet;

  const [summary, setSummary] = useState<RewardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState<RewardType | null>(null);
  const [clockOffset, setClockOffset] = useState(0);

  const refresh = useCallback(async (): Promise<void> => {
    if (!token) {
      setSummary(null);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.get<RewardSummary>('/rewards/me');
      if (res?.success && res.data) {
        setClockOffset(new Date(res.data.server_time).getTime() - Date.now());
        setSummary(res.data);
        setError(null);
      } else {
        setError(res?.message || tRef.current('rewards.loadFailed'));
      }
    } catch (err) {
      setError((err as ApiError)?.message || tRef.current('rewards.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refresh();

    // A claim changes the wallet; a recorded wager (a Dice roll) changes only rewards.
    const onChanged = (): void => void refresh();
    window.addEventListener(WALLET_REFRESH_EVENT, onChanged);
    window.addEventListener(REWARDS_REFRESH_EVENT, onChanged);
    return () => {
      window.removeEventListener(WALLET_REFRESH_EVENT, onChanged);
      window.removeEventListener(REWARDS_REFRESH_EVENT, onChanged);
    };
  }, [refresh]);

  // Schedule the next refetch for just after the next boundary.
  useEffect(() => {
    if (!summary) {
      return;
    }

    const now = Date.now() + clockOffset;
    const upcoming = summary.rewards
      .filter((reward) => reward.enabled)
      .flatMap((reward) => [reward.available_at, reward.expires_at])
      .filter((moment): moment is string => !!moment)
      .map((moment) => new Date(moment).getTime())
      // A boundary that passed moments ago may not be settled yet — keep it.
      .filter((ms) => ms > now - REWARD_SETTLE_GRACE_MS);

    const next = upcoming.length > 0 ? Math.min(...upcoming) : now + MAX_REFRESH_DELAY_MS;
    const delay = Math.min(
      Math.max(next - now + REWARD_SETTLE_GRACE_MS, MIN_REFRESH_DELAY_MS),
      MAX_REFRESH_DELAY_MS
    );

    const id = window.setTimeout(() => void refresh(), delay);
    return () => window.clearTimeout(id);
  }, [summary, clockOffset, refresh]);

  const claim = useCallback(
    async (type: RewardType): Promise<RewardClaimResult | null> => {
      setClaiming(type);
      try {
        const res = await apiService.post<RewardClaimResult>(`/rewards/claim/${rewardSlug(type)}`);
        if (res?.success && res.data) {
          toast.success(
            tRef.current('rewards.claimed', {
              amount: formatWalletAmount(res.data.payout.amount, res.data.payout.currency_code),
              reward: tRef.current(REWARD_TITLE_KEYS[type]),
            })
          );
          // The header balance reads the wallet, which refetches; every copy of
          // this hook (this one included) and the history list refetch on the event.
          void refreshWalletRef.current();
          window.dispatchEvent(new Event(WALLET_REFRESH_EVENT));
          return res.data;
        }
        toast.error(res?.message || tRef.current('rewards.claimFailed'));
      } catch (err) {
        toast.error((err as ApiError)?.message || tRef.current('rewards.claimFailed'));
      } finally {
        setClaiming(null);
      }

      // The claim failed — most often because the reward lapsed or was already
      // claimed elsewhere. Show the server's state rather than a stale button.
      await refresh();
      return null;
    },
    [refresh]
  );

  return { summary, loading, error, claiming, clockOffset, refresh, claim };
};
