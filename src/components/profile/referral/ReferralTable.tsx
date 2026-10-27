import { useMemo, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import DataTable, { TableBadge, type DataColumn } from '@/components/profile/DataTable';
import { formatRewardAmount } from '@/utils/money';
import type { TranslationKey } from '@/i18n/locales';
import type { ReferralStatus, ReferredPlayer } from '@/types';

const STATUS_LABELS = {
  PENDING: 'ref.status.pending',
  ACTIVE: 'ref.status.active',
  ON_HOLD: 'ref.status.onHold',
  REJECTED: 'ref.status.rejected',
} as const satisfies Record<ReferralStatus, TranslationKey>;

const TEXT = 'block truncate text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[1.43]';

/** Who the player has brought in, and what each one has earned them. */
const ReferralTable: FC<{ rows: readonly ReferredPlayer[] }> = ({ rows }) => {
  const { t, locale } = useTranslation();

  const columns = useMemo<readonly DataColumn<ReferredPlayer>[]>(
    () => [
      {
        key: 'user',
        header: t('ref.colUser'),
        width: 200,
        cell: (r) => <span className={`${TEXT} font-medium text-white`}>{r.username}</span>,
      },
      {
        key: 'date',
        header: t('ref.colDate'),
        width: 180,
        cell: (r) => (
          <span className={`${TEXT} text-[#8c8c8c]`}>
            {new Date(r.joined_at).toLocaleDateString(locale, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        ),
      },
      {
        key: 'code',
        header: t('ref.colCode'),
        width: 170,
        cell: (r) => <span className={`${TEXT} text-[#8c8c8c]`}>{r.code ?? '—'}</span>,
      },
      {
        key: 'status',
        header: t('ref.colStatus'),
        width: 150,
        cell: (r) => <TableBadge>{t(STATUS_LABELS[r.status])}</TableBadge>,
      },
      {
        key: 'wagered',
        header: t('ref.colWagered'),
        width: 160,
        cell: (r) => (
          <span className={`${TEXT} text-white`}>{formatRewardAmount(r.total_wagered, 'USD')}</span>
        ),
      },
      {
        key: 'commission',
        header: t('ref.colReward'),
        width: 160,
        end: true,
        cell: (r) => (
          <span className={`${TEXT} font-medium text-white`}>
            {formatRewardAmount(r.total_commission, 'USD')}
          </span>
        ),
      },
    ],
    [t, locale]
  );

  return (
    <>
      <section className="lg:hidden">
        <h3 className="text-[16px] leading-6 font-medium text-white">{t('ref.yourReferral')}</h3>
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-[#9da2b4]">{t('ref.empty')}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {rows.map((r) => (
              <li key={r.id} className="rounded-2xl bg-white/5 p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-[14px] leading-5 font-medium text-white">
                    {r.username}
                  </span>
                  <span className="shrink-0 rounded-md bg-white/10 px-2 py-0.5 text-[11px] leading-[13px] font-semibold text-white">
                    {t(STATUS_LABELS[r.status])}
                  </span>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-3 text-[12px] leading-[15px]">
                  <span className="min-w-0 truncate text-[#b3b3b3]">
                    {t('ref.colCode')}: {r.code ?? '—'}
                  </span>
                  <span className="shrink-0 font-semibold text-white">
                    +{formatRewardAmount(r.total_commission, 'USD')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="max-lg:hidden">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          surface="rl-table-card"
          minWidth="820px"
          title={t('ref.yourReferral')}
          empty={<p className="py-6 text-center text-sm text-[#9da2b4]">{t('ref.empty')}</p>}
        />
      </div>
    </>
  );
};

export default ReferralTable;
