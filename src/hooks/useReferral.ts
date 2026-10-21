import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { useWallet } from '@/context/WalletContext';
import { WALLET_REFRESH_EVENT } from '@/constants/events';
import { apiErrorMessage } from '@/lib/apiError';
import { analytics } from '@/services/analytics';
import {
  claimReferralCommission,
  createReferralCode,
  getReferralSummary,
  getReferredPlayers,
  updateReferralCode,
} from '@/services/referral';
import { formatRewardAmount } from '@/utils/money';
import type { Pagination, ReferralSummary, ReferredPlayer } from '@/types';

const PAGE_SIZE = 10;

export interface UseReferral {
  signedIn: boolean;
  summary: ReferralSummary | null;
  referred: ReferredPlayer[];
  pagination: Pagination | null;
  page: number;
  setPage: (page: number) => void;
  loading: boolean;
  claiming: boolean;
  claim: () => Promise<void>;
  createCode: (code: string, name: string) => Promise<boolean>;
  setCodeActive: (id: string, active: boolean) => Promise<void>;
}

/** The signed-in player's referral summary and referred players. */
export const useReferral = (): UseReferral => {
  const { token, hydrated } = useAuth();
  const { t } = useTranslation();
  const tRef = useRef(t);
  tRef.current = t;
  const { refresh: refreshWallet } = useWallet();
  const refreshWalletRef = useRef(refreshWallet);
  refreshWalletRef.current = refreshWallet;

  const [summary, setSummary] = useState<ReferralSummary | null>(null);
  const [referred, setReferred] = useState<ReferredPlayer[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const ticket = useRef(0);

  const refresh = useCallback(async (): Promise<void> => {
    if (!hydrated || !token) {
      setSummary(null);
      setReferred([]);
      return;
    }
    const mine = (ticket.current += 1);
    setLoading(true);
    try {
      const [summaryRes, referredRes] = await Promise.all([
        getReferralSummary(),
        getReferredPlayers({ page, limit: PAGE_SIZE }),
      ]);
      if (ticket.current !== mine) return;
      if (summaryRes?.success && summaryRes.data) setSummary(summaryRes.data);
      if (referredRes?.success && referredRes.data) {
        setReferred(referredRes.data.data);
        setPagination(referredRes.data.pagination);
      }
    } catch (err) {
      if (ticket.current === mine)
        toast.error(apiErrorMessage(err, tRef.current('ref.loadFailed')));
    } finally {
      if (ticket.current === mine) setLoading(false);
    }
  }, [hydrated, token, page]);

  useEffect(() => {
    void refresh();
    return () => {
      ticket.current += 1;
    };
  }, [refresh]);

  const claim = useCallback(async (): Promise<void> => {
    setClaiming(true);
    try {
      const res = await claimReferralCommission();
      if (res?.success && res.data) {
        const amount = formatRewardAmount(res.data.amount, 'USD');
        if (res.data.status === 'PENDING_REVIEW') {
          toast.info(tRef.current('ref.claimReview', { amount }));
        } else {
          toast.success(tRef.current('ref.claimed', { amount }));
          analytics.referral.rewardEarned(Number(res.data.amount), 'USD');
          void refreshWalletRef.current();
          window.dispatchEvent(new Event(WALLET_REFRESH_EVENT));
        }
      } else {
        toast.error(res?.message || tRef.current('ref.claimFailed'));
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, tRef.current('ref.claimFailed')));
    } finally {
      setClaiming(false);
      await refresh();
    }
  }, [refresh]);

  const createCode = useCallback(
    async (code: string, name: string): Promise<boolean> => {
      try {
        const res = await createReferralCode({ code, name });
        if (res?.success) {
          toast.success(tRef.current('ref.codeCreated'));
          await refresh();
          return true;
        }
        toast.error(res?.message || tRef.current('ref.codeFailed'));
      } catch (err) {
        toast.error(apiErrorMessage(err, tRef.current('ref.codeFailed')));
      }
      return false;
    },
    [refresh]
  );

  const setCodeActive = useCallback(
    async (id: string, active: boolean): Promise<void> => {
      try {
        await updateReferralCode(id, { is_active: active });
      } catch (err) {
        toast.error(apiErrorMessage(err, tRef.current('ref.codeFailed')));
      }
      await refresh();
    },
    [refresh]
  );

  return {
    signedIn: hydrated && !!token,
    summary,
    referred,
    pagination,
    page,
    setPage,
    loading,
    claiming,
    claim,
    createCode,
    setCodeActive,
  };
};
