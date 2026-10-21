import { GA_ENABLED, GA_MEASUREMENT_ID, isBrowser } from './config';

/** GA4 event parameters: a flat bag of primitives (and `items`, for commerce). */
export type GaParams = Record<string, unknown>;

declare global {
  interface Window {
    // The single GA4 global declaration in the app — utils/ga.ts used to carry
    // a second one, with its own gtag installation, and was deleted.
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let configured = false;

/**
 * Google's own stub and opening commands, recreated here.
 *
 * gtag.js recognises a queued command by it being an `arguments` object — a
 * plain array is read as a Tag Manager data-layer push and quietly ignored — so
 * the `arguments` reference below is load-bearing, however much it looks like a
 * rest parameter would do.
 *
 * Owning the queue here rather than in an inline snippet is what makes the
 * order safe. `config` must be queued before the first event or that event has
 * no property to belong to, and a snippet injected after hydration cannot
 * promise to run before an effect does. Going through this function on every
 * call means the sequence is always js → config → event, whichever fires first,
 * and whenever gtag.js itself finishes downloading — it replays the queue.
 */
const ensureGtag = (): NonNullable<Window['gtag']> => {
  window.dataLayer = window.dataLayer ?? [];

  if (!window.gtag) {
    window.gtag = function gtag(): void {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };
  }

  if (!configured) {
    configured = true;
    window.gtag('js', new Date());
    // Pageviews are sent by hand on every route change instead; see gaPageView.
    window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
  }

  return window.gtag;
};

/** Queue one gtag command. No-op when GA is not configured. */
export const gaCommand = (...args: unknown[]): void => {
  if (!GA_ENABLED || !isBrowser()) {
    return;
  }

  ensureGtag()(...args);
};

export const gaEvent = (name: string, params: GaParams = {}): void =>
  gaCommand('event', name, params);

/**
 * Pageviews are sent by hand (`config` sets `send_page_view: false`).
 *
 * gtag.js only counts a view when the library loads, which in a single-page app
 * is once per session however many screens the player opens. Sending it on
 * every route change is what makes the funnel reports real.
 */
export const gaPageView = (path: string): void => {
  if (!GA_ENABLED || !isBrowser()) {
    return;
  }

  gaEvent('page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
    content_language: document.documentElement.lang || 'en',
  });
};

/**
 * Attach the account to everything sent from here on.
 *
 * `user_id` is the internal account id and nothing else: GA4's terms forbid
 * sending anything that identifies a person outside our own systems, so no
 * email, mobile or username ever reaches this call.
 */
export const gaIdentify = (userId: string, role?: string): void => {
  gaCommand('set', { user_id: userId });

  if (role) {
    gaCommand('set', 'user_properties', { player_role: role });
  }
};

/** Drop the account on sign-out, so the next session is not attributed to it. */
export const gaResetIdentity = (): void => {
  gaCommand('set', { user_id: null });
  gaCommand('set', 'user_properties', { player_role: null });
};
