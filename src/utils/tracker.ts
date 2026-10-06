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
/** The device id is mirrored in both, so losing one does not lose the device. */
const DEVICE_COOKIE = 'rl_device';
const DEVICE_KEY = 'rl_device';
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
  /**
   * This event's own id, and the server's dedupe key.
   *
   * The transport is fire-and-forget — `sendBeacon` cannot report whether it
   * arrived — so a resend is the only recovery available, and without an id
   * every resend was counted again. Generated once, when the event is queued,
   * NOT when it is sent: an id minted at send time would differ on the retry
   * and defeat the whole mechanism.
   */
  event_id: string;
  /** The shape of `props` for this name. See SCHEMA_VERSION. */
  schema_version: number;
  path: string | null;
  ts: number;
  props?: Record<string, unknown> | null;
  timing?: Timing | null;
}

/**
 * Bump when the meaning or shape of any event's `props` changes, so a rollup
 * reading an old row knows which rules it followed. Events outlive the code
 * that wrote them — a tab open since last week is still sending version 1.
 */
const SCHEMA_VERSION = 1;

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
 * The DEVICE id — this browser install, as distinct from the tracking identity.
 *
 * Why a second id rather than reusing `anon_id`: they are reset by different
 * things, and the difference is the signal.
 *
 *   anon_id    the tracking identity. A cookie. Gone when the player clears
 *              cookies, and the one that must be regenerated if consent is
 *              withdrawn.
 *   device_id  the device. Written to BOTH localStorage and a cookie, and
 *              recovered from whichever survives.
 *
 * So "two visitor ids sharing one device_id" reads as one person who cleared
 * their cookies, instead of two unrelated strangers — which is exactly what
 * the shared-device risk screen needs to be able to tell apart.
 *
 * It is deliberately a stored random id and NOT a fingerprint computed from
 * device characteristics. A fingerprint is an arms race, it collides across
 * identical hardware, and it is a far harder conversation with a regulator
 * about consent. A random id the player can erase is both honest and enough.
 */
const deviceId = (): string => {
  const fromCookie = readCookie(DEVICE_COOKIE);

  let fromStore: string | null = null;
  try {
    fromStore = localStorage.getItem(DEVICE_KEY);
  } catch {
    /* Private mode, or storage disabled — the cookie alone still works. */
  }

  const id = fromStore ?? fromCookie ?? uuid();

  // Written back to both every time, so a device that lost one copy is healed
  // from the other rather than silently becoming a new device.
  try {
    if (fromStore !== id) localStorage.setItem(DEVICE_KEY, id);
  } catch {
    /* Ignore. */
  }

  if (fromCookie !== id) {
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${DEVICE_COOKIE}=${id}; Path=/; Max-Age=${COOKIE_MAX_AGE_DAYS * 86400}; SameSite=Lax${secure}`;
  }

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
    // Flagged rather than emitted here: `sessionId()` is called from `send()`
    // too, and firing the event from inside it would queue `session_start`
    // during a flush — into the batch that was already spliced off.
    sessionIsNew = true;
    sessionEnded = false;
    return id;
  } catch {
    // Private mode, or storage disabled. A per-page-load id still produces
    // usable event rows; only the grouping into visits is lost.
    return uuid();
  }
};

/* -------------------------------------------------------------------------- */
/* Session lifecycle                                                           */
/* -------------------------------------------------------------------------- */

/**
 * How often the tab says "still here".
 *
 * This is what makes session duration real. Without it the last thing a visit
 * reported was its final page view, so the time the player then spent on that
 * page — usually the part where they decide what to do — was never counted,
 * and a one-page visit measured zero seconds however long it lasted.
 *
 * 30s is the resolution that costs: one event per half-minute per open tab.
 * Shorter buys precision nobody reads; longer and a short visit rounds to
 * nothing.
 */
const HEARTBEAT_MS = 30_000;

let heartbeat: ReturnType<typeof setInterval> | null = null;
/** Guards against `session_end` being sent twice for one visit. */
let sessionEnded = false;

/**
 * True when `sessionId()` has just minted a new id rather than resumed one.
 *
 * Set by `sessionId()` and read once by `startTracking`, which is the only
 * place that can turn it into a `session_start` event — doing it inside
 * `sessionId()` would emit one from whichever call happened to run first,
 * including the one inside `send()`.
 */
let sessionIsNew = false;

/* -------------------------------------------------------------------------- */
/* Page lifecycle                                                              */
/* -------------------------------------------------------------------------- */

interface OpenPage {
  path: string;
  title: string;
  /** Where the player came from into this page. */
  referrer: string;
  enteredAt: number;
}

/** The page currently being looked at, or null before the first view. */
let openPage: OpenPage | null = null;

/* -------------------------------------------------------------------------- */
/* Acquisition context — sent once per session, on the first batch.            */
/* -------------------------------------------------------------------------- */

let contextSent = false;

/**
 * The landing context, captured ONCE at startup and held.
 *
 * It must not be read at flush time. `send()` runs up to five seconds after
 * the page loaded, and in a single-page app the route can already have changed
 * by then — at which point `location.search` no longer holds the `gclid` the
 * player arrived with, and the link to the ad that was paid for is gone for
 * good. Capturing at startup and sending the stored copy is the difference
 * between measuring paid acquisition and losing it on fast navigation.
 */
let landingContext: Record<string, unknown> | null = null;

const buildContext = (): Record<string, unknown> => {
  if (landingContext !== null) return landingContext;

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

    /*
      Ad-click and affiliate ids.

      These are the only link between a player and the specific ad that was
      paid for; without them "paid traffic" is one undifferentiated bucket and
      cost per acquisition cannot be worked out per campaign.

      They exist for exactly one request — the landing one — and cannot be
      recovered afterwards, which is why they are captured before anything
      that reads them has been built.

      Several affiliate spellings are accepted because affiliate networks do
      not agree on one, and a link built by the affiliate is not something
      Rolluck controls. Missing a real click because the parameter was spelled
      `aff_id` costs far more than reading two extra query keys.
    */
    gclid: params.get('gclid'),
    fbclid: params.get('fbclid'),
    affiliate_id:
      params.get('affiliate_id') ?? params.get('aff_id') ?? params.get('btag') ?? null,
    affiliate_click_id:
      params.get('affiliate_click_id') ?? params.get('click_id') ?? params.get('cid') ?? null,
  };
};

/**
 * Freeze the landing context. Called by `startTracking`, before any route
 * change can occur.
 */
const captureLandingContext = (): void => {
  if (landingContext === null) landingContext = buildContext();
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
    device_id: deviceId(),
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

/**
 * Queue one event, stamping the identity the server dedupes on.
 *
 * `event_id` and `schema_version` are added HERE rather than at each call
 * site. Three callers would be three chances to forget, and an event queued
 * without an id is one the server cannot recognise on a resend — a failure
 * that produces no error, only a quietly inflated count.
 */
const enqueue = (event: Omit<QueuedEvent, 'event_id' | 'schema_version'>): void => {
  if (!enabled) return;

  queue.push({ ...event, event_id: uuid(), schema_version: SCHEMA_VERSION });
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
/**
 * A page was opened.
 *
 * `page_view` doubles as the spec's `page_enter`: it fires at the same moment,
 * carries the same path, and additionally carries the navigation timing. A
 * separate `page_enter` would be a second row per page saying nothing the
 * first does not, and every existing rollup and the Performance screen already
 * filter on `page_view`.
 *
 * The matching `page_exit` — which carries the one thing neither of those has,
 * the time on page — is emitted from here when the NEXT page opens, and from
 * `flush()` for the last page of a visit.
 */
export const trackPageView = (path?: string): void => {
  try {
    const next = path ?? location.pathname;

    // Close the previous page before opening the next one.
    closeOpenPage();

    enqueue({
      name: 'page_view',
      path: next,
      ts: Date.now(),
      timing: collectTiming(),
    });

    openPage = {
      path: next,
      title: document.title,
      // Within a visit the referrer is the page just left, which is more
      // useful than the external one repeated on every row.
      referrer: openPage?.path ?? document.referrer ?? '',
      enteredAt: Date.now(),
    };
  } catch {
    /* Ignore. */
  }
};

/**
 * Emit `page_exit` for the page currently open, if any.
 *
 * Called when another page opens and again when the visit ends, so the final
 * page of a visit — the one closed by shutting the tab, and the one the old
 * duration maths always lost — is measured like every other.
 */
const closeOpenPage = (): void => {
  const page = openPage;
  if (page === null) return;
  openPage = null;

  const seconds = Math.round((Date.now() - page.enteredAt) / 1000);
  // A page left in under a second is a redirect or a mis-click, not a view.
  if (seconds < 1) return;

  enqueue({
    name: 'page_exit',
    path: page.path,
    ts: Date.now(),
    props: {
      duration_seconds: seconds,
      title: page.title,
      referrer: page.referrer,
    },
  });
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
      // Through enqueue, not a direct queue.push: this is the one event that
      // used to bypass it, which would now mean the final vitals of every
      // visit arriving without the id the server dedupes on.
      enqueue({
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

    // FIRST, before anything can navigate away from the landing URL. The
    // gclid, fbclid and affiliate ids live only in that first URL.
    captureLandingContext();

    observeVitals();

    // Minting the id is what decides whether this is a new visit, so it has to
    // happen before the first event is queued.
    sessionId();
    if (sessionIsNew) {
      sessionIsNew = false;
      enqueue({ name: 'session_start', path: location.pathname, ts: Date.now() });
    }

    timer = setInterval(send, FLUSH_INTERVAL_MS);

    // Only while the tab is actually in front. A heartbeat from a backgrounded
    // tab would report a player who walked away two hours ago as still
    // playing, which is worse than the understatement it replaced.
    heartbeat = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      enqueue({ name: 'session_heartbeat', path: location.pathname, ts: Date.now() });
    }, HEARTBEAT_MS);

    // `visibilitychange` to hidden, not `beforeunload`: on mobile a tab is
    // very often killed without ever firing an unload event, and that is the
    // case where the whole visit would otherwise be lost.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') endSession();
    });

    // Belt and braces for desktop, where pagehide does fire reliably.
    window.addEventListener('pagehide', endSession);

    // Coming back to a hidden tab resumes the visit rather than starting a new
    // one — `sessionId()` only rotates after the idle timeout. The flag is
    // cleared so the next hide can close it again.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') sessionEnded = false;
    });
  } catch {
    enabled = false;
  }
};

/**
 * Close the visit: last page's time on page, final vitals, then everything in
 * the queue — all in the one beacon the browser still allows during unload.
 *
 * Guarded, because `visibilitychange` and `pagehide` both fire on a normal
 * close and a visit must not report two endings.
 */
const endSession = (): void => {
  try {
    if (!sessionEnded) {
      sessionEnded = true;
      closeOpenPage();
      enqueue({ name: 'session_end', path: location.pathname, ts: Date.now() });
    }
    flush();
  } catch {
    /* Ignore: see rule 2. */
  }
};

/** Stops the timers. Only the app shell's cleanup needs this. */
export const stopTracking = (): void => {
  if (timer !== null) clearInterval(timer);
  if (heartbeat !== null) clearInterval(heartbeat);
  timer = null;
  heartbeat = null;
  started = false;
};
