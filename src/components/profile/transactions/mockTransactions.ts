import type { TranslationKey } from '@/i18n/locales';

/**
 * The ledger behind the Transactions tab.
 *
 * NOT WIRED — every row is generated here. The backend exposes balances
 * (`GET /balance/me`) but keeps no transaction history, so there is nothing to
 * list: this needs a paginated ledger endpoint that accepts the category and
 * search terms the UI already tracks.
 *
 * Generated rather than hand-written so the pager has something to page
 * through, and generated *deterministically* — a `Math.random()` here would
 * produce different rows on the server and on the client, which React reports
 * as a hydration mismatch.
 */

export type TxStatus = 'completed' | 'pending' | 'failed';
export type TxCategory = 'deposit' | 'withdrawal' | 'reward';

export interface Transaction {
  id: string;
  /** Pre-formatted. A real API should send an ISO timestamp instead. */
  date: string;
  usd: string;
  crypto: string;
  status: TxStatus;
  category: TxCategory;
  /** Signed change to the wallet, pre-formatted. */
  effect: string;
}

/** The filter chips, in the order the design lists them. */
export const TX_FILTERS = [
  { key: 'all', labelKey: 'tx.all' },
  { key: 'deposit', labelKey: 'tx.deposits' },
  { key: 'withdrawal', labelKey: 'tx.withdrawals' },
  { key: 'reward', labelKey: 'tx.rewards' },
] as const satisfies readonly { key: string; labelKey: TranslationKey }[];

export type TxFilter = (typeof TX_FILTERS)[number]['key'];

export const STATUS_LABEL: Record<TxStatus, TranslationKey> = {
  completed: 'tx.completed',
  pending: 'tx.pending',
  failed: 'tx.failed',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const STATUSES: TxStatus[] = ['completed', 'pending', 'completed', 'failed', 'completed'];
const CATEGORIES: TxCategory[] = ['deposit', 'withdrawal', 'deposit', 'reward', 'deposit'];

/** Knuth's multiplicative hash — a stable pseudo-random id from an index. */
const idFor = (i: number): string =>
  `TXN-${(((i + 1) * 2654435761) % 0xffffffff).toString(16).toUpperCase().padStart(8, '0')}`;

const ROW_COUNT = 44;
/** Rows per page, matching what the design fits in the table. */
export const PAGE_SIZE = 11;

const build = (): Transaction[] =>
  Array.from({ length: ROW_COUNT }, (_, i) => {
    const status = STATUSES[i % STATUSES.length];
    const category = CATEGORIES[i % CATEGORIES.length];

    // Spread across a few months from a fixed start, so nothing depends on
    // today's date.
    const dayIndex = 18 + i;
    const month = 6 + Math.floor(dayIndex / 31);
    const day = (dayIndex % 31) + 1;

    const usdValue = 500 + ((i * 317) % 2600);
    const cryptoValue = 0.0086 + ((i * 193) % 2500) / 100000;
    const outgoing = category === 'withdrawal';
    const amount = cryptoValue.toFixed(4);

    return {
      id: idFor(i),
      date: `${MONTHS[month % 12]} ${day}, 2025`,
      usd: `$${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      crypto: `${amount} BTC`,
      status,
      category,
      effect: `${outgoing ? '-' : '+'}${amount} BTC`,
    };
  });

const ALL_TRANSACTIONS: readonly Transaction[] = build();

/* ==================================================================== */
/* The request                                                           */
/* ==================================================================== */

/** What the ledger endpoint will be asked for. */
export interface TxQuery {
  query: string;
  filter: TxFilter;
  /** 1-based, as the pager counts. */
  page: number;
  pageSize: number;
}

/** What it will answer with. `total` drives the pager, not `rows.length`. */
export interface TxPage {
  rows: readonly Transaction[];
  total: number;
}

/**
 * Stands in for `GET /transactions?query=&filter=&page=&pageSize=`.
 *
 * Async and paged on purpose, even though it resolves immediately off an array
 * in memory: the section that calls it already tracks a request's loading
 * state and takes its page count from `total` rather than counting rows it
 * holds. Wiring the real endpoint is then a change to this function's body and
 * nothing else — where filtering in the component would have meant rewriting
 * its state to move the work to the server.
 */
export const queryTransactions = ({ query, filter, page, pageSize }: TxQuery): Promise<TxPage> => {
  const needle = query.trim().toLowerCase();

  const matches = ALL_TRANSACTIONS.filter((tx) => {
    if (filter !== 'all' && tx.category !== filter) {
      return false;
    }
    if (!needle) {
      return true;
    }
    return (
      tx.id.toLowerCase().includes(needle) ||
      tx.date.toLowerCase().includes(needle) ||
      tx.usd.toLowerCase().includes(needle) ||
      tx.crypto.toLowerCase().includes(needle)
    );
  });

  // A filter that shortens the list can strand the pager past the end.
  const lastPage = Math.max(1, Math.ceil(matches.length / pageSize));
  const safePage = Math.min(page, lastPage);

  return Promise.resolve({
    rows: matches.slice((safePage - 1) * pageSize, safePage * pageSize),
    total: matches.length,
  });
};
