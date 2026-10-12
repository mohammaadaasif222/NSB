import { useMemo, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import DataTable, { TableBadge, type DataColumn } from '@/components/profile/DataTable';
import { STATUS_LABEL, type Transaction } from './mockTransactions';

/**
 * The coin beside a crypto amount.
 *
 * Grey rather than Bitcoin's orange — the design mutes it to `Gray 5`, which
 * keeps the column reading as a number rather than a row of logos.
 */
const BitcoinMark: FC = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className="shrink-0"
    aria-hidden="true"
  >
    <path
      d="M0 9C0 4.02823 4.02823 0 9 0C13.9718 0 18 4.02823 18 9C18 13.9718 13.9718 18 9 18C4.02823 18 0 13.9718 0 9ZM12.8577 7.71895C13.0355 6.52137 12.1246 5.87903 10.8762 5.44718L11.279 3.825L10.2919 3.57823L9.89637 5.15685C9.63508 5.09153 9.37016 5.02984 9.10524 4.97177L9.50081 3.38226L8.51371 3.13548L8.10726 4.75766C7.89314 4.71048 7.68266 4.65968 7.47581 4.60887V4.60524L6.11492 4.26411L5.85363 5.32016C5.85363 5.32016 6.58669 5.4871 6.57218 5.49798C6.97137 5.5996 7.04395 5.86089 7.03306 6.07137L6.57218 7.91855C6.60121 7.92581 6.63387 7.93669 6.67379 7.95121C6.64113 7.94395 6.60484 7.93306 6.56855 7.92581L5.92258 10.5133C5.8754 10.6331 5.74839 10.8181 5.46895 10.7492C5.47984 10.7637 4.7504 10.5714 4.7504 10.5714L4.26048 11.7L5.54516 12.0194C5.78468 12.081 6.01694 12.1427 6.24919 12.2008L5.83911 13.8411L6.82621 14.0879L7.23266 12.4657C7.49395 12.5383 7.75524 12.6036 8.02016 12.669L7.61734 14.2839L8.60444 14.5306L9.01452 12.894C10.6984 13.2133 11.9649 13.0827 12.4984 11.5621C12.9266 10.3355 12.4766 9.62782 11.5911 9.16694C12.2371 9.01815 12.7234 8.59355 12.8504 7.71895H12.8577ZM10.6004 10.8835C10.2956 12.1101 8.23064 11.446 7.55927 11.279L8.1 9.10524C8.76774 9.27218 10.9161 9.60242 10.5968 10.8835H10.6004ZM10.9052 7.70081C10.6258 8.81492 8.90927 8.24879 8.3504 8.11089L8.84032 6.14032C9.39919 6.27823 11.1919 6.53952 10.9016 7.70081H10.9052Z"
      fill="#C8CCD8"
    />
  </svg>
);

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
const TransactionTable: FC<{ rows: readonly Transaction[] }> = ({ rows }) => {
  const { t, locale } = useTranslation();

  const columns = useMemo<readonly DataColumn<Transaction>[]>(
    () => [
      {
        key: 'id',
        header: t('tx.id'),
        width: 225,
        cell: (r) => (
          <span className="block truncate text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[1.43] font-medium text-white">
            {r.id}
          </span>
        ),
      },
      {
        key: 'date',
        header: t('tx.date'),
        width: 175,
        cell: (r) => (
          <span className="block truncate text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[1.43] text-[#8c8c8c]">
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
        width: 172,
        cell: (r) => (
          <span className="block truncate text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[1.43] font-medium tabular-nums text-white">
            {r.usd}
          </span>
        ),
      },
      {
        key: 'crypto',
        header: t('tx.valueCrypto'),
        width: 233,
        cell: (r) => (
          <span className="flex min-w-0 items-center gap-[calc(var(--u)*6)] text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[1.43] font-medium tabular-nums text-white">
            <BitcoinMark />
            <span className="truncate">{r.crypto}</span>
          </span>
        ),
      },
      {
        key: 'type',
        header: t('tx.type'),
        width: 170,
        cell: (r) => <TableBadge>{t(STATUS_LABEL[r.status])}</TableBadge>,
      },
      {
        key: 'effect',
        header: t('tx.walletEffect'),
        width: 150,
        end: true,
        cell: (r) => (
          <span className="block truncate text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[1.43] font-medium tabular-nums text-white">
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
      // 672 is what the six columns need once the insets close up, and a 14"
      // laptop's panel leaves 678 — so the ledger stops scrolling sideways on
      // the screen most people read it on, and only starts on a tablet.
      minWidth="672px"
      empty={t('tx.noResults')}
    />
  );
};

export default TransactionTable;
