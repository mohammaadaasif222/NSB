import type { BetRow, BetSort, Transaction } from './mockTransactions';
import { displayDecimal } from '../../../utils/decimalPrecision.ts';

/**
 * What the bets screens decide on their own, kept free of the app's aliases and
 * the API client so the Node test runner can load it.
 */

/** Bets are always shown in USD, the wallet's own unit. */
export const formatUsd = (usd: number | string, signed = false): string => {
  const n = typeof usd === 'string' ? parseFloat(usd) : usd;
  const text =
    displayDecimal(Math.abs(n), 'casino.bets', 'en-US') ??
    Math.abs(n).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const sign = signed && n !== 0 ? (n > 0 ? '+' : '-') : '';
  return `${sign}$${text}`;
};

/** The filters alone, as the export is asked with them; defaults are left out. */
export const betsFilterQueryString = (q: {
  query: string;
  game?: string;
  sort?: BetSort;
}): string => {
  const params = new URLSearchParams();
  if (q.query.trim()) params.set('search', q.query.trim());
  if (q.game) params.set('game', q.game);
  if (q.sort && q.sort !== 'recent') params.set('sort', q.sort);
  return params.toString();
};

/** The query string `GET /wallet/bets` is asked with. */
export const betsQueryString = (q: {
  query: string;
  page: number;
  pageSize: number;
  game?: string;
  sort?: BetSort;
}): string => {
  const params = new URLSearchParams({ page: String(q.page), limit: String(q.pageSize) });
  for (const [k, v] of new URLSearchParams(betsFilterQueryString(q))) params.set(k, v);
  return params.toString();
};

/** A round as a ledger row: the amounts are formatted later, in the section. */
export const betToTx = (
  b: Pick<BetRow, 'id' | 'created_at' | 'game_title' | 'status'> & {
    bet_usd: string;
    payout_usd: string;
  },
): Transaction => {
  const bet = parseFloat(b.bet_usd);
  const payout = parseFloat(b.payout_usd);
  return {
    id: b.id,
    date: new Date(b.created_at).toISOString().slice(0, 10),
    usd: '',
    crypto: b.game_title || '—',
    status: b.status,
    category: 'BET',
    effect: '',
    amount_usd: bet,
    net_usd: payout - bet,
    tx_type: 'BET',
    round: true,
  };
};

/**
 * A round's wallet effect: what it left the player with, stake already taken
 * off. An open round has not moved anything yet, and a break-even one is "0".
 */
export const roundEffect = (status: BetRow['status'], netUsd: number): string =>
  status === 'BET_PLACED' || netUsd === 0 ? '0' : formatUsd(netUsd, true);

/** The payout cell: an open round has no payout yet, which is not "$0.00". */
export const payoutLabel = (b: Pick<BetRow, 'status' | 'payout_usd'>, pending: string): string =>
  b.status === 'BET_PLACED' ? pending : formatUsd(b.payout_usd);

export const multiplierLabel = (b: Pick<BetRow, 'status' | 'multiplier'>): string =>
  b.status === 'BET_PLACED' || !b.multiplier ? '—' : `${b.multiplier}x`;

/** `424ba2ed-127a-4f3e-b054-1d5d7e2fedf3` as `424ba2ed…2fedf3`, so it never wraps. */
export const shortId = (id: string): string =>
  id.length > 16 ? `${id.slice(0, 8)}…${id.slice(-6)}` : id;

/**
 * One CSV cell. Quoted when it holds a comma, quote or line break; and a cell
 * that starts with `=`, `+`, `-`, `@`, tab or CR gets a leading `'` so a
 * spreadsheet shows it as text instead of running it as a formula (a game
 * title is data the player does not control).
 */
export const csvCell = (value: string | number | null | undefined): string => {
  let text = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const STATUS_WORD: Record<BetRow['status'], string> = {
  BET_WON: 'Won',
  BET_LOST: 'Lost',
  BET_PLACED: 'Pending',
};

export const BETS_CSV_HEADER = [
  'Bet ID',
  'Game',
  'Provider',
  'Date (UTC)',
  'Bet (USD)',
  'Multiplier',
  'Payout (USD)',
  'Status',
  'Game Round ID',
] as const;

/** The rows as CSV text, with a BOM so Excel reads the UTF-8 game names. */
export const betsToCsv = (bets: readonly BetRow[]): string => {
  const lines = [BETS_CSV_HEADER.map(csvCell).join(',')];
  for (const b of bets) {
    const open = b.status === 'BET_PLACED';
    lines.push(
      [
        b.id,
        b.game_title,
        b.game_provider,
        new Date(b.created_at).toISOString(),
        b.bet_usd,
        open ? '' : b.multiplier,
        open ? '' : b.payout_usd,
        STATUS_WORD[b.status],
        b.provider_round_id,
      ]
        .map(csvCell)
        .join(','),
    );
  }
  return `﻿${lines.join('\r\n')}\r\n`;
};

export const betsCsvFilename = (now: Date): string =>
  `rolluck-bets-${now.toISOString().slice(0, 10)}.csv`;
