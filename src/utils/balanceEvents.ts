/**
 * Game play moves the balance server-side — the aggregator debits and credits
 * it directly — so nothing in the page knows when it changed. Anything that
 * has reason to believe it did (a round ending, leaving a game) asks the
 * wallet chip to re-fetch through this event.
 */
export const BALANCE_REFRESH_EVENT = 'rolluck:balance-refresh';

export const requestBalanceRefresh = (): void => {
  window.dispatchEvent(new Event(BALANCE_REFRESH_EVENT));
};
