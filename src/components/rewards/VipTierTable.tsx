import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { formatAmount, withCurrency } from '@/utils/money';
import type { VipTier } from '@/types';
import { MUTED, PANEL, PANEL_TITLE, TD, TH, TR } from './rewardStyles';

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
    <section className={PANEL}>
      <h2 className={PANEL_TITLE}>{t('rewards.tiers')}</h2>
      <p className={`mt-1 ${MUTED}`}>{t('rewards.tiersSubtitle')}</p>

      {tiers.length === 0 ? (
        <p className={`mt-4 ${MUTED}`}>{loading ? t('common.loading') : t('rewards.tiersEmpty')}</p>
      ) : (
        <div className="mt-4 overflow-x-auto thin-scrollbar">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className={TH}>{t('rewards.col.tier')}</th>
                <th className={TH}>{t('rewards.col.minWager')}</th>
                <th className={`${TH} text-right`}>{t('rewards.col.rakeback')}</th>
                <th className={`${TH} pr-0 text-right`}>{t('rewards.col.cashback')}</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => {
                const current = tier.id === currentTierId;
                return (
                  <tr key={tier.id} className={`${TR} ${current ? 'bg-[#ffe779]/[0.05]' : ''}`}>
                    <td className={`${TD} font-medium`}>
                      {tier.name}
                      {current && (
                        <span className="ms-2 inline-flex rounded-full border border-[#f9d028]/40 bg-[#f9d028]/10 px-2.5 py-0.5 text-[11px] leading-4 font-medium text-[#ffe779]">
                          {t('rewards.currentTier')}
                        </span>
                      )}
                    </td>
                    <td className={`${TD} text-[#9da2b4]`}>
                      {withCurrency(formatAmount(tier.min_wager), currency)}
                    </td>
                    <td className={`${TD} text-right`}>{tier.rakeback_percentage}%</td>
                    <td className={`${TD} pr-0 text-right`}>{tier.cashback_percentage}%</td>
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
