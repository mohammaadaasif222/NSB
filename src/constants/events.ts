/**
 * Window events for telling unrelated components that something changed
 * server-side, without threading a context through everything in between.
 */

/**
 * The wallet changed — a reward was claimed. The top-bar balance listens and
 * refetches, so the chip moves the moment the money lands.
 */
export const WALLET_REFRESH_EVENT = 'wallet:refresh';

/**
 * Rewards moved without the wallet changing — a wager was recorded, e.g. by a
 * demo Dice roll. The rewards tray and page listen and refetch.
 */
export const REWARDS_REFRESH_EVENT = 'rewards:refresh';

/**
 * A bonus was claimed or forfeited. The bonuses page listens and refetches;
 * so does the rewards tray, since a claim that credits bonus funds changes
 * what the wallet chip shows.
 */
export const BONUS_REFRESH_EVENT = 'bonus:refresh';
