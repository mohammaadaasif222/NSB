import { DISPLAY_CURRENCY_SYMBOL } from '@/components/responsible/rgContent';
import { translate } from '@/i18n/translate';

/**
 * Formatting for the Responsible Gambling section.
 *
 * Every function here runs on values that arrive after mount, so none of it
 * is reached during SSR — which is what keeps `Intl` and "time from now" out
 * of hydration-mismatch territory.
 */

/** "in 3 days", "in 5 hours", "in 12 minutes" — in `locale`. Falls back to a date. */
export const formatUntil = (iso: string, locale = 'en'): string => {
  const ms = new Date(iso).getTime() - Date.now();
  if (!Number.isFinite(ms)) {
    return '—';
  }

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  // `numeric: 'auto'` renders zero seconds as the locale's own word for "now".
  if (ms <= 0) {
    return rtf.format(0, 'second');
  }

  const minutes = Math.round(ms / 60_000);

  if (minutes < 60) {
    return rtf.format(minutes, 'minute');
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return rtf.format(hours, 'hour');
  }

  const days = Math.round(hours / 24);
  if (days < 31) {
    return rtf.format(days, 'day');
  }

  return new Date(iso).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/** "14 Mar 2026". */
export const formatDate = (iso: string, locale = 'en'): string =>
  new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });

/** A limit figure with its unit — `$500.00`, or `60 min`. */
export const formatLimit = (amount: string, unit: 'currency' | 'minutes'): string =>
  unit === 'minutes'
    ? `${amount} ${translate('rgc.limitMinutes')}`
    : `${DISPLAY_CURRENCY_SYMBOL}${amount}`;

/** How much of a limit is spent, clamped to 0–1 for the usage bar. */
export const usageRatio = (used: string, amount: string): number => {
  const cap = Number(amount);
  const spent = Number(used);
  if (!Number.isFinite(cap) || cap <= 0 || !Number.isFinite(spent)) {
    return 0;
  }
  return Math.min(1, Math.max(0, spent / cap));
};
