import { CLARITY_ENABLED, isBrowser } from './config';

/** The queueing stub Clarity's own snippet installs, plus its pending queue. */
type ClarityFn = ((...args: unknown[]) => void) & { q?: IArguments[] };

declare global {
  interface Window {
    clarity?: ClarityFn;
  }
}

/**
 * Clarity's stub, recreated for the same reason as the gtag one: the tag itself
 * is fetched late, and anything called before it arrives has to wait somewhere.
 * Clarity drains `clarity.q` on load.
 */
const ensureClarity = (): ClarityFn => {
  if (!window.clarity) {
    const queue: ClarityFn = function clarity(): void {
      // eslint-disable-next-line prefer-rest-params
      (queue.q = queue.q ?? []).push(arguments);
    };

    window.clarity = queue;
  }

  return window.clarity;
};

const clarityCommand = (...args: unknown[]): void => {
  if (!CLARITY_ENABLED || !isBrowser()) {
    return;
  }

  ensureClarity()(...args);
};

/**
 * Mark the recording, so a session can be found by what the player did rather
 * than scrubbed through. Clarity indexes these as filterable custom events.
 */
export const clarityEvent = (name: string): void => clarityCommand('event', name);

/** A filterable label on the session (role, wallet, funnel step). */
export const claritySetTag = (key: string, value: string): void =>
  clarityCommand('set', key, value);

/**
 * Same rule as GA: the internal account id, never an address or a number.
 * Clarity hashes what it is given, but it is not a place to put personal data
 * in the first place.
 */
export const clarityIdentify = (userId: string): void => clarityCommand('identify', userId);

/**
 * Ask Clarity to keep this session's full recording.
 *
 * Clarity samples: most sessions are discarded. Upgrading the ones that reach a
 * payment, a redemption or a KYC submission means the recordings that are worth
 * watching — the ones where money or an account is on the line — are the ones
 * still there tomorrow.
 */
export const clarityUpgrade = (reason: string): void => clarityCommand('upgrade', reason);
