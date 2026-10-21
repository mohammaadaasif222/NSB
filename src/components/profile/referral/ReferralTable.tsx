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
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      surface="rl-table-card"
      minWidth="820px"
      title={t('ref.yourReferral')}
      empty={<p className="py-6 text-center text-sm text-[#9da2b4]">{t('ref.empty')}</p>}
    />
  );
};

export default ReferralTable;
