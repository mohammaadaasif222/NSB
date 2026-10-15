import api from '@/services/api';
import type { TranslationKey } from '@/i18n/locales';

/**
 * The ledger behind the Transactions tab.
 *
 * Fetches transaction data from the API endpoint: GET /wallet/transactions
 * Supports filtering by type (all, deposit, withdrawal, rewards) and
 * searching by transaction ID with pagination support.
 */

export type TxStatus =
  | 'DEPOSIT_PENDING'
  | 'DEPOSIT_DETECTED'
  | 'DEPOSIT_CONFIRMED'
  | 'DEPOSIT_FAILED'
  | 'WITHDRAW_PENDING_RISK'
  | 'WITHDRAW_RISK_APPROVED'
  | 'WITHDRAW_APPROVED'
  | 'WITHDRAW_PROCESSING'
  | 'WITHDRAW_COMPLETED'
  | 'WITHDRAW_REJECTED'
  | 'WITHDRAW_FAILED';

export type TxCategory = 'DEPOSIT' | 'WITHDRAWAL' | 'REWARD';

export interface Transaction {
  id: string;
  /** ISO date (`YYYY-MM-DD`); the table formats it in the player's language. */
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
  DEPOSIT_PENDING: 'tx.depositPending',
  DEPOSIT_DETECTED: 'tx.depositDetected',
  DEPOSIT_CONFIRMED: 'tx.depositConfirmed',
  DEPOSIT_FAILED: 'tx.depositFailed',
  WITHDRAW_PENDING_RISK: 'tx.withdrawPendingRisk',
  WITHDRAW_RISK_APPROVED: 'tx.withdrawRiskApproved',
  WITHDRAW_APPROVED: 'tx.withdrawApproved',
  WITHDRAW_PROCESSING: 'tx.withdrawProcessing',
  WITHDRAW_COMPLETED: 'tx.withdrawCompleted',
  WITHDRAW_REJECTED: 'tx.withdrawRejected',
  WITHDRAW_FAILED: 'tx.withdrawFailed',
};

export const CATEGORY_LABEL: Record<TxCategory, TranslationKey> = {
  DEPOSIT: 'tx.deposits',
  WITHDRAWAL: 'tx.withdrawals',
  REWARD: 'tx.rewards',
};

/** Rows per page, matching what the design fits in the table. */
export const PAGE_SIZE = 11;

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
 * Fetches transactions from the API endpoint: GET /wallet/transactions
 * Transforms the API response to match the Transaction interface.
 */
export const queryTransactions = async ({ query, filter, page, pageSize }: TxQuery): Promise<TxPage> => {
  try {
    const response = await api.get('/wallet/transactions', {
      params: {
        type: filter === 'all' ? 'all' : filter,
        search: query.trim() || undefined,
        page,
        limit: pageSize,
      },
    });

    const apiData = response.data?.data || response.data;
    const transactions = apiData.transactions || [];
    const total = apiData.pagination?.total || 0;

    // Transform API response to UI Transaction format
    const rows = transactions.map((tx: any) => {
      const isOutgoing = tx.type === 'WITHDRAWAL';
      const categoryMap: Record<string, TxCategory> = {
        DEPOSIT: 'DEPOSIT',
        WITHDRAWAL: 'WITHDRAWAL',
        REWARD: 'REWARD',
      };

      const amount = tx.display_amount || tx.amount || '0';
      const currency = tx.currency_code || 'BTC';
      const usdValue = tx.amount_usd || tx.display_amount || '0';

      // Determine wallet effect based on transaction status
      let effectAmount: string;
      if (tx.status === 'WITHDRAW_REJECTED') {
        // Rejected withdrawals show 0 effect
        effectAmount = '0';
      } else if (tx.status === 'DEPOSIT_CONFIRMED') {
        // Confirmed deposits show USD amount
        effectAmount = `+${parseFloat(usdValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } else {
        // Other transactions show crypto amount
        effectAmount = isOutgoing ? `-${amount}` : `+${amount}`;
      }

      return {
        id: tx.id,
        date: new Date(tx.created_at).toISOString().slice(0, 10),
        usd: `$${parseFloat(usdValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        crypto: `${amount} ${currency}`,
        status: tx.status as TxStatus,
        category: categoryMap[tx.type] as TxCategory || 'DEPOSIT',
        effect: effectAmount,
      };
    });

    return {
      rows,
      total,
    };
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return {
      rows: [],
      total: 0,
    };
  }
};
