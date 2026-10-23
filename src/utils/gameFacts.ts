import type { TranslationKey } from '@/i18n/locales';
import type { Game } from '@/types';

/** "5,000x", or null when the studio publishes no maximum win. */
export const maxWinLabel = (game: Pick<Game, 'max_win_multiplier'>): string | null =>
  game.max_win_multiplier === null
    ? null
    : `${game.max_win_multiplier.toLocaleString('en-US', { maximumFractionDigits: 2 })}x`;

/** The features a player filters by, as pills: bonus buy and a jackpot. */
export const featureKeys = (game: Pick<Game, 'buy_feature' | 'jackpot_type'>): TranslationKey[] => {
  const keys: TranslationKey[] = [];
  if (game.buy_feature) keys.push('game.feature.bonusBuy');
  if (game.jackpot_type === 'LOCAL') keys.push('game.feature.jackpot');
  if (game.jackpot_type === 'POOLED') keys.push('game.feature.pooledJackpot');
  return keys;
};
