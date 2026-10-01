import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { formatAmount, withCurrency } from '@/utils/money';
import type { VipTier } from '@/types';

interface Props {
  tiers: VipTier[];
  /** Highlighted as the player's own tier. */
  currentTierId?: string | null;
  currency: string;
  loading?: boolean;
}

/** The VIP ladder, lowest tier first, with the rates each one earns. */
const VipTierTable: FC<Props> = ({ tiers, currentTierId, currency, loading = false }) => {
  const { t } = useTranslation();

  return (
    <section className="rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-6">
      <h2 className="text-lg font-bold text-white">{t('rewards.tiers')}</h2>
      <p className="mt-1 text-xs text-slate-400">{t('rewards.tiersSubtitle')}</p>

      {tiers.length === 0 ? (
        <p className="mt-4 text-xs text-slate-500">
          {loading ? t('common.loading') : t('rewards.tiersEmpty')}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto thin-scrollbar">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3 font-semibold">{t('rewards.col.tier')}</th>
                <th className="py-2 pr-3 font-semibold">{t('rewards.col.minWager')}</th>
                <th className="py-2 pr-3 text-right font-semibold">{t('rewards.col.rakeback')}</th>
                <th className="py-2 text-right font-semibold">{t('rewards.col.cashback')}</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => {
                const current = tier.id === currentTierId;
                return (
                  <tr
                    key={tier.id}
                    className={`border-b border-slate-800 last:border-0 ${current ? 'bg-amber-500/5' : ''}`}
                  >
                    <td className="py-2.5 pr-3 font-semibold text-slate-100">
                      {tier.name}
                      {current && (
                        <span className="ml-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300">
                          {t('rewards.currentTier')}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pr-3 text-slate-300 tabular-nums">
                      {withCurrency(formatAmount(tier.min_wager), currency)}
                    </td>
                    <td className="py-2.5 pr-3 text-right text-slate-300 tabular-nums">
                      {tier.rakeback_percentage}%
                    </td>
                    <td className="py-2.5 text-right text-slate-300 tabular-nums">
                      {tier.cashback_percentage}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default VipTierTable;
