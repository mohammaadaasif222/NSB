import { useEffect, useMemo, useState, type FC } from 'react';
import { toast } from 'react-toastify';

import { useWallet } from '@/context/WalletContext';
import { useCurrencyConversion } from '@/context/CurrencyConversionContext';
import { requestWithdrawal, getRates } from '@/services/wallet';
import type { Currency, WalletBalance, ExchangeRate } from '@/types';
import CurrencyPicker from '../shared/CurrencyPicker';
import NetworkPicker from '../shared/NetworkPicker';

/**
 * Withdraw tab with USD-native model.
 *
 * Shows balance in user's active display currency.
 * Two input fields with live-rate conversion:
 * - Left: Active currency amount (e.g., EUR)
 * - Right: Crypto amount (e.g., BNB)
 *
 * When user enters amount in one field, the other auto-updates using live exchange rates.
 * Both amounts sent to backend for storage and audit trail.
 */
const WithdrawTab: FC = () => {
  const { summary, currencies, refresh, rates: _rates } = useWallet();
  const { convertToDisplayCurrency } = useCurrencyConversion();

  const displayCurrency = summary?.preferences.active_currency ?? 'USD';

  const eligible = useMemo(
    () =>
      currencies.filter(
        (c) => c.category === 'CRYPTO' && c.is_withdrawal_enabled && c.networks.length > 0,
      ),
    [currencies],
  );

  const [currency, setCurrency] = useState<string>(() => {
    const active = summary?.preferences.active_currency;
    if (active && eligible.some((c) => c.code === active)) return active;
    return eligible[0]?.code ?? '';
  });

  const currencyRow: Currency | undefined = useMemo(
    () => eligible.find((c) => c.code === currency),
    [eligible, currency],
  );

  const enabledNetworks = useMemo(
    () => currencyRow?.networks.filter((n) => n.is_enabled) ?? [],
    [currencyRow],
  );

  const [network, setNetwork] = useState<string>(() => {
    return enabledNetworks[0]?.code ?? '';
  });

  useEffect(() => {
    if (!enabledNetworks.length) {
      setNetwork('');
      return;
    }
    if (!enabledNetworks.some((n) => n.code === network)) {
      setNetwork(enabledNetworks[0].code);
    }
  }, [enabledNetworks, network]);

  /* ── Balance (USD-native unified model) ─────────────────────────── */

  const balanceRow: WalletBalance | null = useMemo(() => {
    if (!summary) return null;
    return summary.balance ?? null;
  }, [summary]);

  // Available balance in USD (only REAL balance, excluding bonus)
  const availableUSD = balanceRow?.real_amount ?? '0';

  // Available balance in display currency
  const availableDisplay = useMemo(() => {
    if (!balanceRow) return '0';
    const converted = convertToDisplayCurrency(availableUSD, 'USD');
    return converted.displayAmount;
  }, [balanceRow, availableUSD, convertToDisplayCurrency]);

  /* ── Form state with two-way conversion ────────────────────────── */

  const [toAddress, setToAddress] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [_lastEditedField, setLastEditedField] = useState<'display' | 'crypto'>('crypto');
  const [fetchedRates, setFetchedRates] = useState<ExchangeRate[]>([]);
  const [ratesLoading, setRatesLoading] = useState(false);

  // Fetch rates directly from backend when displayCurrency changes
  useEffect(() => {
    const fetchRates = async () => {
      setRatesLoading(true);
      try {
        const response = await getRates(displayCurrency as any);
        console.log(`[WithdrawTab] Fetched rates for ${displayCurrency}:`, response?.data);
        if (response?.data) {
          setFetchedRates(response.data);
        }
      } catch (err) {
        console.error('[WithdrawTab] Failed to fetch rates:', err);
      } finally {
        setRatesLoading(false);
      }
    };

    fetchRates();
  }, [displayCurrency]);

  // Get live rate for the current currency from fetched rates
  const liveExchangeRate = useMemo(() => {
    const rate = fetchedRates.find((r) => r.from === currency && r.to === displayCurrency);
    if (!rate) {
      if (fetchedRates.length === 0) {
        console.warn(`[WithdrawTab] No rates fetched yet for ${displayCurrency}`);
      } else {
        console.warn(
          `[WithdrawTab] Rate not found for ${currency}→${displayCurrency}. Looking for: from="${currency}" to="${displayCurrency}". Available (first 10):`,
          fetchedRates.map((r) => `${r.from}→${r.to}: ${r.rate}`).slice(0, 10)
        );
      }
    }
    return rate?.rate ?? null;
  }, [fetchedRates, currency, displayCurrency]);

  // Convert display amount to crypto amount
  const handleDisplayChange = (value: string) => {
    const cleanValue = value.replace(/[^\d.]/g, '');
    setDisplayAmount(cleanValue);
    setLastEditedField('display');

    if (!cleanValue) {
      setCryptoAmount('');
      return;
    }

    if (!liveExchangeRate) {
      console.warn(`[WithdrawTab] No live rate available for ${currency}→${displayCurrency}`);
      setCryptoAmount('');
      return;
    }

    const displayNum = Number(cleanValue);
    if (!isFinite(displayNum) || displayNum <= 0) {
      setCryptoAmount('');
      return;
    }

    // Formula: crypto_amount = display_amount ÷ live_rate
    // If 1 BNB = 350 EUR, then 700 EUR = 700 ÷ 350 = 2 BNB
    const cryptoNum = displayNum / Number(liveExchangeRate);
    const precision = currencyRow?.precision ?? 8;
    const formatted = cryptoNum.toFixed(precision).replace(/\.?0+$/, '');
    console.log(`[WithdrawTab] Convert: ${cleanValue} ${displayCurrency} ÷ ${liveExchangeRate} = ${formatted} ${currency}`);
    setCryptoAmount(formatted);
  };

  // Convert crypto amount to display amount
  const handleCryptoChange = (value: string) => {
    const cleanValue = value.replace(/[^\d.]/g, '');
    setCryptoAmount(cleanValue);
    setLastEditedField('crypto');

    if (!cleanValue) {
      setDisplayAmount('');
      return;
    }

    if (!liveExchangeRate) {
      console.warn(`[WithdrawTab] No live rate available for ${currency}→${displayCurrency}`);
      setDisplayAmount('');
      return;
    }

    const cryptoNum = Number(cleanValue);
    if (!isFinite(cryptoNum) || cryptoNum <= 0) {
      setDisplayAmount('');
      return;
    }

    // Formula: display_amount = crypto_amount × live_rate
    // If 1 BNB = 350 EUR, then 2 BNB = 2 × 350 = 700 EUR
    const displayNum = cryptoNum * Number(liveExchangeRate);
    const formatted = displayNum.toFixed(2).replace(/\.?0+$/, '');
    console.log(`[WithdrawTab] Convert: ${cleanValue} ${currency} × ${liveExchangeRate} = ${formatted} ${displayCurrency}`);
    setDisplayAmount(formatted);
  };

  const setPercent = (pct: 25 | 50 | 75 | 100): void => {
    const n = Number(availableUSD);
    if (!isFinite(n) || n <= 0) {
      setCryptoAmount('0');
      setDisplayAmount('0');
      return;
    }

    // Calculate percentage of available USD
    const percentUSD = (n * pct) / 100;

    // Convert to display currency
    const converted = convertToDisplayCurrency(percentUSD.toFixed(2), 'USD');
    const displayNum = Number(converted.displayAmount);

    // Update display amount
    setDisplayAmount(displayNum.toFixed(2).replace(/\.?0+$/, ''));
    setLastEditedField('display');

    // Auto-convert to crypto
    if (liveExchangeRate && !ratesLoading) {
      const cryptoNum = displayNum / Number(liveExchangeRate);
      const precision = currencyRow?.precision ?? 8;
      setCryptoAmount(cryptoNum.toFixed(precision).replace(/\.?0+$/, ''));
    }
  };

  // Min withdrawal is per-chain
  const selectedNetwork = enabledNetworks.find((n) => n.code === network);
  const minWithdrawal =
    selectedNetwork?.min_withdrawal ?? currencyRow?.min_withdrawal ?? '0';
  const belowMin = Number(cryptoAmount || 0) < Number(minWithdrawal);
  const overBalance = Number(availableUSD) > 0 && Number(cryptoAmount || 0) * Number(liveExchangeRate || 0) > Number(availableUSD);
  const canSubmit =
    !!currency && !!network && !!toAddress.trim() && !!cryptoAmount &&
    !belowMin && !overBalance && !submitting && liveExchangeRate && !ratesLoading;

  const submit = async (): Promise<void> => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await requestWithdrawal({
        currency,
        network,
        amount: cryptoAmount,
        to_address: toAddress.trim(),
        display_currency_amount: displayAmount, // Send display currency amount too
      });
      if (res?.success && res.data) {
        setToAddress('');
        setCryptoAmount('');
        setDisplayAmount('');
        void refresh();
      } else {
        toast.error(res?.message || 'Withdrawal failed');
      }
    } catch (err) {
      const message =
        typeof err === 'object' && err && 'message' in err
          ? String((err as { message: string }).message)
          : 'Withdrawal failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (eligible.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-400">
        No currencies available for withdrawal yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-slate-400">
        Withdraw to any crypto wallet · Available to withdraw:{' '}
        <span className="text-slate-200 font-semibold">
          {availableDisplay} {displayCurrency}
        </span>
      </p>

      <CurrencyPicker
        label="Currency"
        currencies={eligible}
        value={currency}
        onChange={setCurrency}
      />

      {enabledNetworks.length > 0 ? (
        <NetworkPicker
          label="Network"
          networks={enabledNetworks}
          value={network}
          onChange={setNetwork}
        />
      ) : (
        <div className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-[11px] text-slate-500">
          No enabled network for {currency}.
        </div>
      )}

      <div>
        <label className="block text-[11px] text-slate-400 mb-1">
          {currency} Address
        </label>
        <input
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          placeholder="Enter Address"
          className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
        />
      </div>

      {/* Two-input amount conversion system */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] text-slate-400">Amount</label>
          <div className="flex gap-3 items-center text-[11px]">
            <span className="text-slate-500">
              Balance: {availableDisplay} {displayCurrency}
            </span>
            <span className="text-slate-600">
              Min: {minWithdrawal} {currency}
            </span>
          </div>
        </div>

        {/* Display Currency Amount (Left Input) */}
        <div>
          <label className="block text-[10px] text-slate-500 mb-1">
            {displayCurrency} Amount
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={displayAmount}
            onChange={(e) => handleDisplayChange(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder={`Enter ${displayCurrency} amount`}
            className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 tabular-nums"
          />
        </div>

        {/* Exchange Rate Info */}
        <div className="text-[10px] text-slate-500 text-center py-1">
          {ratesLoading ? (
            <span className="text-amber-500">⚠️ Loading rates...</span>
          ) : liveExchangeRate ? (
            <>
              1 {currency} = {Number(liveExchangeRate).toFixed(6)} {displayCurrency}
            </>
          ) : (
            <span className="text-amber-500">⚠️ Rate not available</span>
          )}
        </div>

        {/* Crypto Amount (Right Input) */}
        <div>
          <label className="block text-[10px] text-slate-500 mb-1">
            {currency} Amount
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={cryptoAmount}
            onChange={(e) => handleCryptoChange(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder={`Enter ${currency} amount`}
            className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 tabular-nums"
          />
        </div>

        {/* Quick percentage buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[25, 50, 75, 100].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPercent(p as 25 | 50 | 75 | 100)}
              className="h-8 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-semibold hover:bg-slate-700 transition-colors"
            >
              {p === 100 ? 'Max' : `${p}%`}
            </button>
          ))}
        </div>

        {belowMin && cryptoAmount && (
          <p className="mt-1 text-[11px] text-amber-300">
            Minimum withdrawal is {minWithdrawal} {currency}
          </p>
        )}
        {overBalance && cryptoAmount && (
          <p className="mt-1 text-[11px] text-red-400">Insufficient balance</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => void submit()}
        disabled={!canSubmit}
        className="w-full h-11 rounded-xl bg-white text-black text-sm font-semibold disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
      >
        {submitting ? 'Submitting…' : 'Withdraw'}
      </button>

      <p className="text-center text-[11px] text-slate-400 pt-1">
        Need help with your Withdraw?
      </p>
    </div>
  );
};

export default WithdrawTab;
