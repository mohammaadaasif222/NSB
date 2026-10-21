import type { FC } from 'react';

import { useTranslation } from '@/context/I18nContext';
import { useCurrencyConversion } from '@/context/CurrencyConversionContext';
import { ROLLOVER_STATUS_KEYS, ROLLOVER_STATUS_STYLE } from '@/constants/rollover';
import { formatWalletAmount } from '@/utils/money';
import type { DepositRollover } from '@/types';

const CELL = 'px-4 py-3 lg:px-[calc(var(--u)*20)] lg:py-[calc(var(--u)*14)]';
const HEAD = `${CELL} text-[11px] font-semibold uppercase tracking-wide text-white/40 lg:text-[length:max(10px,calc(var(--u)*13))]`;
const BODY = 'text-[13px] lg:text-[length:max(11px,calc(var(--u)*15))]';
const NOTE = 'text-[11px] text-white/45 lg:text-[length:max(10px,calc(var(--u)*13))]';

interface Props {
  rows: readonly DepositRollover[];
  locale: string;
  empty: string;
  onOpen: (rollover: DepositRollover) => void;
}

const RolloverTable: FC<Props> = ({ rows, locale, empty, onOpen }) => {
  const { t } = useTranslation();
  const { formatCurrencyDisplay } = useCurrencyConversion();

  const formatDate = (iso: string): string =>
    new Date(iso).toLocaleDateString(locale, { dateStyle: 'medium' });

  if (rows.length === 0) {
    return (
      <div className="rl-glass-deep rounded-[20px] px-4 py-10 text-center lg:rounded-[calc(var(--u)*28)]">
        <p className="text-[13px] text-white/50 lg:text-[length:max(11px,calc(var(--u)*15))]">
          {empty}
        </p>
      </div>
    );
  }

  return (
    <div className="rl-glass-deep overflow-x-auto rounded-[20px] lg:rounded-[calc(var(--u)*28)]">
      <table className="w-full min-w-[620px] text-left">
        <thead>
          <tr className="border-b border-white/7">
            <th className={HEAD}>{t('roll.table.source')}</th>
            <th className={HEAD}>{t('roll.table.required')}</th>
            <th className={HEAD}>{t('roll.table.progress')}</th>
            <th className={HEAD}>{t('roll.table.status')}</th>
            <th className={HEAD}>{t('roll.table.date')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onOpen(row)}
              className="cursor-pointer border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.04]"
            >
              <td className={CELL}>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpen(row);
                  }}
                  className={`${BODY} text-left font-medium text-[#f0f1f5] hover:text-[#ffe779]`}
                >
                  {row.deposit
                    ? formatWalletAmount(row.deposit.amount, row.deposit.currency_code)
                    : (row.bonus?.name ?? t('roll.detail.bonus'))}
                </button>
                <p className={NOTE}>
                  {row.deposit
                    ? row.deposit.network_code
                    : t('roll.bonusAmount', {
                        amount: formatCurrencyDisplay(row.base_amount),
                      })}{' '}
                  · {t('roll.times', { times: Number(row.wagering_multiplier) })}
                </p>
              </td>

              <td className={`${CELL} ${BODY} text-white/72`}>
                {formatCurrencyDisplay(row.wagering_required)}
              </td>

              <td className={`${CELL} min-w-[160px]`}>
                <div
                  className="h-1.5 overflow-hidden rounded-full bg-white/10"
                  role="progressbar"
                  aria-valuenow={row.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={t('roll.table.progress')}
                >
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ${
                      row.status === 'COMPLETED' ? 'bg-[#35d07f]' : 'bg-[#f9d028]'
                    }`}
                    style={{ width: `${row.progress}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-white/50 lg:text-[length:max(10px,calc(var(--u)*13))]">
                  {formatCurrencyDisplay(row.wagering_completed)} /{' '}
                  {formatCurrencyDisplay(row.wagering_required)} · {row.progress}%
                </p>
              </td>

              <td className={CELL}>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold lg:text-[length:max(10px,calc(var(--u)*13))] ${ROLLOVER_STATUS_STYLE[row.status]}`}
                >
                  {t(ROLLOVER_STATUS_KEYS[row.status])}
                </span>
              </td>

              <td
                className={`${CELL} text-[12px] text-white/50 lg:text-[length:max(10px,calc(var(--u)*14))]`}
              >
                {formatDate(row.created_at)}
                {row.bonus?.status === 'ACTIVE' && row.bonus.expires_at && (
                  <p className={NOTE}>
                    {t('roll.bonusExpires', { date: formatDate(row.bonus.expires_at) })}
                  </p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RolloverTable;
