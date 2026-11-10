import { useCallback } from 'react';

import { useCurrencyConversion } from '@/context/CurrencyConversionContext';
import { useWallet } from '@/context/WalletContext';
import type { Game } from '@/types';
import { betLimitShown, PLATFORM_CURRENCY } from '@/utils/betLimits';
import { displayDecimal } from '@/utils/decimalPrecision';

const FEATURE = 'casino.game_limits';

type LimitFields = Pick<Game, 'min_bet' | 'max_bet' | 'bet_currency' | 'bet_currency_rate'>;

/**
 * A game's bet limits as labels in the player's display currency ("$ 0.11",
 * "€ 0.10"), or null for a limit the game does not publish, so the caller can
 * leave that row out. See utils/betLimits for the conversion.
 *
 * Guests and players whose wallet has not loaded read USD, the platform
 * currency. That is also what the server renders, so hydration agrees.
 */
export const useBetLimits = (game: LimitFields): { min: string | null; max: string | null } => {
  const { summary } = useWallet();
  const { formatCurrencyDisplay, getSnapshotRate } = useCurrencyConversion();
  const display = summary?.preferences.active_currency ?? PLATFORM_CURRENCY;
  const snapshot = getSnapshotRate(display);

  const label = useCallback(
    (value: number | null): string | null => {
      const shown = betLimitShown(
        value,
        game,
        display,
        snapshot === null ? null : Number(snapshot)
      );
      if (!shown) return null;
      if (shown.kind === 'display') return formatCurrencyDisplay(String(shown.usd), FEATURE);
      const amount = displayDecimal(shown.amount, FEATURE, 'en-US') ?? shown.amount.toFixed(2);
      return `${amount} ${shown.currency}`;
    },
    [game, display, snapshot, formatCurrencyDisplay]
  );

  return { min: label(game.min_bet), max: label(game.max_bet) };
};
