import { ANALYTICS_DEBUG } from './config';
import { gaEvent, gaIdentify, gaPageView, gaResetIdentity, type GaParams } from './gtag';
import { clarityEvent, clarityIdentify, claritySetTag, clarityUpgrade } from './clarity';
import { trackEvent as trackInternal } from '@/utils/tracker';
import { resolveDestinations, type TrackRouting } from './routing.rules';

/**
 * The transport under the event catalogue.
 *
 * THREE destinations, not two: GA4, Clarity, and Rolluck's own event stream
 * (`POST /api/track` → `analytics_events`).
 *
 * The internal fan-out is the reason the admin console can see any of this.
 * Until it existed the catalogue below reached GA4 and Clarity only, so roughly
 * sixty events — every login, every OTP, every KYC step, every bonus claim —
 * were measured by Google and invisible to Rolluck. The event stream held two
 * names (`page_view`, `web_vitals`) and the Player 360 timeline was empty for
 * everything a player actually did.
 *
 * Three rules hold everywhere below:
 *
 *   1. Nothing here may change what the app does. Every call is wrapped so a
 *      blocked script, a null `window` or a malformed parameter can never turn
 *      into an exception inside a login or a payment.
 *   2. Nothing here may carry personal data. The callers decide what to send
 *      and the catalogue's signatures are narrow on purpose, but `undefined`
 *      and `null` are also dropped here so a missing value is never recorded as
 *      the string "undefined".
 *   3. The three destinations are independent. One throwing, being blocked by
 *      an ad blocker, or being switched off must not stop the others — which is
 *      why each is wrapped separately rather than sharing one try/catch.
 */

const safe = (run: () => void): void => {
  try {
    run();
  } catch {
    /* analytics is never worth an exception in a player-facing flow */
  }
};

/** Where an event goes. See routing.rules.ts for the rules themselves. */
export type TrackOptions = TrackRouting;

/** Record one event in GA4, Clarity, and Rolluck's own event stream. */
export const track = (name: string, params: GaParams = {}, options: TrackOptions = {}): void => {
  const to = resolveDestinations(name, params, options);

  if (ANALYTICS_DEBUG) {
    safe(() => {
      // eslint-disable-next-line no-console -- the debug flag exists to print events
      console.info('[analytics]', name, to);
    });
  }

  safe(() => gaEvent(to.ga.name, to.ga.params));

  safe(() => {
    if (to.clarity) clarityEvent(to.clarity.name);
    if (to.upgrade) clarityUpgrade(to.upgrade);
  });

  // Last, and separately wrapped. GA4 and Clarity are third-party scripts that
  // an ad blocker will happily remove — on a gambling site, often — and when
  // that happens this is the only destination still recording.
  safe(() => {
    if (to.internal) trackInternal(to.internal.name, to.internal.params);
  });
};

/**
 * One screen view. Not mirrored to Clarity — it follows history changes itself,
 * and a per-route custom event would burn the project's event-name budget.
 *
 * Deliberately NOT written to the internal stream either. `useTracking` already
 * reports every route change through the tracker's own `trackPageView`, which
 * carries the navigation timing with it; sending it from here as well would
 * double every page-view count in `analytics_sessions.page_views`, the bounce
 * rate derived from it, and the Traffic screen built on both.
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
