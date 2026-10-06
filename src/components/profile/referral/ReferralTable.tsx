import { useMemo, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import DataTable, { TableBadge, type DataColumn } from '@/components/profile/DataTable';
import { labelKeyOf, type ReferralRow } from '@/components/profile/referral/mockReferral';

/** Who the player has brought in, and what each one paid out. */
const ReferralTable: FC<{ rows: readonly ReferralRow[] }> = ({ rows }) => {
  const { t } = useTranslation();

  const columns = useMemo<readonly DataColumn<ReferralRow>[]>(
    () => [
      {
        key: 'id',
        header: t('ref.colId'),
        width: 225,
        cell: (r) => (
          <span className="block truncate text-sm leading-5 font-medium text-white">{r.id}</span>
        ),
      },
      {
        key: 'date',
        header: t('ref.colDate'),
        width: 232,
        cell: (r) => (
          <span className="block truncate text-sm leading-5 text-[#8c8c8c]">{r.date}</span>
        ),
      },
      {
        key: 'user',
        header: t('ref.colUser'),
        width: 296,
        cell: (r) => (
          <span className="block truncate text-sm leading-5 font-medium text-white">{r.user}</span>
        ),
      },
      {
        key: 'status',
        header: t('ref.colStatus'),
        width: 170,
        cell: (r) => <TableBadge>{t(labelKeyOf(r.status))}</TableBadge>,
      },
      {
        key: 'reward',
        header: t('ref.colReward'),
        width: 203,
        end: true,
        cell: (r) => (
          <span className="block truncate text-sm leading-5 font-medium text-white">
            {r.reward ?? t('ref.noChange')}
          </span>
        ),
      },
    ],
    [t]
  );

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      surface="rl-table-card"
      // 790 is what the five columns need once the insets close up, against the
      // 795 a laptop's panel leaves with the rail collapsed — so the table
      // stops scrolling sideways there. The slack for it came out of the user
      // column, which had 57px more than the longest address needs, and went to
      // the reward column, which did not have enough for "+$25.00 Bonus".
      minWidth="790px"
      title={t('ref.yourReferral')}
    />
  );
};

export default ReferralTable;
