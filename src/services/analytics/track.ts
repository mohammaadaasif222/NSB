import { ANALYTICS_DEBUG } from './config';
import { gaEvent, gaIdentify, gaPageView, gaResetIdentity, type GaParams } from './gtag';
import { clarityEvent, clarityIdentify, claritySetTag, clarityUpgrade } from './clarity';

/**
 * The transport under the event catalogue.
 *
 * Two rules hold everywhere below:
 *
 *   1. Nothing here may change what the app does. Every call is wrapped so a
 *      blocked script, a null `window` or a malformed parameter can never turn
 *      into an exception inside a login or a payment.
 *   2. Nothing here may carry personal data. The callers decide what to send
 *      and the catalogue's signatures are narrow on purpose, but `undefined`
 *      and `null` are also dropped here so a missing value is never recorded as
 *      the string "undefined".
 */

const safe = (run: () => void): void => {
  try {
    run();
  } catch {
    /* analytics is never worth an exception in a player-facing flow */
  }
};

/** Drop empty values: GA4 counts them as parameters and reports them as noise. */
const compact = (params: GaParams): GaParams =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null)
  );

export interface TrackOptions {
  /**
   * Mirror the event into Clarity so the session replay can be found by it.
   * On by default; turned off for anything high-frequency, since Clarity caps
   * how many distinct event names a project may have.
   */
  clarity?: boolean;
  /** Keep the full Clarity recording of this session, labelled with this reason. */
  upgrade?: string;
}

/** Record one event in both tools. */
export const track = (name: string, params: GaParams = {}, options: TrackOptions = {}): void =>
  safe(() => {
    const payload = compact(params);

    if (ANALYTICS_DEBUG) {
      // eslint-disable-next-line no-console -- the debug flag exists to print events
      console.info('[analytics]', name, payload);
    }

    gaEvent(name, payload);

    if (options.clarity !== false) {
      clarityEvent(name);
    }

    if (options.upgrade) {
      clarityUpgrade(options.upgrade);
    }
  });

/**
 * One screen view. Not mirrored to Clarity — it follows history changes itself,
 * and a per-route custom event would burn the project's event-name budget.
 */
export const pageView = (path: string): void => safe(() => gaPageView(path));

/** Attach the signed-in account to this session in both tools. */
export const identify = (userId: string, role?: string): void =>
  safe(() => {
    gaIdentify(userId, role);
    clarityIdentify(userId);

    if (role) {
      claritySetTag('player_role', role);
    }
  });

/** Forget the account on sign-out. */
export const resetIdentity = (): void => safe(() => gaResetIdentity());
