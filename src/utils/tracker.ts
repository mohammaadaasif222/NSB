/**
 * The in-house browser tracker.
 *
 * Reports page views, page timing and custom events to `POST /api/track`.
 * Zero dependencies and no library: everything here is a few hundred bytes of
 * platform API, and pulling in an analytics SDK to send an array of objects
 * would cost more than the feature.
 *
 * Three rules it never breaks:
 *
 *   1. It never blocks a page. Every send is `sendBeacon` or a `keepalive`
 *      fetch, both of which are fire-and-forget by definition.
 *   2. It never throws into the app. Every entry point is wrapped, because a
 *      tracking bug must not be able to white-screen the lobby.
 *   3. It never sends anything identifying. No player id, no address, no
 *      device string — the server derives all of that from the request it
 *      already has, and a client that could name a user could name any user.
 */

const ANON_COOKIE = 'rl_anon';
const SESSION_KEY = 'rl_session';
const SESSION_STARTED_KEY = 'rl_session_started';

/** Matches SESSION_IDLE_MS in the backend's IngestService. */
const SESSION_IDLE_MS = 30 * 60 * 1000;

const FLUSH_INTERVAL_MS = 5_000;
const MAX_BATCH = 50;
const COOKIE_MAX_AGE_DAYS = 365;

interface Timing {
  ttfb?: number;
  fcp?: number;
  lcp?: number;
  inp?: number;
  load?: number;
  cls?: number;
}

interface QueuedEvent {
  name: string;
  path: string | null;
  ts: number;
  props?: Record<string, unknown> | null;
  timing?: Timing | null;
}

const endpoint = (): string => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
  return `${base.replace(/\/$/, '')}/track`;
};

/**
 * `text/plain`, even though the body is JSON. This is not a mistake and it is
 * why every analytics SDK does the same thing.
 *
 * The player app and the API are different origins (:5173 and :5000), so every
 * send is cross-origin. `application/json` is not a CORS-safelisted content
 * type, which makes the request a full CORS request: it needs a preflight, and
 * `sendBeacon` sends it with credentials included. The API answers with
 * `Access-Control-Allow-Origin: *`, and a browser REFUSES a credentialed
 * request against a wildcard origin — so the beacon is dropped, silently,
 * with no console error and no failed request to notice.
 *
 * `text/plain` is safelisted. The request becomes a simple one: no preflight,
 * no credentials, and the browser sends it whatever the CORS headers say.
 * Only the response is opaque, and nothing here reads the response.
 *
 * The server accepts it — see the `/api/track` body parser in main.ts.
 */
const CONTENT_TYPE = 'text/plain;charset=UTF-8';

/* -------------------------------------------------------------------------- */
/* Identity — two ids, both meaningless to anyone but the reporting tables.    */
/* -------------------------------------------------------------------------- */

const uuid = (): string => {
  // randomUUID is unavailable on http:// origins other than localhost, which
  // includes most staging setups, so the fallback is not dead code.
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

const readCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

/**
 * The visitor id, in a first-party cookie rather than localStorage — the
 * backend reads it off the Cookie header at sign-in to link this browser's
 * history to the account, and it cannot read localStorage.
 *
 * `SameSite=Lax` so it survives a click in from an ad or an affiliate, which
 * is exactly the journey attribution exists to measure.
 */
const anonId = (): string => {
  const existing = readCookie(ANON_COOKIE);
  if (existing) return existing;

  const id = uuid();
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${ANON_COOKIE}=${id}; Path=/; Max-Age=${COOKIE_MAX_AGE_DAYS * 86400}; SameSite=Lax${secure}`;
  return id;
};

/**
 * The visit id, in sessionStorage and rotated after 30 minutes idle.
 *
 * sessionStorage, not a cookie: a visit is per-tab-session by definition, and
 * it must not be sent on every request to the API.
 */
const sessionId = (): string => {
  try {
    const now = Date.now();
    const existing = sessionStorage.getItem(SESSION_KEY);
    const startedAt = Number(sessionStorage.getItem(SESSION_STARTED_KEY) ?? '0');

    if (existing && now - startedAt < SESSION_IDLE_MS) {
      sessionStorage.setItem(SESSION_STARTED_KEY, String(now));
      return existing;
    }

    const id = uuid();
    sessionStorage.setItem(SESSION_KEY, id);
    sessionStorage.setItem(SESSION_STARTED_KEY, String(now));
    return id;
  } catch {
    // Private mode, or storage disabled. A per-page-load id still produces
    // usable event rows; only the grouping into visits is lost.
    return uuid();
  }
};

/* -------------------------------------------------------------------------- */
/* Acquisition context — sent once per session, on the first batch.            */
/* -------------------------------------------------------------------------- */

let contextSent = false;

const buildContext = (): Record<string, unknown> => {
  const params = new URLSearchParams(location.search);

  return {
    screen_width: window.screen?.width ?? null,
    screen_height: window.screen?.height ?? null,
    language: navigator.language ?? null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
    // An empty referrer means a direct visit, which is a real answer, so it is
    // sent as null rather than omitted.
    referrer: document.referrer || null,
    landing_path: location.pathname || null,
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_term: params.get('utm_term'),
    utm_content: params.get('utm_content'),
  };
};

/* -------------------------------------------------------------------------- */
/* Queue                                                                       */
/* -------------------------------------------------------------------------- */

const queue: QueuedEvent[] = [];
let timer: ReturnType<typeof setInterval> | null = null;
let enabled = true;

const send = (): void => {
  if (queue.length === 0 || !enabled) return;

  const events = queue.splice(0, MAX_BATCH);

  const payload = JSON.stringify({
    anon_id: anonId(),
    session_id: sessionId(),
    ...(contextSent ? {} : { context: buildContext() }),
    events,
  });

  contextSent = true;

  try {
    // sendBeacon survives the page being closed, which is the only way the
    // last page view of a visit is ever recorded. It caps at ~64KB and returns
    // false when it refuses to QUEUE — note that a `true` means queued, not
    // delivered, so this is not a success signal.
    if (navigator.sendBeacon) {
      const ok = navigator.sendBeacon(endpoint(), new Blob([payload], { type: CONTENT_TYPE }));
      if (ok) return;
    }

    void fetch(endpoint(), {
      method: 'POST',
      headers: { 'Content-Type': CONTENT_TYPE },
      body: payload,
      // Lets the request outlive the document, the same property that makes
      // sendBeacon work.
      keepalive: true,
      // NOT `credentials: 'include'`. The tracker needs no cookies — the
      // visitor id travels in the payload — and asking for them would turn
      // this into a credentialed CORS request, which the browser then refuses
      // against an `Access-Control-Allow-Origin: *` response.
    }).catch(() => {
      /* Analytics is not worth a retry, let alone an error surfaced to a player. */
    });
  } catch {
    /* Ignore: see rule 2. */
  }
};

const enqueue = (event: QueuedEvent): void => {
  if (!enabled) return;

  queue.push(event);
  if (queue.length >= MAX_BATCH) send();
};

/* -------------------------------------------------------------------------- */
/* Page timing — Web Vitals without the library.                               */
/* -------------------------------------------------------------------------- */

const collectTiming = (): Timing => {
  const timing: Timing = {};

  try {
    const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];

    if (nav) {
      timing.ttfb = Math.round(nav.responseStart);
      if (nav.loadEventEnd > 0) timing.load = Math.round(nav.loadEventEnd);
    }

    const paint = performance
      .getEntriesByType('paint')
      .find((entry) => entry.name === 'first-contentful-paint');
    if (paint) timing.fcp = Math.round(paint.startTime);
  } catch {
    /* performance entries are unavailable in some embedded webviews. */
  }

  return timing;
};

/**
 * LCP, CLS and INP are not readable at page-view time — they are only final
 * once the page is being left. Each observer keeps the running value, and
 * `flush()` attaches whatever has accumulated to a `web_vitals` event.
 */
let lcp: number | undefined;
let cls = 0;
let inp: number | undefined;

const observeVitals = (): void => {
  if (typeof PerformanceObserver === 'undefined') return;

  const observe = (type: string, handler: (entries: PerformanceEntryList) => void): void => {
    try {
      const observer = new PerformanceObserver((list) => handler(list.getEntries()));
      // `buffered` replays entries that fired before this ran — without it the
      // LCP of the initial load is usually missed entirely.
      observer.observe({ type, buffered: true } as PerformanceObserverInit);
    } catch {
      /* An unsupported entry type throws rather than no-oping. */
    }
  };

  observe('largest-contentful-paint', (entries) => {
    const last = entries[entries.length - 1];
    if (last) lcp = Math.round(last.startTime);
  });

  observe('layout-shift', (entries) => {
    for (const entry of entries as unknown as Array<
      PerformanceEntry & { value: number; hadRecentInput: boolean }
    >) {
      // Shifts within 500ms of an interaction are the user's doing, not the
      // page's, and are excluded from the score by definition.
      if (!entry.hadRecentInput) cls += entry.value;
    }
  });

  observe('event', (entries) => {
    for (const entry of entries as unknown as Array<
      PerformanceEntry & { duration: number; interactionId?: number }
    >) {
      if (!entry.interactionId) continue;
      const duration = Math.round(entry.duration);
      if (inp === undefined || duration > inp) inp = duration;
    }
  });
};

/* -------------------------------------------------------------------------- */
/* Public API                                                                  */
/* -------------------------------------------------------------------------- */

/** A page view, with whatever timing is available at this point. */
export const trackPageView = (path?: string): void => {
  try {
    enqueue({
      name: 'page_view',
      path: path ?? location.pathname,
      ts: Date.now(),
      timing: collectTiming(),
    });
  } catch {
    /* Ignore. */
  }
};

/** Anything else worth counting: a game opened, a deposit started. */
export const trackEvent = (name: string, props?: Record<string, unknown>): void => {
  try {
    enqueue({ name, path: location.pathname, ts: Date.now(), props: props ?? null });
  } catch {
    /* Ignore. */
  }
};

/** Sends everything queued, plus the final vitals. Called on page hide. */
export const flush = (): void => {
  try {
    if (lcp !== undefined || cls > 0 || inp !== undefined) {
      queue.push({
        name: 'web_vitals',
        path: location.pathname,
        ts: Date.now(),
        timing: {
          ...(lcp !== undefined ? { lcp } : {}),
          ...(inp !== undefined ? { inp } : {}),
          // Rounded to the column's 4 decimal places.
          ...(cls > 0 ? { cls: Number(cls.toFixed(4)) } : {}),
        },
      });
      // Reset, so a page that is hidden and shown again does not report the
      // same shift score twice.
      lcp = undefined;
      inp = undefined;
      cls = 0;
    }

    send();
  } catch {
    /* Ignore. */
  }
};

let started = false;

/**
 * Starts the tracker. Safe to call more than once — React 18's StrictMode
 * mounts effects twice in development, and without this guard every event
 * would be queued twice there.
 */
export const startTracking = (): void => {
  if (started || typeof window === 'undefined') return;
  started = true;

  try {
    if (process.env.NEXT_PUBLIC_TRACKING_ENABLED === 'false') {
      enabled = false;
      return;
    }

    observeVitals();

    timer = setInterval(send, FLUSH_INTERVAL_MS);

    // `visibilitychange` to hidden, not `beforeunload`: on mobile a tab is
    // very often killed without ever firing an unload event, and that is the
    // case where the whole visit would otherwise be lost.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush();
    });

    // Belt and braces for desktop, where pagehide does fire reliably.
    window.addEventListener('pagehide', flush);
  } catch {
    enabled = false;
  }
};

/** Stops the timer. Only the app shell's cleanup needs this. */
export const stopTracking = (): void => {
  if (timer !== null) clearInterval(timer);
  timer = null;
  started = false;
};
