import { useCallback, useEffect, useState, type FC } from 'react';

import apiService from '@/services/api';
import { useTranslation } from '@/context/I18nContext';
import { WALLET_REFRESH_EVENT } from '@/constants/events';
import { formatRewardAmount } from '@/utils/money';
import type { TranslationKey } from '@/i18n/locales';
import type { BonusMovementKind, BonusMovementsPage } from '@/types';

const PAGE_SIZE = 10;

const KIND_KEYS: Record<BonusMovementKind, TranslationKey> = {
  CREDITED: 'bonus.movement.credited',
  FREE_SPINS: 'bonus.movement.freeSpins',
  RELEASED: 'bonus.movement.released',
  CAPTURED: 'bonus.movement.captured',
  EXPIRED: 'bonus.movement.expired',
  FORFEITED: 'bonus.movement.forfeited',
};

const CELL = 'px-4 py-3 lg:px-[calc(var(--u)*24)] lg:py-[calc(var(--u)*14)]';
const HEAD = `${CELL} text-[11px] font-semibold uppercase tracking-wide text-white/40`;

const BonusMovementsTable: FC<{ currency: string }> = ({ currency }) => {
  const { t, locale } = useTranslation();
  const [page, setPage] = useState(1);
  const [data, setData] = useState<BonusMovementsPage | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    try {
      const res = await apiService.get<BonusMovementsPage>('/bonuses/movements', {
        page,
        limit: PAGE_SIZE,
      });
      if (res?.success && res.data) {
        setData(res.data);
        setFailed(false);
      } else {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    }
  }, [page]);

  useEffect(() => {
    void load();
    const onChanged = (): void => void load();
    window.addEventListener(WALLET_REFRESH_EVENT, onChanged);
    return () => window.removeEventListener(WALLET_REFRESH_EVENT, onChanged);
  }, [load]);

  const rows = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;

  if (!data && !failed) {
    return <p className="text-[14px] text-white/56">{t('common.loading')}</p>;
  }
  if (failed && !data) {
    return <p className="text-[14px] text-white/56">{t('bonus.movementsFailed')}</p>;
  }
  if (rows.length === 0) {
    return (
      <p className="rl-glass-deep max-lg:rl-glass-clear rounded-[24px] px-5 py-8 text-center text-[14px] text-white/56 lg:rounded-[calc(var(--u)*34)]">
        {t('bonus.movementsEmpty')}
      </p>
    );
  }

  return (
    <div className="rl-glass-deep max-lg:rl-glass-clear overflow-x-auto rounded-[24px] lg:rounded-[calc(var(--u)*34)]">
      <table className="w-full min-w-[560px] text-left">
        <thead>
          <tr className="border-b border-white/7">
            <th className={HEAD}>{t('bonus.table.bonus')}</th>
            <th className={HEAD}>{t('bonus.movementKind')}</th>
            <th className={`${HEAD} text-right`}>{t('bonus.table.amount')}</th>
            <th className={HEAD}>{t('bonus.movementWhen')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const negative = row.amount !== null && Number(row.amount) < 0;
            return (
              <tr
                key={`${row.award_id}-${row.kind}-${index}`}
                className="border-b border-white/5 last:border-0"
              >
                <td className={`${CELL} text-[14px] font-medium text-[#f0f1f5]`}>{row.bonus}</td>
                <td className={`${CELL} text-[13px] text-white/72`}>
                  {t(KIND_KEYS[row.kind])}
                  <span className="block text-[11px] text-white/40">
                    {row.wallet === 'REAL' ? t('bonus.walletReal') : t('bonus.walletBonus')}
                  </span>
                </td>
                <td
                  className={`${CELL} text-right text-[14px] ${negative ? 'text-[#ef4462]' : 'text-[#35d07f]'}`}
                >
                  {row.amount === null
                    ? '—'
                    : `${negative ? '−' : '+'}${formatRewardAmount(String(Math.abs(Number(row.amount))), currency, 'bonus.awards')}`}
                </td>
                <td className={`${CELL} text-[12px] text-white/50`}>
                  {new Date(row.at).toLocaleString(locale, {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 border-t border-white/7 px-4 py-3 text-[12px] text-white/56">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-full px-3 py-1 hover:text-white disabled:opacity-40"
          >
            {t('bonus.previous')}
          </button>
          <span>{t('bonus.pageOf', { page, total: totalPages })}</span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            className="rounded-full px-3 py-1 hover:text-white disabled:opacity-40"
          >
            {t('bonus.next')}
          </button>
        </div>
      )}
    </div>
  );
};

export default BonusMovementsTable;
