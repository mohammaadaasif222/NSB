import { useMemo, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import DataTable, { type DataColumn } from '@/components/profile/DataTable';
import type { BetRow } from './mockTransactions';
import { formatUsd, multiplierLabel, payoutLabel, shortId } from './bets.rules';

interface Props {
  rows: readonly BetRow[];
  onRowClick?: (bet: BetRow) => void;
  empty: string;
}

const TEXT = 'text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[1.43]';

const payoutTone = (r: BetRow): string =>
  r.status === 'BET_WON' ? 'text-[#4ade80]' : 'text-white/70';

/** One row per round: ID, game, when, stake, multiplier and payout. */
const BetsTable: FC<Props> = ({ rows, onRowClick, empty }) => {
  const { t, locale } = useTranslation();

  const when = (iso: string): string =>
    new Date(iso).toLocaleString(locale, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const payout = (r: BetRow): string => payoutLabel(r, t('tx.pending'));
  const multiplier = multiplierLabel;

  const columns = useMemo<readonly DataColumn<BetRow>[]>(
    () => [
      {
        key: 'id',
        header: t('tx.betId'),
        width: 130,
        cell: (r) => (
          <span className={`${TEXT} block truncate font-medium text-white/60`} title={r.id}>
            {shortId(r.id)}
          </span>
        ),
      },
      {
        key: 'game',
        header: t('tx.game'),
        width: 190,
        cell: (r) => (
          <span className={`${TEXT} flex min-w-0 items-center gap-2 font-medium text-white`}>
            {r.game_image && (
              <img src={r.game_image} alt="" className="h-6 w-6 shrink-0 rounded object-cover" />
            )}
            <span className="truncate">{r.game_title || '—'}</span>
          </span>
        ),
      },
      {
        key: 'date',
        header: t('tx.date'),
        width: 150,
        cell: (r) => <span className={`${TEXT} text-white/60`}>{when(r.created_at)}</span>,
      },
      {
        key: 'bet',
        header: t('tx.stake'),
        width: 110,
        cell: (r) => (
          <span className={`${TEXT} font-medium tabular-nums text-white`}>{formatUsd(r.bet_usd)}</span>
        ),
      },
      {
        key: 'multiplier',
        header: t('tx.multiplier'),
        width: 100,
        cell: (r) => <span className={`${TEXT} tabular-nums text-white/80`}>{multiplier(r)}</span>,
      },
      {
        key: 'payout',
        header: t('tx.payout'),
        width: 100,
        end: true,
        cell: (r) => (
          <span className={`${TEXT} font-medium tabular-nums ${payoutTone(r)}`}>{payout(r)}</span>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, locale],
  );

  return (
    <>
      <ul className="flex flex-col gap-3 lg:hidden">
        {rows.length === 0 && (
          <li className="rounded-2xl bg-white/5 p-[14px] text-center text-[14px] leading-5 text-[#9da2b4]">
            {empty}
          </li>
        )}
        {rows.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => onRowClick?.(r)}
              className="block w-full rounded-2xl bg-white/5 p-[14px] text-start transition-colors hover:bg-white/[0.08]"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="truncate text-[14px] leading-5 font-medium text-white">
                  {r.game_title || '—'}
                </span>
                <span className={`text-[14px] leading-5 font-medium tabular-nums ${payoutTone(r)}`}>
                  {payout(r)}
                </span>
              </span>
              <span className="mt-2 flex items-center justify-between gap-3 text-[12px] leading-4 text-[#8c8c8c]">
                <span>{when(r.created_at)}</span>
                <span className="tabular-nums">
                  {formatUsd(r.bet_usd)} · {multiplier(r)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="max-lg:hidden">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          surface="rl-glass-edge"
          minWidth="760px"
          empty={empty}
          onRowClick={onRowClick}
        />
      </div>
    </>
  );
};

export default BetsTable;
