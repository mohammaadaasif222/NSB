/**
 * Analytics configuration.
 *
 * Neither tool loads unless its id is set, so a build without the variables —
 * every local `npm run dev`, and any preview that was not given them — is
 * completely inert: no script is fetched, no event is queued, nothing is sent.
 * That is the switch, rather than a NODE_ENV check, so staging can be pointed
 * at a throwaway property without a code change.
 *
 * NEXT_PUBLIC_* values are substituted at build time, which only works on the
 * whole expression: `process.env[name]` would be undefined in the browser.
 */

/** GA4 Measurement ID from the property's web data stream ("G-XXXXXXXXXX"). */
export const GA_MEASUREMENT_ID: string = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '';

/** Microsoft Clarity project id, from the project's setup page. */
export const CLARITY_PROJECT_ID: string = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? '';

/**
 * Log every event to the console instead of wondering why one is missing.
 * Events are still sent; this only adds the trace.
 */
export const ANALYTICS_DEBUG: boolean = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true';

export const GA_ENABLED: boolean = GA_MEASUREMENT_ID.length > 0;

export const CLARITY_ENABLED: boolean = CLARITY_PROJECT_ID.length > 0;

/**
 * Analytics is a browser-only concern: the page is rendered on the server too,
 * and every entry point checks this before touching `window`.
 */
export const isBrowser = (): boolean => typeof window !== 'undefined';
