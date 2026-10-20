import apiService from './api';
import type {
  Currency,
  DepositAddress,
  DepositHistoryItem,
  DisplayFiat,
  ExchangeRate,
  Paged,
  WalletPreference,
  WalletSummary,
  Withdrawal,
} from '@/types';

/**
 * Single import point for every /api/wallet/* call the player app makes.
 *
 * Kept as a module of thin functions rather than a class so tree-shaking
 * takes care of anything unused. Nothing here does its own state
 * management — that lives in WalletContext.
 */

/* ── Reads ──────────────────────────────────────────────────────── */

/**
 * The full wallet-modal payload: preferences + all balances + totals.
 * The context calls this on mount and on a poll interval.
 */
export const getWalletSummary = () => apiService.get<WalletSummary>('/wallet/summary');

export const getWalletPreferences = () => apiService.get<WalletPreference>('/wallet/preferences');

/** Cached crypto → fiat rates. `fiat` defaults to USD on the server. */
export const getRates = (fiat: DisplayFiat = 'USD') =>
  apiService.get<ExchangeRate[]>('/wallet/rates', { fiat });

/**
 * The fiats the operator has enabled for the "Display in local currency"
 * picker. Fetched by the wallet context on session start and cached — the
 * list is stable across the session (an operator disabling a fiat while a
 * player is logged in surfaces on the next reload, not mid-session).
 */
export interface DisplayCurrencyOption {
  code: DisplayFiat;
  name: string;
  symbol: string;
  is_enabled: boolean;
  sort_order: number;
  country_code: string;
  language: string;
  min_deposit: string;
  max_deposit: string;
  min_withdrawal: string;
  max_withdrawal: string;
  color?: string | null;
}

export const getDisplayCurrencies = () =>
  apiService.get<DisplayCurrencyOption[]>('/wallet/display-currencies');

export const getD24PaymentMethods = (country: string) =>
  apiService.get<any[]>('/wallet/deposit/d24/payment-methods', { country });

/** Every currency the platform accepts, each with its enabled networks. */
export const getCurrencies = () => apiService.get<Currency[]>('/wallet/currencies');

export const getCurrency = (code: string) =>
  apiService.get<Currency>(`/wallet/currencies/${encodeURIComponent(code)}`);

/** Get available D24 fiat currencies */
export const getD24Currencies = () =>
  apiService.get<any[]>('/wallet/currencies/d24');

/* ── Preferences ────────────────────────────────────────────────── */

/**
 * Every field optional — the payload sent by the client is whichever
 * subset actually changed. See patchWalletPreferencesSchema on the
 * backend for the exact rules.
 */
export interface UpdatePreferencesInput {
  active_currency?: string;
  active_wallet_type?: 'REAL' | 'BONUS';
  show_in_fiat?: boolean;
  hide_zero_balances?: boolean;
}

export const updatePreferences = (patch: UpdatePreferencesInput) =>
  apiService.patch<WalletPreference>('/wallet/preferences', patch);

/* ── Deposit ────────────────────────────────────────────────────── */

/**
 * Get (or lazily create) the caller's permanent deposit address for the
 * given currency + network. Response includes the QR payload the client
 * renders straight into a code.
 */
/**
 * `headers` carries the fraud step-up token and code on a retry. Empty on the
 * first attempt — see SeonGuardContext, which supplies it.
 */
export const getDepositAddress = (
  input: { currency: string; network: string },
  headers: Record<string, string> = {}
) => apiService.post<DepositAddress>('/wallet/deposit/address', input, { headers });

/**
 * Create a D24 fiat deposit. Returns a DepositAddress with the D24 checkout URL.
 * D24 handles currency/payment method selection on their hosted page.
 */
export const createD24Deposit = (
  input: { amount: string; currency: string; payment_method?: string },
  headers: Record<string, string> = {}
) => apiService.post<DepositAddress>('/wallet/deposit/d24', input, { headers });

export const getDepositHistory = (page = 1, limit = 10) =>
  apiService.get<Paged<DepositHistoryItem>>('/wallet/deposit/history', { page, limit });

/* ── Withdrawal ─────────────────────────────────────────────────── */

export interface RequestWithdrawalInput {
  currency: string;
  network: string;
  amount: string;
  to_address: string;
  tag?: string;
  display_currency_amount?: string;
  /** Required once the player has set a transaction PIN. */
  transaction_pin?: string;
}

/**
 * Submit a withdrawal. On success the funds have already moved from
 * `real` to `locked` on the balance row, and the returned Withdrawal
 * is in status WITHDRAW_PENDING_RISK.
 */
export const requestWithdrawal = (
  input: RequestWithdrawalInput,
  /** Step-up token and code on a retry; empty on the first attempt. */
  headers: Record<string, string> = {}
) => apiService.post<Withdrawal>('/wallet/withdrawal/request', input, { headers });

export const getWithdrawalHistory = (page = 1, limit = 10) =>
  apiService.get<Paged<Withdrawal>>('/wallet/withdrawal/history', { page, limit });
