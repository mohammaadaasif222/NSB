import type { GaParams } from './gtag';

/**
 * Where one event goes, decided as data rather than as control flow.
 *
 * `track()` fans out to three destinations with different names, different
 * rules and different failure modes. Expressing that as branches inside the
 * send function made the one question that actually matters — "which name
 * lands where" — impossible to check without a browser and three mocked
 * globals.
 *
 * So the decision lives here as a pure function and the sending lives in
 * track.ts. This file follows the same convention as the backend's `.rules`
 * modules: no I/O, no globals, no mocking needed to test it.
 */

export interface TrackRouting {
  /** Mirror the event into Clarity. Default true. */
  clarity?: boolean;
  /** Keep the full Clarity recording of this session, labelled with this reason. */
  upgrade?: string;
  /** Write to Rolluck's own event stream. Default true. */
  internal?: boolean;
  /** Store internally under a different name than GA4 receives. */
  internalName?: string;
}

export interface Destinations {
  ga: { name: string; params: GaParams };
  /** Null when this event is kept out of Clarity. */
  clarity: { name: string } | null;
  /** Null when this event is already recorded internally by another route. */
  internal: { name: string; params: GaParams } | null;
  /** Null unless this event should pin the session recording. */
  upgrade: string | null;
}

/**
 * Drop empty values.
 *
 * GA4 counts `undefined` and `null` as parameters and reports them as noise,
 * and the internal stream would store the string "undefined" for a value that
 * was simply absent. Both want them gone, so it happens once, here, rather
 * than per destination.
 */
export const compact = (params: GaParams): GaParams =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null)
  );

/**
 * The routing table for one event.
 *
 * The naming rule is the subtle part. GA4 reserves a handful of names that
 * unlock its built-in reporting — `sign_up`, `login`, `purchase`,
 * `begin_checkout` — so those have to be sent exactly as Google spells them.
 * Our own stream has no such constraint and reads better with explicit names,
 * and already holds rows under those names. `internalName` lets a single call
 * satisfy both rather than forcing two calls that can drift apart.
 */
export const resolveDestinations = (
  name: string,
  params: GaParams = {},
  routing: TrackRouting = {}
): Destinations => {
  const payload = compact(params);

  return {
    ga: { name, params: payload },
    clarity: routing.clarity === false ? null : { name },
    internal:
      routing.internal === false
        ? null
        : { name: routing.internalName ?? name, params: payload },
    upgrade: routing.upgrade ?? null,
  };
};
