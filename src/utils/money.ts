/**
 * Money on screen. Amounts arrive from the API as exact decimal strings; these
 * helpers only ever format them, never do arithmetic on them.
 */

/**
 * Symbols for the currencies the platform actually issues wallets in. Anything
 * else falls back to its ISO code, printed after the amount — better an
 * unfamiliar "1,000.00 XYZ" than a figure with no unit at all.
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  TRY: '₺',
  RUB: '₽',
};

/** "$1,000.00", or "1,000.00 XYZ" when the code has no symbol. */
export const withCurrency = (amount: string, currency: string): string => {
  const symbol = CURRENCY_SYMBOLS[currency?.toUpperCase()];
  return symbol ? `${symbol}${amount}` : `${amount} ${currency}`;
};

/**
 * Format an exact decimal string for display.
 *
 * The value arrives as a string precisely so it never passes through a float;
 * Number() here is the last step before rendering and the result is not used
 * for anything else. Amounts far beyond Number.MAX_SAFE_INTEGER would lose
 * precision, which no real balance approaches.
 */
export const formatAmount = (amount: string, digits = 2): string =>
  Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

/**
 * A reward amount with its currency.
 *
 * Accruals carry 8 places, and rakeback on small bets is often under a cent.
 * Shown to 2 places that reads as "$0.00" while something is in fact building
 * up, so a positive amount under a cent is shown to 4.
 */
export const formatRewardAmount = (amount: string, currency: string): string => {
  const value = Number(amount);
  const digits = value > 0 && value < 0.01 ? 4 : 2;
  return withCurrency(formatAmount(amount, digits), currency);
};

/**
 * An amount in a wallet currency, e.g. what a reward claim paid. A fiat reads
 * like any other money; crypto keeps up to 8 places — "0.00012345 BTC" — since
 * two would round a small BTC credit away.
 */
export const formatWalletAmount = (amount: string, currency: string): string =>
  CURRENCY_SYMBOLS[currency?.toUpperCase()]
    ? formatRewardAmount(amount, currency)
    : `${Number(amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8,
      })} ${currency}`;
