/**
 * How to show one of a game's bet limits to the player.
 *
 * Studios quote limits in their own currency (`bet_currency`, e.g. Alea's
 * EUR; null means the platform's USD). The player reads money in their
 * display currency, so a limit goes bet currency → USD (the game's
 * `bet_currency_rate`) → display currency (the player's snapshot rate, the
 * same rate the header balance uses). The second hop is
 * formatCurrencyDisplay's job, so this returns the USD figure for it.
 *
 * A player whose display currency is the bet currency gets their own
 * snapshot rate for the first hop too. The two hops then cancel and they see
 * the published figure exactly, not one bent by two different rates.
 *
 * When either hop has no rate, the limit is shown as published, with its own
 * currency code. That is an honest figure, never one with the wrong symbol.
 */

export const PLATFORM_CURRENCY = 'USD';

export type BetLimitShown =
  /** Format with formatCurrencyDisplay(usd). */
  | { kind: 'display'; usd: number }
  /** No rate to convert with: show `amount currency` as published. */
  | { kind: 'published'; amount: number; currency: string };

const positive = (value: number | null | undefined): number | null =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;

export const betLimitShown = (
  value: number | null,
  game: { bet_currency: string | null; bet_currency_rate?: number | null },
  displayCurrency: string,
  /** USD per one unit of the display currency; ignored for USD. */
  displaySnapshotRate: number | null
): BetLimitShown | null => {
  if (value === null || !Number.isFinite(value)) return null;

  const source = game.bet_currency?.trim().toUpperCase() || PLATFORM_CURRENCY;
  const display = displayCurrency.trim().toUpperCase() || PLATFORM_CURRENCY;
  const published = { kind: 'published', amount: value, currency: source } as const;

  const displayRate = display === PLATFORM_CURRENCY ? 1 : positive(displaySnapshotRate);
  if (displayRate === null) return published;

  const usdPerUnit =
    source === display
      ? displayRate
      : source === PLATFORM_CURRENCY
        ? 1
        : positive(game.bet_currency_rate);
  if (usdPerUnit === null) return published;

  return { kind: 'display', usd: value * usdPerUnit };
};
