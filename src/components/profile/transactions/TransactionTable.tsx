import { useMemo, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import DataTable, { TableBadge, type DataColumn } from '@/components/profile/DataTable';
import { STATUS_LABEL, CATEGORY_LABEL, type Transaction } from './mockTransactions';

/**
 * The ledger.
 *
 * The first four tracks are the design's. The last two are not: it gives Type
 * 235 for a badge that is never wider than 84, and leaves Wallet Effect 85 —
 * exactly what "+0.0215 BTC" measures in Onest and three pixels less than it
 * measures in the Poppins this app ships. The slack moves from the column that
 * has it to the column that needs it; every column still starts where the
 * design starts it, since only the last boundary moves.
 */
interface Props {
  rows: readonly Transaction[];
  onRowClick?: (transaction: Transaction) => void;
}

const TransactionTable: FC<Props> = ({ rows, onRowClick }) => {
  const { t, locale } = useTranslation();

  const columns = useMemo<readonly DataColumn<Transaction>[]>(
    () => [
      {
        key: 'id',
        header: t('tx.id'),
        width: 180,
        cell: (r) => (
          <span
            className="text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[1.43] font-medium text-white truncate cursor-pointer hover:text-[#4ade80]"
            title={r.id.toUpperCase()}
            onClick={() => onRowClick?.(r)}
          >
            {r.id.slice(-12).toUpperCase()}
          </span>
        ),
      },
      {
        key: 'date',
        header: t('tx.date'),
        width: 130,
        cell: (r) => (
          <span className="text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[1.43] text-[#8c8c8c] text-center">
            {new Date(`${r.date}T00:00:00Z`).toLocaleDateString(locale, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              timeZone: 'UTC',
            })}
          </span>
        ),
      },
      {
        key: 'usd',
        header: t('tx.valueUsd'),
        width: 150,
        cell: (r) => (
          <span className="text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[1.43] font-medium tabular-nums text-white text-right">
            {r.usd}
          </span>
        ),
      },
      {
        key: 'type',
        header: t('tx.type'),
        width: 120,
        cell: (r) => (
          <span className="text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[1.43] text-center">
            <TableBadge>{t(CATEGORY_LABEL[r.category])}</TableBadge>
          </span>
        ),
      },
      {
        key: 'status',
        header: t('tx.status'),
        width: 130,
        cell: (r) => (
          <span className="text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[1.43] text-center">
            <TableBadge>{t(STATUS_LABEL[r.status])}</TableBadge>
          </span>
        ),
      },
      {
        key: 'effect',
        header: t('tx.walletEffect'),
        width: 80,
        end: true,
        cell: (r) => (
          <span className="text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[1.43] font-medium tabular-nums text-white truncate text-right">
            {r.effect}
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
      surface="rl-glass-edge"
      minWidth="760px"
      empty={t('tx.noResults')}
    />
  );
};

export default TransactionTable;
