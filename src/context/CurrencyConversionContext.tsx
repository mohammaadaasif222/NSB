import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type FC,
  type ReactNode,
} from 'react';

import { useWallet } from './WalletContext';

interface ConversionResult {
  /** Amount in user's display currency */
  displayAmount: string;
  /** Currency code */
  currency: string;
  /** Rate used for conversion (snapshot rate) */
  rate: string;
  /** Whether conversion was applied (false if amount already in display currency) */
  converted: boolean;
}

interface CurrencyConversionContextType {
  /**
   * Convert an amount from any currency to user's display currency.
   *
   * @param amount - Amount as string (from backend)
   * @param fromCurrency - Currency code the amount is in (e.g., "USD", "EUR")
   * @returns Converted amount in display currency with metadata
   *
   * Example:
   * - User's display currency: EUR
   * - Snapshot rates: { USD: "0.92", GBP: "0.85", ... }
   * - convertToDisplayCurrency("100", "USD")
   * - Returns: { displayAmount: "92", currency: "EUR", rate: "0.92", converted: true }
   */
  convertToDisplayCurrency: (
    amount: string,
    fromCurrency: string,
  ) => ConversionResult;

  /**
   * Format amount with currency symbol for display.
   * Uses converted amount and display currency symbol.
   *
   * Example: "₹ 2,450.50"
   */
  formatCurrencyDisplay: (amount: string) => string;

  /**
   * Get snapshot rate for a specific currency to USD.
   * Returns string for decimal precision.
   */
  getSnapshotRate: (currency: string) => string | null;

  /**
   * Batch convert multiple amounts at once.
   */
  convertMultiple: (
    items: Array<{ amount: string; currency: string }>
  ) => ConversionResult[];
}

const CurrencyConversionContext = createContext<
  CurrencyConversionContextType | undefined
>(undefined);

interface CurrencyConversionProviderProps {
  children: ReactNode;
}

/**
 * Provides currency conversion utilities using snapshot rates.
 *
 * Snapshot rates are frozen conversion rates stored when the user
 * switches to a display currency. This ensures consistent display
 * across all historical data (deposits, withdrawals, transactions).
 *
 * Example flow:
 * 1. Backend returns: { amountUSD: "100", originalCurrency: "BTC" }
 * 2. User's display currency: EUR
 * 3. Snapshot rates: { EUR: "0.92" } (1 EUR = 0.92 USD)
 * 4. Conversion: 100 USD ÷ 0.92 = 108.70 EUR
 * 5. UI displays: "€ 108.70"
 */
export const CurrencyConversionProvider: FC<CurrencyConversionProviderProps> = ({
  children,
}) => {
  const { summary } = useWallet();

  const displayCurrency = useMemo(
    () => summary?.preferences.active_currency ?? 'USD',
    [summary?.preferences.active_currency],
  );

  const snapshotRates = useMemo(
    () => summary?.snapshot_rates ?? {},
    [summary?.snapshot_rates],
  );

  const convertToDisplayCurrency = useCallback(
    (amount: string, fromCurrency: string): ConversionResult => {
      const cleanAmount = amount.trim();
      const cleanCurrency = fromCurrency.toUpperCase().trim();

      // If already in display currency, return as-is
      if (cleanCurrency === displayCurrency) {
        return {
          displayAmount: cleanAmount,
          currency: displayCurrency,
          rate: '1',
          converted: false,
        };
      }

      // Get snapshot rate for the source currency
      // Snapshot rates store: currency → USD (e.g., EUR → USD = 0.92)
      // To convert: amountInCurrency ÷ snapshotRate = amountInUSD
      // Then: amountInUSD ÷ displayCurrencySnapshotRate = amountInDisplayCurrency
      const sourceRate = cleanCurrency === 'USD' ? '1' : snapshotRates[cleanCurrency];

      if (!sourceRate) {
        // Fallback: if no rate found, return original amount
        // This shouldn't happen in normal flow, but prevents silent failures
        console.warn(
          `[CurrencyConversion] No snapshot rate found for ${cleanCurrency}, returning original amount`,
        );
        return {
          displayAmount: cleanAmount,
          currency: cleanCurrency,
          rate: '1',
          converted: false,
        };
      }

      try {
        // Convert from source currency to USD
        // If source is USD, this step is skipped
        let amountInUSD: number;
        if (cleanCurrency === 'USD') {
          amountInUSD = Number(cleanAmount);
        } else {
          // sourceRate is the currency → USD rate
          // Format: 1 currency = rate USD (e.g., 1 EUR = 1.1389 USD)
          // So: amountInEUR × 1.1389 = amountInUSD
          amountInUSD = Number(cleanAmount) * Number(sourceRate);
        }

        // Convert from USD to display currency
        let displayAmount: number;
        if (displayCurrency === 'USD') {
          displayAmount = amountInUSD;
        } else {
          const displayRate = snapshotRates[displayCurrency] ?? '1';
          // displayRate is display currency → USD (e.g., 1 EUR = 1.1389 USD)
          // To convert USD → displayCurrency: amountInUSD ÷ displayRate
          // If 1 EUR = 1.1389 USD, then 1 USD = 1/1.1389 EUR
          // So: 28,472.5 USD ÷ 1.1389 = 25,000 EUR
          displayAmount = amountInUSD / Number(displayRate);
        }

        return {
          displayAmount: displayAmount.toFixed(8).replace(/\.?0+$/, ''),
          currency: displayCurrency,
          rate: sourceRate,
          converted: true,
        };
      } catch (err) {
        console.error(
          `[CurrencyConversion] Failed to convert ${cleanAmount} ${cleanCurrency} to ${displayCurrency}`,
          err,
        );
        return {
          displayAmount: cleanAmount,
          currency: cleanCurrency,
          rate: '1',
          converted: false,
        };
      }
    },
    [displayCurrency, snapshotRates],
  );

  const getSnapshotRate = useCallback(
    (currency: string): string | null => {
      const rate = snapshotRates[currency.toUpperCase()];
      return rate ?? null;
    },
    [snapshotRates],
  );

  const formatCurrencyDisplay = useCallback(
    (amount: string): string => {
      const converted = convertToDisplayCurrency(amount, 'USD');
      const numAmount = Number(converted.displayAmount);

      // Get currency symbol (simplified - in production use a proper library)
      const symbols: Record<string, string> = {
        USD: '$',
        EUR: '€',
        GBP: '£',
        JPY: '¥',
        INR: '₹',
        AUD: 'A$',
        CAD: 'C$',
        CHF: 'Fr',
        CNY: '¥',
        BRL: 'R$',
        MXN: '$',
        ARS: '$',
        NGN: '₦',
        ZAR: 'R',
        TRY: '₺',
        RUB: '₽',
        AED: 'د.إ',
        SAR: 'ر.س',
        KRW: '₩',
        IDR: 'Rp',
        VND: '₫',
        THB: '฿',
        PHP: '₱',
        PLN: 'zł',
      };

      const symbol = symbols[displayCurrency] || displayCurrency;
      const formatted = numAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return `${symbol} ${formatted}`;
    },
    [displayCurrency, convertToDisplayCurrency],
  );

  const convertMultiple = useCallback(
    (items: Array<{ amount: string; currency: string }>) => {
      return items.map((item) =>
        convertToDisplayCurrency(item.amount, item.currency),
      );
    },
    [convertToDisplayCurrency],
  );

  const value: CurrencyConversionContextType = useMemo(
    () => ({
      convertToDisplayCurrency,
      formatCurrencyDisplay,
      getSnapshotRate,
      convertMultiple,
    }),
    [convertToDisplayCurrency, formatCurrencyDisplay, getSnapshotRate, convertMultiple],
  );

  return (
    <CurrencyConversionContext.Provider value={value}>
      {children}
    </CurrencyConversionContext.Provider>
  );
};

/**
 * Hook to use currency conversion utilities.
 *
 * Example:
 * ```tsx
 * const { convertToDisplayCurrency, formatCurrencyDisplay } = useCurrencyConversion();
 *
 * // Convert a balance
 * const result = convertToDisplayCurrency("100", "USD");
 * console.log(result.displayAmount); // "92" (if display currency is EUR with rate 0.92)
 *
 * // Format for display
 * const formatted = formatCurrencyDisplay("100");
 * console.log(formatted); // "€ 92.00"
 * ```
 */
export const useCurrencyConversion = (): CurrencyConversionContextType => {
  const context = useContext(CurrencyConversionContext);
  if (context === undefined) {
    throw new Error(
      'useCurrencyConversion must be used within CurrencyConversionProvider',
    );
  }
  return context;
};
