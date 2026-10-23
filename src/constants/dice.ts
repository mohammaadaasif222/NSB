/** The catalogue game that plays as Dice rather than showing its details page. */
export const DICE_SLUG = 'dice';

/** The bet and win chance a fresh board starts on. */
export const DICE_DEFAULT_BET = 1;
export const DICE_DEFAULT_WIN_CHANCE = 49.5;

/** Pause between autobet rolls, long enough to see each result land. */
export const DICE_AUTO_DELAY_MS = 350;

/** Rolls kept in the recent-results strip. */
export const DICE_HISTORY_SIZE = 16;

/** While rolls stream in, the rewards tray refetches at most this often. */
export const DICE_REWARDS_REFRESH_MS = 3000;
