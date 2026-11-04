/**
 * Returns the player's active display currency and its symbol, both sourced
 * from the backend's `/wallet/display-currencies` list (NOT a hardcoded map).
 *
 * - `code`   = `summary.preferences.active_currency` (what the player picked)
 * - `symbol` = the matching entry's `symbol` field from `displayCurrencies`
 *
 * Both come from WalletContext, so the moment the player switches currency
 * (DisplayCurrencyPicker, BalanceMenu, …) every subscriber re-renders with
 * the new symbol automatically.
 *
 * Fallback to `$` + `USD` only if the wallet summary hasn't loaded yet.
 */
import { useMemo } from 'react';
import { useWallet } from '@/context/WalletContext';

export const useActiveCurrencySymbol = (): { code: string; symbol: string } => {
  const { summary, displayCurrencies } = useWallet();

  return useMemo(() => {
    const code = summary?.preferences?.active_currency ?? 'USD';
    const match = displayCurrencies.find((c) => c.code === code);
    return { code, symbol: match?.symbol ?? '$' };
  }, [summary?.preferences?.active_currency, displayCurrencies]);
};
