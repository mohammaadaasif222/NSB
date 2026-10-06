/**
 * The catalogue of product events, and the only place their names are written.
 *
 * Why these are functions rather than `trackEvent('game_open', …)` calls
 * scattered through the components:
 *
 * `POST /track` accepts ANY event name — deliberately, so that adding one
 * never needs a migration (see the `name` column in schema.prisma). The cost
 * of that freedom is that a typo does not fail. `trackEvent('game_opened')`
 * in one component and `trackEvent('game_open')` in another produce two event
 * types that look identical in the code and never add up in a report, and
 * nothing anywhere will say so. Naming them once removes that whole class of
 * bug.
 *
 * Every payload below follows the tracker's own rule: nothing identifying.
 * No player id, no email, no wallet address, no deposit amount. The server
 * already knows who is signed in from the request; a browser that could name
 * a player could name any player. Currency codes, game slugs and step names
 * are safe — they describe the product, not the person.
 *
 * These go through `track()` rather than straight to the internal tracker, so
 * there is ONE transport for every product event in the app and each of these
 * reaches GA4 and Clarity as well. That was not previously true: signup was
 * recorded internally only, which meant GA4 — where `sign_up` is a key
 * conversion event — never saw a single social registration.
 */

import { track } from '@/services/analytics/track';

/* -------------------------------------------------------------------------- */
/* Names                                                                       */
/* -------------------------------------------------------------------------- */

export const EVENTS = {
  SIGNUP_COMPLETE: 'signup_complete',
  DEPOSIT_START: 'deposit_start',
  DEPOSIT_ABANDONED: 'deposit_abandoned',
  GAME_OPEN: 'game_open',
  GAME_LAUNCH: 'game_launch',
  GAME_IMPRESSION: 'game_impression',
} as const;

/* -------------------------------------------------------------------------- */
/* Signup                                                                      */
/* -------------------------------------------------------------------------- */

/** Every route by which an account can come into existence. */
export type SignupMethod = 'mail' | 'phone' | 'google' | 'telegram' | 'steam';

/**
 * The account is real and verified.
 *
 * On the mail and phone routes that means after the OTP is accepted, not when
 * the registration form is submitted. Those are very different numbers: a
 * player who submits the form and never enters the code has not signed up, and
 * counting them as one would overstate the top of every funnel built on this.
 *
 * On the social routes there is no OTP — the provider has already vouched for
 * the identity — so the equivalent moment is the sign-in response saying it
 * created an account rather than matching one. All three social providers share
 * a single endpoint for signing up and signing in, so that flag is the only
 * thing that separates the two; firing on every social sign-in would count
 * every returning player as a new one.
 */
export const trackSignupComplete = (method: SignupMethod): void =>
  // GA4 gets its reserved `sign_up`, which is what unlocks its conversion
  // reporting; our own stream keeps `signup_complete`, which is the name every
  // existing row already uses.
  track('sign_up', { method }, { internalName: EVENTS.SIGNUP_COMPLETE });

/* -------------------------------------------------------------------------- */
/* Deposit                                                                     */
/* -------------------------------------------------------------------------- */

/** The deposit screen was opened. Says nothing yet about intent to pay. */
export const trackDepositStart = (): void => track(EVENTS.DEPOSIT_START);

/**
 * The player left the deposit screen.
 *
 * `address_shown` is the half that matters. Leaving before an address appeared
 * is ordinary browsing; leaving *after* seeing one means they got as far as
 * being able to pay and did not — which is the number nobody at Rolluck can
 * currently see.
 *
 * IMPORTANT — this event cannot tell you a deposit did not happen. Crypto
 * arrives on-chain minutes or hours later, through the CoinsPaid webhook, long
 * after this browser has closed. Someone can scan the QR, close the modal, and
 * pay from their phone twenty minutes on; this event fires for them too.
 *
 * So treat it as "closed the screen", never as "did not pay". The authoritative
 * answer lives in `payment_transactions`, and true abandonment is that join:
 * saw an address, and no transaction followed within the window. That is a
 * rollup question for the server, not something a browser can answer.
 */
export const trackDepositAbandoned = (props: {
  address_shown: boolean;
  seconds_on_screen: number;
  currency: string | null;
  network: string | null;
}): void => track(EVENTS.DEPOSIT_ABANDONED, props);

/* -------------------------------------------------------------------------- */
/* Games                                                                       */
/* -------------------------------------------------------------------------- */

/** A game tile was clicked. `shelf` is the row it was clicked from. */
export const trackGameOpen = (slug: string, shelf?: string): void =>
  track(EVENTS.GAME_OPEN, { slug, shelf: shelf ?? null });

/**
 * The game frame actually loaded — the player is playing.
 *
 * Distinct from `game_open`, which is the tile click. Between the two sit a
 * launch request to the aggregator, a provider that may refuse, and a frame
 * that may never load; a player who gives up in that gap has opened a game and
 * not played one. `analytics_sessions.games_played` counts this event and
 * `games_viewed` counts the click, so the gap between them is the launch
 * failure rate nobody could previously see.
 *
 * `mode` separates real play from demo, which is the other thing a raw open
 * count silently merges.
 */
export const trackGameLaunch = (slug: string, mode: string): void =>
  track(EVENTS.GAME_LAUNCH, { slug, mode });

/**
 * Games that were actually on screen — sent as ONE event carrying a list, not
 * one event per tile.
 *
 * A lobby renders well over fifty tiles. One event each would blow through
 * MAX_EVENTS_PER_BATCH (50) on a single scroll, push out the events that
 * matter, and write tens of thousands of near-identical rows a day for a
 * question that a list answers just as well.
 *
 * Paired with `game_open`, this is the measurement the lobby has never had:
 * shown 4,000 times, opened 12. Without it, a game at the top of the page and
 * a game people want are indistinguishable.
 */
export const trackGameImpressions = (slugs: string[], shelf?: string): void => {
  if (slugs.length === 0) return;
  // Clarity is capped on distinct event names and this is the highest-frequency
  // event in the app, so it is kept out of there and left to GA4 and our own stream.
  track(EVENTS.GAME_IMPRESSION, { slugs, count: slugs.length, shelf: shelf ?? null }, { clarity: false });
};
