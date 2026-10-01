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
  color?: string | null;
}

export const getDisplayCurrencies = () =>
  apiService.get<DisplayCurrencyOption[]>('/wallet/display-currencies');

/** Every currency the platform accepts, each with its enabled networks. */
export const getCurrencies = () => apiService.get<Currency[]>('/wallet/currencies');

export const getCurrency = (code: string) =>
  apiService.get<Currency>(`/wallet/currencies/${encodeURIComponent(code)}`);

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
export const getDepositAddress = (input: { currency: string; network: string }) =>
  apiService.post<DepositAddress>('/wallet/deposit/address', input);

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
}

/**
 * Submit a withdrawal. On success the funds have already moved from
 * `real` to `locked` on the balance row, and the returned Withdrawal
 * is in status WITHDRAW_PENDING_RISK.
 */
export const requestWithdrawal = (input: RequestWithdrawalInput) =>
  apiService.post<Withdrawal>('/wallet/withdrawal/request', input);

export const getWithdrawalHistory = (page = 1, limit = 10) =>
  apiService.get<Paged<Withdrawal>>('/wallet/withdrawal/history', { page, limit });
