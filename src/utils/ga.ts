/**
 * Google Analytics 4 — the parallel layer.
 *
 * Deliberately additive and deliberately thin. GA4 is here because it is free
 * and because marketing already knows how to read it, NOT because anything
 * depends on it: every figure the admin console draws comes from our own
 * tables, so GA being blocked by an ad blocker (which it is, for a large share
 * of traffic, on a gambling site especially) costs nothing that matters.
 *
 * That is also why it is a separate file from tracker.ts rather than a branch
 * inside it. The two have different reliability expectations and must not
 * share a failure mode.
 *
 * Disabled unless NEXT_PUBLIC_GA_MEASUREMENT_ID is set, so development and
 * preview builds send nothing.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '';

export const gaEnabled = (): boolean => typeof window !== 'undefined' && MEASUREMENT_ID !== '';

/**
 * A page view. GA4 sends one automatically on script load, so the config call
 * in _document.tsx disables that — otherwise the first page of every visit is
 * counted twice, once by GA and once here.
 */
export const gaPageView = (path: string): void => {
  if (!gaEnabled() || typeof window.gtag !== 'function') return;

  try {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  } catch {
    /* Never let the optional layer break the page. */
  }
};

/** A custom event, mirroring trackEvent. */
export const gaEvent = (name: string, params?: Record<string, unknown>): void => {
  if (!gaEnabled() || typeof window.gtag !== 'function') return;

  try {
    window.gtag('event', name, params ?? {});
  } catch {
    /* Ignore. */
  }
};

export const GA_MEASUREMENT_ID = MEASUREMENT_ID;
