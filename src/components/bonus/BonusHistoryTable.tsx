import type { FC } from 'react';

import { useTranslation } from '@/context/I18nContext';
import { BONUS_STATUS_KEYS, BONUS_TITLE_KEYS } from '@/constants/bonus';
import { formatRewardAmount } from '@/utils/money';
import type { UserBonus, UserBonusStatus } from '@/types';

const STATUS_STYLE: Record<UserBonusStatus, string> = {
  ACTIVE: 'bg-[#f9d028]/10 text-[#f9d028]',
  COMPLETED: 'bg-[#35d07f]/10 text-[#35d07f]',
  EXPIRED: 'bg-white/7 text-white/64',
  FORFEITED: 'bg-[#ef4462]/10 text-[#ef4462]',
};

const CELL = 'px-4 py-3 lg:px-[calc(var(--u)*24)] lg:py-[calc(var(--u)*16)]';
const HEAD = `${CELL} text-[11px] font-semibold uppercase tracking-wide text-white/40 lg:text-[length:max(10px,calc(var(--u)*13))]`;

interface Props {
  awards: readonly UserBonus[];
  currency: string;
  locale: string;
}

/** Bonuses the player has finished with — claimed, expired or given up. */
const BonusHistoryTable: FC<Props> = ({ awards, currency, locale }) => {
  const { t } = useTranslation();

  return (
    <div className="rl-glass-deep max-lg:rl-glass-clear overflow-x-auto rounded-[24px] lg:rounded-[calc(var(--u)*34)]">
      <table className="w-full min-w-[560px] text-left">
        <thead>
          <tr className="border-b border-white/7">
            <th className={HEAD}>{t('bonus.table.bonus')}</th>
            <th className={HEAD}>{t('bonus.table.amount')}</th>
            <th className={HEAD}>{t('bonus.table.status')}</th>
            <th className={HEAD}>{t('bonus.table.finished')}</th>
          </tr>
        </thead>
        <tbody>
          {awards.map((award) => (
            <tr key={award.id} className="border-b border-white/5 last:border-0">
              <td className={CELL}>
                <p className="text-[14px] font-medium text-[#f0f1f5] lg:text-[length:max(11px,calc(var(--u)*16))]">
                  {award.bonus.name}
                </p>
                <p className="text-[12px] text-white/50 lg:text-[length:max(10px,calc(var(--u)*14))]">
                  {t(BONUS_TITLE_KEYS[award.bonus.type])}
                </p>
              </td>
              <td
                className={`${CELL} text-[14px] text-white/72 lg:text-[length:max(11px,calc(var(--u)*16))]`}
              >
                {formatRewardAmount(award.bonus_amount, currency)}
              </td>
              <td className={CELL}>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold lg:text-[length:max(10px,calc(var(--u)*13))] ${STATUS_STYLE[award.status]}`}
                >
                  {t(BONUS_STATUS_KEYS[award.status])}
                </span>
                {award.forfeit_reason && (
                  <p
                    className="mt-1 max-w-[200px] truncate text-[11px] text-white/40"
                    title={award.forfeit_reason}
                  >
                    {award.forfeit_reason}
                  </p>
                )}
              </td>
              <td
                className={`${CELL} text-[12px] text-white/50 lg:text-[length:max(10px,calc(var(--u)*14))]`}
              >
                {new Date(award.ended_at ?? award.updated_at).toLocaleDateString(locale)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BonusHistoryTable;
