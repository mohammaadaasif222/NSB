import api from '@/services/api';
import type { TranslationKey } from '@/i18n/locales';

/** Currency symbols for display */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'Fr',
  CNY: '¥',
  INR: '₹',
  BRL: 'R$',
  MXN: '$',
  ARS: '$',
  NGN: '₦',
  ZAR: 'R',
  TRY: '₺',
  RUB: '₽',
  AED: 'د.إ',
  SAR: '﷼',
  KRW: '₩',
  IDR: 'Rp',
  VND: '₫',
  THB: '฿',
  PHP: '₱',
  PLN: 'zł',
};

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
  | 'WITHDRAW_FAILED'
  | 'BET_PLACED'
  | 'BET_WON'
  | 'BET_LOST'
  | 'TIP_SENT'
  | 'TIP_RECEIVED';

export type TxCategory = 'DEPOSIT' | 'WITHDRAWAL' | 'REWARD' | 'BET' | 'TIP';

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
  // Raw data for re-conversion based on user's current display currency
  /** Amount in USD (for real-time conversion) */
  amount_usd?: number;
  /** Frozen rate display to USD (for real-time conversion) */
  frozen_rate_display_usd?: number;
  /** Transaction type for determining effect calculation */
  tx_type?: string;
  /** Actual amount in session currency */
  tx_amount?: string;
  /** Blockchain transaction hash for explorer links */
  tx_hash?: string | null;
  /** Payment provider (D24, COINSPAID, CRYPTOMUS, INTERNAL, etc.) */
  provider?: string | null;
  /** Network code (FIAT, BTC, ETH, BEP20, TRC20, etc.) */
  network_code?: string | null;
}

/** The filter chips, in the order the design lists them. */
export const TX_FILTERS = [
  { key: 'all', labelKey: 'tx.all' },
  { key: 'deposit', labelKey: 'tx.deposits' },
  { key: 'withdrawal', labelKey: 'tx.withdrawals' },
  { key: 'reward', labelKey: 'tx.rewards' },
  { key: 'bet', labelKey: 'tx.bets' },
  { key: 'tip', labelKey: 'tx.tips' },
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
  BET_PLACED: 'tx.betPlaced',
  BET_WON: 'tx.betWon',
  BET_LOST: 'tx.betLost',
  TIP_SENT: 'tx.tipSent',
  TIP_RECEIVED: 'tx.tipReceived',
};

export const CATEGORY_LABEL: Record<TxCategory, TranslationKey> = {
  DEPOSIT: 'tx.deposits',
  WITHDRAWAL: 'tx.withdrawals',
  REWARD: 'tx.rewards',
  BET: 'tx.bets',
  TIP: 'tx.tips',
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
  totalPages: number;
}

/**
 * Fetches transactions from the API endpoint: GET /wallet/transactions
 * Transforms the API response to match the Transaction interface.
 */
export const queryTransactions = async ({ query, filter, page, pageSize }: TxQuery): Promise<TxPage> => {
  try {
    // Build query string manually to avoid nested params issue
    const queryParts: string[] = [];

    queryParts.push(`page=${page}`);
    queryParts.push(`limit=${pageSize}`);

    if (filter !== 'all') {
      queryParts.push(`type=${filter}`);
    }

    if (query.trim()) {
      queryParts.push(`search=${encodeURIComponent(query.trim())}`);
    }

    const queryString = queryParts.join('&');
    const response = await api.get(`/wallet/transactions?${queryString}`) as any;

    const apiData = response.data?.data || response.data;
    const transactions = apiData.transactions || [];
    const total = apiData.pagination?.total || 0;

    // Transform API response to UI Transaction format
    const rows = transactions.map((tx: any) => {
      const isOutgoing = tx.type === 'WITHDRAWAL' || tx.status === 'TIP_SENT';
      const categoryMap: Record<string, TxCategory> = {
        DEPOSIT: 'DEPOSIT',
        WITHDRAWAL: 'WITHDRAWAL',
        REWARD: 'REWARD',
        BET: 'BET',
        WIN: 'BET', // WIN transactions show under BET category
        TIP: 'TIP',
      };

      const cryptoAmount = tx.amount || '0';
      const currency = tx.currency_code || 'BTC';
      const usdValue = parseFloat(tx.amount_usd || '0');
      const displayCurrency = tx.display_currency || 'USD';
      const currencySymbol = CURRENCY_SYMBOLS[displayCurrency] || displayCurrency;

      // Convert USD to user's display currency using frozen rate
      let displayValue = usdValue;
      if (tx.frozen_rate_display_usd && displayCurrency !== 'USD') {
        const frozenRate = parseFloat(tx.frozen_rate_display_usd);
        displayValue = usdValue / frozenRate; // USD to display currency
      }

      const formattedDisplayValue = displayValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      // Determine wallet effect based on transaction type and status
      let effectAmount: string;
      let effectSign = '';
      let effectValue = formattedDisplayValue;

      if (tx.status === 'WITHDRAW_REJECTED' || tx.status === 'WITHDRAW_FAILED' || tx.status === 'DEPOSIT_FAILED') {
        // Rejected/failed transactions show 0 effect
        effectAmount = '0';
      } else if (tx.status === 'TIP_SENT') {
        // Tips sent show as debit (negative) in display currency
        effectSign = '-';
        effectAmount = `${effectSign}${currencySymbol}${effectValue}`;
      } else if (tx.status === 'TIP_RECEIVED') {
        // Tips received show as credit (positive) in display currency
        effectSign = '+';
        effectAmount = `${effectSign}${currencySymbol}${effectValue}`;
      } else if (tx.status === 'DEPOSIT_CONFIRMED' || tx.status === 'BET_WON') {
        // Deposits and wins show positive display currency value
        effectSign = '+';
        effectAmount = `${effectSign}${currencySymbol}${effectValue}`;
      } else if (tx.type === 'BET' && tx.status === 'BET_PLACED') {
        // Bet placed shows as debit (negative) in display currency
        effectSign = '-';
        effectAmount = `${effectSign}${currencySymbol}${effectValue}`;
      } else if (tx.type === 'BET' && tx.status === 'BET_LOST') {
        // Lost bet shows 0 effect (already deducted during bet placement)
        effectAmount = '0';
      } else if (tx.type === 'WITHDRAWAL') {
        // Approved/processing withdrawals show as negative
        effectSign = '-';
        effectAmount = `${effectSign}${currencySymbol}${effectValue}`;
      } else {
        // Other transactions
        effectSign = isOutgoing ? '-' : '+';
        effectAmount = `${effectSign}${currencySymbol}${effectValue}`;
      }

      return {
        id: tx.id,
        date: new Date(tx.created_at).toISOString().slice(0, 10),
        usd: `${currencySymbol}${formattedDisplayValue}`, // Show in user's display currency
        crypto: tx.type === 'TIP'
          ? (tx.status === 'TIP_SENT' ? tx.to_address : tx.from_address) || 'Unknown'
          : `${cryptoAmount} ${currency}`,
        status: tx.status as TxStatus,
        category: categoryMap[tx.type] as TxCategory || 'DEPOSIT',
        effect: effectAmount,
        // Raw data for re-conversion in component
        amount_usd: usdValue,
        frozen_rate_display_usd: tx.frozen_rate_display_usd ? parseFloat(tx.frozen_rate_display_usd) : undefined,
        tx_type: tx.type,
        tx_amount: cryptoAmount,
        tx_hash: tx.tx_hash || null,
        provider: tx.provider || null,
        network_code: tx.network_code || null,
      };
    });

    return {
      rows,
      total,
      totalPages: apiData.pagination?.total_pages || Math.ceil(total / pageSize),
    };
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return {
      rows: [],
      total: 0,
      totalPages: 0,
    };
  }
};
