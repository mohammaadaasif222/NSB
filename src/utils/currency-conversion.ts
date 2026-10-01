import type { ExchangeRate } from '@/types';

/**
 * Find exchange rate between two currencies.
 * Searches for direct rate first, then computes cross-rate through USD.
 */
export function findRate(rates: ExchangeRate[], fromCode: string, toCode: string): number | null {
  if (fromCode === toCode) return 1;

  // Direct rate: look for fromCode→toCode
  const direct = rates.find((r) => r.from === fromCode && r.to === toCode);
  if (direct) return Number(direct.rate);

  // Cross-rate via USD: fromCode→USD and USD→toCode
  if (fromCode !== 'USD' && toCode !== 'USD') {
    const toUsd = rates.find((r) => r.from === fromCode && r.to === 'USD');
    const fromUsd = rates.find((r) => r.from === 'USD' && r.to === toCode);
    if (toUsd && fromUsd) {
      return Number(toUsd.rate) * Number(fromUsd.rate);
    }
  }

  // One-way via USD
  if (fromCode !== 'USD') {
    const toUsd = rates.find((r) => r.from === fromCode && r.to === 'USD');
    if (toUsd && toCode === 'USD') {
      return Number(toUsd.rate);
    }
  }
  if (toCode !== 'USD') {
    const fromUsd = rates.find((r) => r.from === 'USD' && r.to === toCode);
    if (fromUsd && fromCode === 'USD') {
      return Number(fromUsd.rate);
    }
  }

  return null;
}

/**
 * Convert amount from one currency to another.
 *
 * @param amount - Amount in source currency
 * @param rates - Exchange rate table
 * @param fromCode - Source currency code (e.g., 'EUR', 'BTC')
 * @param toCode - Target currency code (e.g., 'USD', 'BTC')
 * @returns Converted amount, or null if rate not found
 */
export function convertAmount(
  amount: number | string,
  rates: ExchangeRate[],
  fromCode: string,
  toCode: string
): number | null {
  const rate = findRate(rates, fromCode, toCode);
  if (rate === null) return null;

  const numAmount = Number(amount);
  if (!Number.isFinite(numAmount)) return null;

  return numAmount * rate;
}

/**
 * Display amount (e.g., EUR) → Crypto amount (e.g., BTC).
 *
 * Flow:
 *   1. Display amount (EUR) → USD (using display→USD rate)
 *   2. USD → Crypto (using USD→crypto rate)
 *
 * @param displayAmount - Amount in display currency
 * @param displayCurrencyCode - Display currency (EUR, INR, USD, etc.)
 * @param cryptoCode - Crypto code (BTC, ETH, SOL, etc.)
 * @param rates - Exchange rate table
 * @returns Crypto amount, or null if rates unavailable
 */
export function displayToCrypto(
  displayAmount: number | string,
  displayCurrencyCode: string,
  cryptoCode: string,
  rates: ExchangeRate[]
): number | null {
  // Step 1: Display currency → USD
  const usdAmount = convertAmount(displayAmount, rates, displayCurrencyCode, 'USD');
  if (usdAmount === null) return null;

  // Step 2: USD → Crypto
  const cryptoAmount = convertAmount(usdAmount, rates, 'USD', cryptoCode);
  return cryptoAmount;
}

/**
 * Crypto amount (e.g., BTC) → Display amount (e.g., EUR).
 *
 * Flow:
 *   1. Crypto → USD (using crypto→USD rate)
 *   2. USD → Display amount (using USD→display rate)
 *
 * @param cryptoAmount - Amount in crypto
 * @param cryptoCode - Crypto code (BTC, ETH, SOL, etc.)
 * @param displayCurrencyCode - Display currency (EUR, INR, USD, etc.)
 * @param rates - Exchange rate table
 * @returns Display amount, or null if rates unavailable
 */
export function cryptoToDisplay(
  cryptoAmount: number | string,
  cryptoCode: string,
  displayCurrencyCode: string,
  rates: ExchangeRate[]
): number | null {
  // Step 1: Crypto → USD
  const usdAmount = convertAmount(cryptoAmount, rates, cryptoCode, 'USD');
  if (usdAmount === null) return null;

  // Step 2: USD → Display currency
  const displayAmount = convertAmount(usdAmount, rates, 'USD', displayCurrencyCode);
  return displayAmount;
}
