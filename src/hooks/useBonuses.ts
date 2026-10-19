import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import apiService from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { useWallet } from '@/context/WalletContext';
import { BONUS_REFRESH_EVENT, WALLET_REFRESH_EVENT } from '@/constants/events';
import { formatWalletAmount } from '@/utils/money';
import type { ApiError, BonusClaimResult, BonusSummary, BonusesView, PublicBonuses } from '@/types';

export interface UseBonuses {
  summary: BonusesView | null;
  loading: boolean;
  error: string | null;
  /** The campaign or award whose request is in flight, if any. */
  busyId: string | null;
  signedIn: boolean;
  clockOffset: number;
  refresh: () => Promise<void>;
  claim: (input: { bonusId?: string; couponCode?: string }) => Promise<BonusClaimResult | null>;
  forfeit: (awardId: string) => Promise<boolean>;
}

/**
 * The signed-in player's bonuses.
 *
 * Deliberately simpler than useRewards, which schedules its own refetches
 * around cycle boundaries. A bonus has no boundary a player is waiting on: an
 * award progresses as they play and completes the moment its requirement is
 * met, both of which already fire a wallet event. So this refetches when
 * something happens, not on a timer.
 */
export const useBonuses = (): UseBonuses => {
  const { token, hydrated } = useAuth();
  const { t } = useTranslation();

  // `t` is a new function on every render; read through a ref so callbacks
  // built on it stay stable instead of refetching on each render.
  const tRef = useRef(t);
  tRef.current = t;

  const { refresh: refreshWallet } = useWallet();
  const refreshWalletRef = useRef(refreshWallet);
  refreshWalletRef.current = refreshWallet;

  const [summary, setSummary] = useState<BonusesView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [clockOffset, setClockOffset] = useState(0);

  const ticket = useRef(0);

  const refresh = useCallback(async (): Promise<void> => {
    if (!hydrated) {
      return;
    }

    const mine = (ticket.current += 1);
    const current = (): boolean => ticket.current === mine;

    setLoading(true);
    setError(null);
    try {
      if (token) {
        const res = await apiService.get<BonusSummary>('/bonuses/me');
        if (!current()) {
          return;
        }
        if (res?.success && res.data) {
          const data = res.data;
          setClockOffset(new Date(data.server_time).getTime() - Date.now());
          setSummary({
            server_time: data.server_time,
            currency: data.currency,
            enabled: data.enabled,
            welcome_enabled: data.welcome_enabled,
            regular_enabled: data.regular_enabled,
            slots_remaining: data.slots_remaining,
            welcome: data.welcome ?? [],
            available: data.available ?? [],
            active: data.active ?? [],
            history: data.history ?? [],
          });
          setError(null);
        } else {
          setError(res?.message || tRef.current('bonus.loadFailed'));
        }
        return;
      }

      const res = await apiService.get<PublicBonuses>('/bonuses/public');
      if (!current()) {
        return;
      }
      if (res?.success && res.data) {
        const data = res.data;
        setClockOffset(new Date(data.server_time).getTime() - Date.now());
        setSummary({
          server_time: data.server_time,
          currency: data.currency,
          enabled: data.enabled,
          welcome_enabled: data.welcome_enabled,
          regular_enabled: data.regular_enabled,
          slots_remaining: 0,
          welcome: data.welcome ?? [],
          available: data.available ?? [],
          active: [],
          history: [],
        });
        setError(null);
      } else {
        setError(res?.message || tRef.current('bonus.loadFailed'));
      }
    } catch (err) {
      if (current()) {
        setError((err as ApiError)?.message || tRef.current('bonus.loadFailed'));
      }
    } finally {
      if (current()) {
        setLoading(false);
      }
    }
  }, [token, hydrated]);

  useEffect(() => {
    setSummary(null);
    void refresh();

    // A claim changes the wallet; a completed award moves bonus funds to real.
    const onChanged = (): void => void refresh();
    window.addEventListener(WALLET_REFRESH_EVENT, onChanged);
    window.addEventListener(BONUS_REFRESH_EVENT, onChanged);
    return () => {
      ticket.current += 1;
      window.removeEventListener(WALLET_REFRESH_EVENT, onChanged);
      window.removeEventListener(BONUS_REFRESH_EVENT, onChanged);
    };
  }, [refresh]);

  const claim = useCallback(
    async (input: { bonusId?: string; couponCode?: string }): Promise<BonusClaimResult | null> => {
      setBusyId(input.bonusId ?? input.couponCode ?? 'claim');
      try {
        const res = await apiService.post<BonusClaimResult>('/bonuses/claim', {
          ...(input.bonusId ? { bonus_id: input.bonusId } : {}),
          ...(input.couponCode ? { coupon_code: input.couponCode } : {}),
        });

        if (res?.success && res.data) {
          const credited = res.data.credited;
          toast.success(
            credited
              ? tRef.current('bonus.claimed', {
                  amount: formatWalletAmount(credited.amount, credited.currency_code),
                  bonus: res.data.award.bonus.name,
                })
              : tRef.current('bonus.claimedNoCash', { bonus: res.data.award.bonus.name })
          );
          // The header balance reads the wallet; the bonuses page listens too.
          void refreshWalletRef.current();
          window.dispatchEvent(new Event(WALLET_REFRESH_EVENT));
          return res.data;
        }
        toast.error(res?.message || tRef.current('bonus.claimFailed'));
      } catch (err) {
        toast.error((err as ApiError)?.message || tRef.current('bonus.claimFailed'));
      } finally {
        setBusyId(null);
      }

      // The claim failed — most often because it was taken elsewhere or the
      // deposit no longer qualifies. Show the server's state, not a stale card.
      await refresh();
      return null;
    },
    [refresh]
  );

  const forfeit = useCallback(
    async (awardId: string): Promise<boolean> => {
      setBusyId(awardId);
      try {
        const res = await apiService.post(`/bonuses/${awardId}/forfeit`);
        if (res?.success) {
          toast.success(tRef.current('bonus.forfeited'));
          void refreshWalletRef.current();
          window.dispatchEvent(new Event(WALLET_REFRESH_EVENT));
          return true;
        }
        toast.error(res?.message || tRef.current('bonus.forfeitFailed'));
      } catch (err) {
        toast.error((err as ApiError)?.message || tRef.current('bonus.forfeitFailed'));
      } finally {
        setBusyId(null);
      }

      await refresh();
      return false;
    },
    [refresh]
  );

  return {
    summary,
    loading,
    error,
    busyId,
    signedIn: !!token,
    clockOffset,
    refresh,
    claim,
    forfeit,
  };
};
