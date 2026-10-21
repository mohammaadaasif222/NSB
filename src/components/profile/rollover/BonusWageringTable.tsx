import type { FC } from 'react';
import Link from 'next/link';

import { useTranslation } from '@/context/I18nContext';
import { useCurrencyConversion } from '@/context/CurrencyConversionContext';
import type { TranslationKey } from '@/i18n/locales';
import type { UserBonus, UserBonusStatus } from '@/types';

const CELL = 'px-4 py-3 lg:px-[calc(var(--u)*20)] lg:py-[calc(var(--u)*14)]';
const HEAD = `${CELL} text-[11px] font-semibold uppercase tracking-wide text-white/40 lg:text-[length:max(10px,calc(var(--u)*13))]`;
const BODY = 'text-[13px] lg:text-[length:max(11px,calc(var(--u)*15))]';
const NOTE = 'text-[11px] text-white/45 lg:text-[length:max(10px,calc(var(--u)*13))]';

const STATUS_KEYS: Record<UserBonusStatus, TranslationKey> = {
  ACTIVE: 'bonus.status.active',
  COMPLETED: 'bonus.status.completed',
  EXPIRED: 'bonus.status.expired',
  FORFEITED: 'bonus.status.forfeited',
};

const STATUS_STYLE: Record<UserBonusStatus, string> = {
  ACTIVE: 'bg-[#f9d028]/10 text-[#f9d028]',
  COMPLETED: 'bg-[#35d07f]/10 text-[#35d07f]',
  EXPIRED: 'bg-white/7 text-white/64',
  FORFEITED: 'bg-white/7 text-white/64',
};

interface Props {
  rows: readonly UserBonus[];
  locale: string;
}

const BonusWageringTable: FC<Props> = ({ rows, locale }) => {
  const { t } = useTranslation();
  const { formatCurrencyDisplay } = useCurrencyConversion();

  const formatDate = (iso: string): string =>
    new Date(iso).toLocaleDateString(locale, { dateStyle: 'medium' });

  return (
    <div className="rl-glass-deep overflow-x-auto rounded-[20px] lg:rounded-[calc(var(--u)*28)]">
      <table className="w-full min-w-[620px] text-left">
        <thead>
          <tr className="border-b border-white/7">
            <th className={HEAD}>{t('roll.table.bonus')}</th>
            <th className={HEAD}>{t('roll.table.required')}</th>
            <th className={HEAD}>{t('roll.table.progress')}</th>
            <th className={HEAD}>{t('roll.table.status')}</th>
            <th className={HEAD}>{t('roll.table.date')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-white/5 last:border-0">
              <td className={CELL}>
                <Link
                  href="/bonuses"
                  className={`${BODY} font-medium text-[#f0f1f5] hover:text-[#ffe779]`}
                >
                  {row.bonus.name}
                </Link>
                <p className={NOTE}>
                  {t('roll.bonusAmount', { amount: formatCurrencyDisplay(row.bonus_amount) })}
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
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold lg:text-[length:max(10px,calc(var(--u)*13))] ${STATUS_STYLE[row.status]}`}
                >
                  {t(STATUS_KEYS[row.status])}
                </span>
              </td>

              <td
                className={`${CELL} text-[12px] text-white/50 lg:text-[length:max(10px,calc(var(--u)*14))]`}
              >
                {formatDate(row.claimed_at)}
                {row.status === 'ACTIVE' && row.expires_at && (
                  <p className={NOTE}>
                    {t('roll.bonusExpires', { date: formatDate(row.expires_at) })}
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

export default BonusWageringTable;
