import { useCallback, useEffect, useState, type FC } from 'react';
import apiService from '@/services/api';
import { useTranslation } from '@/context/I18nContext';
import { REWARD_ICONS } from '@/components/icons';
import { WALLET_REFRESH_EVENT } from '@/constants/events';
import { REWARD_STATUS_KEYS, REWARD_TITLE_KEYS } from '@/constants/rewards';
import { formatRewardAmount, formatWalletAmount } from '@/utils/money';
import type { RewardClaimStatus, RewardHistoryItem, RewardHistoryPage } from '@/types';

const PAGE_SIZE = 10;

const STATUS_STYLE: Record<RewardClaimStatus, string> = {
  PENDING: 'bg-slate-800 border-slate-700 text-slate-300',
  CLAIMABLE: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
  CLAIMED: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  EXPIRED: 'bg-red-500/10 border-red-500/30 text-red-300',
  ROLLED_OVER: 'bg-blue-600/15 border-blue-500/30 text-blue-300',
};

/** A finished reward is remembered by what reached the wallet, or else by what it was worth. */
const amountOf = (item: RewardHistoryItem): string => item.credited_amount ?? item.total_amount;

/** When it finished. */
const finishedAt = (item: RewardHistoryItem): string =>
  item.claimed_at ?? item.expires_at ?? item.updated_at;

const PAGER_BUTTON =
  'inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 disabled:bg-slate-900 disabled:border-slate-800 disabled:text-slate-600';

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
    <section className="rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-6">
      <h2 className="text-lg font-bold text-white">{t('rewards.history')}</h2>

      {rows.length === 0 ? (
        <p className="mt-4 text-xs text-slate-500">
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
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3 font-semibold">{t('rewards.col.reward')}</th>
                <th className="py-2 pr-3 text-right font-semibold">{t('rewards.col.amount')}</th>
                <th className="py-2 pr-3 font-semibold">{t('rewards.col.status')}</th>
                <th className="py-2 font-semibold">{t('rewards.col.date')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                const Icon = REWARD_ICONS[item.type];
                return (
                  <tr key={item.id} className="border-b border-slate-800 last:border-0">
                    <td className="py-2.5 pr-3">
                      <span className="flex items-center gap-2 text-slate-100">
                        <span className="text-slate-500" aria-hidden="true">
                          <Icon size={14} />
                        </span>
                        {t(REWARD_TITLE_KEYS[item.type])}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-right font-semibold text-slate-100 tabular-nums">
                      {formatRewardAmount(amountOf(item), currency)}
                      {item.payout_amount && item.payout_currency && (
                        <span className="block text-[11px] font-normal text-slate-500">
                          {formatWalletAmount(item.payout_amount, item.payout_currency)}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[item.status]}`}
                      >
                        {t(REWARD_STATUS_KEYS[item.status])}
                      </span>
                    </td>
                    <td className="py-2.5 text-xs text-slate-400 tabular-nums">
                      {formatDate(finishedAt(item))}
                    </td>
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
          <span className="px-1 text-xs text-slate-400 tabular-nums">
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
