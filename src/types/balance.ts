/**
 * Wallet / balance types — mirror the backend's payment module DTOs.
 *
 * Amounts are exact decimal STRINGS, never JavaScript numbers. The backend
 * refuses to put money through an IEEE-754 double, and the frontend keeps
 * that discipline through display. Number() is only ever the LAST step
 * before rendering, and the result is thrown away.
 *
 * The old single-currency Balance shape (real_amount + bonus_amount +
 * one `currency` field) is gone — players hold BTC AND ETH AND USDT
 * separately in real life, and one row per user was the wrong shape.
 */

export type WalletType = 'REAL' | 'BONUS';

/**
 * Which fiat the UI is currently converting crypto amounts to. Mirrors
 * `SUPPORTED_DISPLAY_FIAT` on the backend — every code here must have a
 * matching entry there for its rate to be fetched. Adding a fiat = add
 * it to both.
 */
export type DisplayFiat =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'JPY'
  | 'AUD'
  | 'CAD'
  | 'CHF'
  | 'CNY'
  | 'INR'
  | 'BRL'
  | 'MXN'
  | 'ARS'
  | 'NGN'
  | 'ZAR'
  | 'TRY'
  | 'RUB'
  | 'AED'
  | 'SAR'
  | 'KRW'
  | 'IDR'
  | 'VND'
  | 'THB'
  | 'PHP'
  | 'PLN';

/** USD-native unified balance. Mirrors WalletBalanceDto in rolluck-backend/wallet.service.ts. */
export interface WalletBalance {
  /** Active currency (display currency) */
  currency: string;
  /** Real balance in USD stored in DB */
  real_amount: string;
  bonus_amount: string;
  locked_amount: string;
  total_amount: string;

  /** Snapshot rate used to convert USD → display currency for player UI */
  snapshot_rate: string;
  /** USD held back by deposit rollover requirements still outstanding. */
  rollover_locked: string;
  /** The most that may be withdrawn now, USD: real_amount less rollover_locked. */
  withdrawable_amount: string;
  /** Player sees this: real_amount_usd × snapshot_rate */
  display_amount: string;
  display_currency: string;
}

export interface WalletPreference {
  active_currency: string;
  active_wallet_type: WalletType;
  show_in_fiat: boolean;
  hide_zero_balances: boolean;
}

export interface WalletSummary {
  preferences: WalletPreference;
  /** Single balance row, always in USD stored in DB but displayed in active_currency */
  balance: WalletBalance | null;
  /** Snapshot rates for all currencies user has held */
  snapshot_rates: Record<string, string>;
  /**
   * Whether the player must clear KYC before a withdrawal is accepted. Absent
   * on older responses, so call sites treat `undefined` as "required" rather
   * than letting a missing flag wave a withdrawal through.
   */
  kyc_mandatory_for_withdrawal?: boolean;
  /** Configurable 1–4. Absent on older responses; callers fall back to 2. */
  kyc_withdrawal_min_level?: number;
  has_deposited?: boolean;
}

/* ── Currency catalogue (deposit / withdraw pickers) ─────────────── */

/**
 * One row in a currency's network picker.
 *
 * Post-normalisation the per-chain economics (min_deposit, min_withdrawal,
 * deposit/withdrawal fee) live HERE on the join row rather than on the
 * parent currency — USDT-on-Tron and USDT-on-Ethereum have wildly different
 * fees, and folding them into a single number on the currency hides that.
 *
 * `id` is the blockchain_currencies row id — admin's PATCH network endpoint
 * targets this. `code` and `name` come from the parent blockchain_networks
 * chain ("ETHEREUM"/"Ethereum", "TRON"/"Tron", "BSC"/"BNB Smart Chain").
 */
export interface CurrencyNetwork {
  id: string;
  code: string;
  name: string;
  provider: string;
  provider_code: string;
  deposit_confirmations: number;
  min_deposit: string;
  min_withdrawal: string;
  deposit_fee_percent: string;
  withdrawal_fee_percent: string;
  is_enabled: boolean;
}

/**
 * Currency summary as returned by GET /payments/currencies.
 *
 * The `min_deposit` / `min_withdrawal` / fee fields on this object are the
 * LOWEST value across the currency's chains — a "smallest amount that will
 * get through" number for the modal's currency card. Per-chain values live
 * on each `CurrencyNetwork` entry and take over once the user picks one.
 */
export interface Currency {
  id: string;
  code: string;
  name: string;
  category: 'CRYPTO' | 'FIAT';
  precision: number;
  min_deposit: string;
  min_withdrawal: string;
  deposit_fee_percent: string;
  withdrawal_fee_percent: string;
  icon_url: string | null;
  is_deposit_enabled: boolean;
  is_withdrawal_enabled: boolean;
  networks: CurrencyNetwork[];
}

/* ── Deposit ────────────────────────────────────────────────────── */

export interface DepositAddress {
  currency_code: string;
  currency_name: string;
  network_code: string;
  network_name: string;
  address: string;
  tag: string | null;
  provider: string;
  qr_payload: string;
  min_deposit: string;
  deposit_confirmations: number;
  is_new: boolean;
  // D24 response can have nested data structure
  data?: {
    address: string;
  };
}

export interface DepositHistoryItem {
  id: string;
  currency_code: string;
  network_code: string;
  amount: string;
  amount_usd: string;
  status: string;
  tx_hash: string | null;
  confirmations: number;
  created_at: string;
  confirmed_at: string | null;
}

/* ── Withdrawal ─────────────────────────────────────────────────── */

export interface WithdrawalApprovalRow {
  stage: 'RISK' | 'FINAL';
  action: 'APPROVED' | 'REJECTED';
  actor_id: string;
  actor_role: string;
  reason: string | null;
  created_at: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  currency_code: string;
  network_code: string;
  amount: string;
  fee: string;
  status: string;
  provider: string;
  to_address: string;
  tx_hash: string | null;
  internal_ref: string;
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
  approvals: WithdrawalApprovalRow[];
}

/* ── Exchange rate ──────────────────────────────────────────────── */

export interface ExchangeRate {
  from: string;
  to: string;
  rate: string;
  source: string;
  fetched_at: string;
}

/* ── Paged responses ────────────────────────────────────────────── */

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paged<T> {
  data: T[];
  pagination: Pagination;
}

/**
 * Old single-currency Balance shape kept as an alias for anywhere the
 * type is still referenced. The old endpoints (/balance/me,
 * /balance/switch-wallet) are gone; anything reading this type needs
 * porting to WalletSummary — but leaving the alias means removing it
 * one call site at a time rather than in a single big change.
 * @deprecated Use `WalletSummary` and read from useWallet() instead.
 */
export type Balance = {
  currency: string;
  real_amount: string;
  bonus_amount: string;
  total_amount: string;
  active_wallet: WalletType;
  active_amount: string;
};
