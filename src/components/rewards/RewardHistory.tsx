import { useCallback, useEffect, useState, type FC } from 'react';
import apiService from '@/services/api';
import { useTranslation } from '@/context/I18nContext';
import { REWARD_ICONS } from '@/components/icons';
import { WALLET_REFRESH_EVENT } from '@/constants/events';
import { REWARD_STATUS_KEYS, REWARD_TITLE_KEYS } from '@/constants/rewards';
import { formatRewardAmount, formatWalletAmount } from '@/utils/money';
import type { RewardClaimStatus, RewardHistoryItem, RewardHistoryPage } from '@/types';
import { GHOST_BUTTON, MUTED, PANEL, PANEL_TITLE, TD, TH, TR } from './rewardStyles';

const PAGE_SIZE = 10;

const STATUS_STYLE: Record<RewardClaimStatus, string> = {
  PENDING: 'border-white/15 bg-white/5 text-[#9da2b4]',
  CLAIMABLE: 'border-[#f9d028]/40 bg-[#f9d028]/10 text-[#ffe779]',
  CLAIMED: 'border-[#03b739]/40 bg-[#03b739]/10 text-[#2ed573]',
  EXPIRED: 'border-[#ef4462]/40 bg-[#ef4462]/10 text-[#ef4462]',
  ROLLED_OVER: 'border-white/15 bg-white/5 text-[#f0f1f5]',
};

/** A finished reward is remembered by what reached the wallet, or else by what it was worth. */
const amountOf = (item: RewardHistoryItem): string => item.credited_amount ?? item.total_amount;

/** When it finished. */
const finishedAt = (item: RewardHistoryItem): string =>
  item.claimed_at ?? item.expires_at ?? item.updated_at;

const PAGER_BUTTON = GHOST_BUTTON;

/**
 * The player's finished rewards — claimed, expired, and rakeback that moved into
 * a Daily bonus — newest first. Refetches when a claim changes the wallet, so a
 * reward claimed above appears here straight away.
 */
const RewardHistory: FC<{ currency: string }> = ({ currency }) => {
  const { t, locale } = useTranslation();
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<RewardHistoryPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await apiService.get<RewardHistoryPage>('/rewards/me/history', {
        page,
        limit: PAGE_SIZE,
      });
      if (res?.success && res.data) {
        setResult(res.data);
        setFailed(false);
      } else {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();

    const onWalletChanged = (): void => void load();
    window.addEventListener(WALLET_REFRESH_EVENT, onWalletChanged);
    return () => window.removeEventListener(WALLET_REFRESH_EVENT, onWalletChanged);
  }, [load]);

  const rows = result?.data ?? [];
  const totalPages = Math.max(1, result?.pagination.totalPages ?? 1);

  const formatDate = (iso: string): string =>
    new Date(iso).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <section className={PANEL}>
      <h2 className={PANEL_TITLE}>{t('rewards.history')}</h2>

      {rows.length === 0 ? (
        <p className={`mt-4 ${MUTED}`}>
          {loading
            ? t('common.loading')
            : failed
              ? t('rewards.loadFailed')
              : t('rewards.historyEmpty')}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto thin-scrollbar">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className={TH}>{t('rewards.col.reward')}</th>
                <th className={`${TH} text-right`}>{t('rewards.col.amount')}</th>
                <th className={TH}>{t('rewards.col.status')}</th>
                <th className={`${TH} pr-0`}>{t('rewards.col.date')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                const Icon = REWARD_ICONS[item.type];
                return (
                  <tr key={item.id} className={TR}>
                    <td className={TD}>
                      <span className="flex items-center gap-2">
                        <span className="text-[#9da2b4]" aria-hidden="true">
                          <Icon size={14} />
                        </span>
                        {t(REWARD_TITLE_KEYS[item.type])}
                      </span>
                    </td>
                    <td className={`${TD} text-right font-medium`}>
                      {formatRewardAmount(amountOf(item), currency)}
                      {item.payout_amount && item.payout_currency && (
                        <span className="block text-[12px] font-normal text-[#9da2b4]">
                          {formatWalletAmount(item.payout_amount, item.payout_currency)}
                        </span>
                      )}
                    </td>
                    <td className={TD}>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-[12px] leading-5 font-medium ${STATUS_STYLE[item.status]}`}
                      >
                        {t(REWARD_STATUS_KEYS[item.status])}
                      </span>
                    </td>
                    <td className={`${TD} pr-0 text-[#9da2b4]`}>{formatDate(finishedAt(item))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav
          className="mt-4 flex items-center gap-2"
          aria-label={t('games.page', { page, total: totalPages })}
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className={PAGER_BUTTON}
          >
            ‹ {t('games.prev')}
          </button>
          <span className={`px-1 tabular-nums ${MUTED}`}>
            {t('games.page', { page, total: totalPages })}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className={PAGER_BUTTON}
          >
            {t('games.next')} ›
          </button>
        </nav>
      )}
    </section>
  );
};

export default RewardHistory;
