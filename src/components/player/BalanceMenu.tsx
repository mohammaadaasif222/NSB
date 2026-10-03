import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useCurrencyConversion } from '@/context/CurrencyConversionContext';
import { CoinIcon } from '@/components/icons';
import { BALANCE_REFRESH_EVENT } from '@/utils/balanceEvents';
import type { DisplayFiat, WalletBalance } from '@/types';

/**
 * Fallback symbols for fiats that arrive without a symbol from the
 * backend for some reason (older cached row, misconfiguration). The
 * runtime source of truth is the `displayCurrencies` list on
 * WalletContext, which each row carries its own symbol on.
 */
const FALLBACK_FIAT_SYMBOL: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  INR: '₹',
  NGN: '₦',
  KRW: '₩',
};

/**
 * Format a fiat conversion for the chip / row.
 *
 * The amount arrives as a decimal string precisely so nothing arithmetics
 * on it. Number() is the LAST step before render and its result is thrown
 * away — no drift can leak elsewhere.
 *
 * The symbol is looked up in the caller's runtime map (from the wallet
 * context's displayCurrencies) with a small hard-coded fallback for
 * common codes when the runtime value is missing.
 */
export const formatFiat = (
  amount: string,
  code: DisplayFiat,
  symbolMap: Record<string, string>
): string => {
  const symbol = symbolMap[code] ?? FALLBACK_FIAT_SYMBOL[code] ?? '';
  const n = Number(amount);
  return `${symbol}${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format the native crypto amount. Trim trailing zeros so BTC balances
 * don't read as "0.00050000 BTC" when "0.0005 BTC" is clearer.
 */
const formatCrypto = (amount: string, code: string, precision = 8): string => {
  const n = Number(amount);
  const s = n.toFixed(precision).replace(/\.?0+$/, '');
  return `${s} ${code}`;
};

interface CurrencyRowProps {
  balance: WalletBalance;
  selected: boolean;
  displayCurrency: DisplayFiat;
  fiatSymbolMap: Record<string, string>;
  onSelect: () => void;
}

/**
 * One row in the currency picker.
 *
 * Shows the fiat value prominently — that's what a player thinks in
 * ("how much is this worth?") — with the native crypto amount as a
 * subtitle for anyone who cares about the exact coin count. When no
 * rate is cached for this currency we fall back to just the crypto
 * amount rather than showing a misleading zero.
 */
export const CurrencyRow: FC<CurrencyRowProps> = ({
  balance,
  selected,
  displayCurrency: _displayCurrency,
  fiatSymbolMap: _fiatSymbolMap,
  onSelect,
}) => {
  const { formatCurrencyDisplay } = useCurrencyConversion();

  // Use total_amount (USD) for conversion, not display_amount (already in display currency)
  const fiatLabel = formatCurrencyDisplay(balance.total_amount);
  const cryptoLabel = formatCrypto(balance.real_amount, balance.currency, 8);

  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      onClick={onSelect}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left rounded-lg transition-colors ${
        selected ? 'bg-white/10' : 'hover:bg-white/5'
      }`}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: currencyDotColour(balance.currency) }}
        aria-hidden="true"
      />
      <span className="flex-1 min-w-0 flex items-center justify-between gap-2">
        <span className="truncate text-sm font-semibold tabular-nums text-white">
          {balance.currency}
        </span>
        <span className="flex flex-col items-end leading-tight tabular-nums flex-shrink-0">
          <span className="text-sm font-semibold text-white">{fiatLabel}</span>
          <span className="text-[11px] text-white/45">{cryptoLabel}</span>
        </span>
      </span>
    </button>
  );
};

/** Deterministic colour dot per currency so the list scans quickly. */
const currencyDotColour = (code: string): string => {
  const palette = [
    '#f7931a', // BTC orange
    '#627eea', // ETH blue
    '#26a17b', // USDT green
    '#2775ca', // USDC blue
    '#9945ff', // SOL purple
    '#345d9d', // LTC grey-blue
    '#23292f', // XRP dark
    '#f0b90b', // BNB yellow
  ];
  // A tiny hash on the code so the palette wraps but stays stable.
  let acc = 0;
  for (let i = 0; i < code.length; i++) acc = (acc + code.charCodeAt(i)) % palette.length;
  return palette[acc];
};

/**
 * Header chip + currency dropdown.
 *
 * The chip shows the ACTIVE currency's balance in whichever unit the
 * display toggle is set to (fiat by default, crypto if toggled). The
 * dropdown lists every currency the player holds, plus a "Display in
 * local currency" toggle at the bottom.
 *
 * Rendered only when signed in — the parent gates on the token.
 */
interface Props {
  onOpenWallet?: () => void;
}

const BalanceMenu: FC<Props> = ({ onOpenWallet }) => {
  const { summary, displayCurrencies, loading, refresh } = useWallet();
  const { formatCurrencyDisplay } = useCurrencyConversion();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /**
   * Game play moves the balance server-side — an aggregator debits the bet
   * and credits the win over its own API — so nothing on this page knows it
   * changed. The play page asks for a re-read when it has reason to think it
   * did (a round ending, leaving a game).
   */
  useEffect(() => {
    const onBalanceRefresh = (): void => {
      void refresh();
    };
    window.addEventListener(BALANCE_REFRESH_EVENT, onBalanceRefresh);
    return () => window.removeEventListener(BALANCE_REFRESH_EVENT, onBalanceRefresh);
  }, [refresh]);

  useEffect(() => {
    const handler = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const preferences = summary?.preferences;
  const balance = summary?.balance;
  const displayCurrency = (preferences?.active_currency ?? 'USD') as DisplayFiat;

  /**
   * Runtime code → symbol map, built from the operator-controlled list.
   * `formatFiat` reads from this so a fiat added on the admin console
   * shows the right symbol without a redeploy.
   */
  // @ts-expect-error -- kept for CurrencyRow, which is not rendered yet
  const fiatSymbolMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const row of displayCurrencies) map[row.code] = row.symbol;
    return map;
  }, [displayCurrencies]);

  /**
   * The label shown on the header chip.
   * Shows the total balance (real + bonus) in the active currency (fiat).
   * Uses CurrencyConversionContext for consistent formatting.
   */
  const chipLabel = useMemo(() => {
    if (loading && !balance) return '—';
    if (!balance) {
      // No balance yet. Show 0 in the display currency.
      return formatCurrencyDisplay('0');
    }
    // Use total_amount (USD) for conversion, not display_amount (already in display currency)
    return formatCurrencyDisplay(balance.total_amount);
  }, [balance, loading, formatCurrencyDisplay]);

  /**
   * Real balance only (excluding bonus).
   * Shows only the real balance converted to display currency.
   */
  const realBalanceLabel = useMemo(() => {
    if (loading && !balance) return '—';
    if (!balance) {
      return formatCurrencyDisplay('0');
    }
    // Use real_amount (USD) - only the real balance, not including bonus
    return formatCurrencyDisplay(balance.real_amount);
  }, [balance, loading, formatCurrencyDisplay]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Wallet balance"
        className="rl-glass rl-glass-hover flex h-[38px] items-center gap-2 rounded-full pl-1.5 pr-3"
      >
        <span
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#fcd535]/15 text-[#fcd535]"
          aria-hidden="true"
        >
          <CoinIcon size={15} />
        </span>
        <span className="whitespace-nowrap text-[12.5px] font-semibold tabular-nums text-white">
          {chipLabel}
        </span>
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className={`text-white/45 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && summary && (
        <div
          role="menu"
          className="rl-menu absolute right-0 top-11 z-40 w-64 overflow-hidden rounded-2xl p-4"
        >
          {/* Real Balance Card */}
          <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-950/20 px-3 py-2.5 mb-2">
            <p className="text-[8px] font-semibold text-white/50 mb-1">Real Balance</p>
            <p className="text-sm font-bold text-white">
              {realBalanceLabel}
            </p>
          </div>

          {/* Bonus Balance Card */}
          <div className="rounded-2xl border-2 border-gray-500/30 bg-gray-950/20 px-3 py-2.5 mb-3">
            <p className="text-[8px] font-semibold text-white/50 mb-1">Bonus Balance</p>
            <p className="text-sm font-bold text-white">
              {balance?.bonus_amount ? formatCurrencyDisplay(balance.bonus_amount) : formatCurrencyDisplay('0')}
            </p>
          </div>

          {/* Display Currency Info */}
          <div className="flex items-center justify-center gap-2 px-1 py-2 mb-3">
            <span className="text-xs font-medium text-white/70">
              Displaying currency in <span className="font-semibold text-white">{displayCurrency}</span>
            </span>
          </div>

          {onOpenWallet && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenWallet();
              }}
              className="rl-btn-gold h-10 w-full rounded-lg text-sm font-semibold transition-all hover:opacity-90"
            >
              Wallet Settings
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BalanceMenu;
