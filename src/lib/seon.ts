/**
 * SEON Web Agent — device fingerprinting for the player app.
 *
 * Loads SEON's JavaScript SDK (v6) in the browser and produces the encrypted
 * `session` payload the backend forwards to the Fraud API. That payload is
 * what gives SEON device intelligence: browser and hardware fingerprint,
 * emulator and bot indicators, and — with `init()` called early enough —
 * behavioural signals.
 *
 * ── Design rules ────────────────────────────────────────────────────────
 *
 * **Failure is never fatal.** Ad-blockers, privacy extensions, CSP and flaky
 * networks all stop the script loading, and that is ordinary traffic, not
 * attack traffic. Every function here resolves to `null` rather than throwing,
 * and the caller sends its request without a fingerprint. SEON then scores on
 * IP, email and the rest.
 *
 * **Never blocks the user.** Loading and session generation are bounded by
 * timeouts. A player must never sit watching a spinner because a third-party
 * CDN is slow.
 *
 * **No location prompt.** Geolocation is explicitly disabled. The SDK can ask
 * the browser for precise location, which would raise a permission dialog in
 * the middle of a deposit — startling, and a needless privacy ask when the IP
 * already gives country-level geography.
 *
 * **No secrets.** The agent needs no client key; the licence key stays on the
 * server. Nothing here is sensitive.
 *
 * Sources: docs.seon.io "Device Intelligence" and
 * github.com/seontechnologies/seon-web-sdk-public.
 */

/** The subset of the SDK surface this app uses. */
interface SeonAgent {
  init?: (config?: Record<string, unknown>) => void;
  getSession: (config?: Record<string, unknown>) => Promise<string>;
}

declare global {
  interface Window {
    seon?: SeonAgent;
  }
}

/**
 * Where to load the agent from.
 *
 * SEON publishes the same v6 bundle on three CDNs precisely because the first
 * is widely blocked by tracker-blocking lists. They are tried in order. An
 * account-specific URL can be supplied and is tried first.
 */
const CDN_URLS = [
  'https://cdn.dfsdk.com/js/v6/agent.umd.js',
  'https://cdn.deviceinf.com/js/v6/agent.umd.js',
  'https://cdn.seonintelligence.com/js/v6/agent.umd.js',
];

/** How long to wait for one CDN before trying the next. */
const SCRIPT_TIMEOUT_MS = 4000;

/** How long to wait for a fingerprint before giving up and sending none. */
const SESSION_TIMEOUT_MS = 5000;

/** In-flight load, so concurrent callers share one script tag. */
let loadPromise: Promise<SeonAgent | null> | null = null;

/** Set once `init()` has run, so behavioural collection starts only once. */
let initialised = false;

function scriptUrls(): string[] {
  const configured = process.env.NEXT_PUBLIC_SEON_SCRIPT_URL?.trim();
  return configured ? [configured, ...CDN_URLS] : CDN_URLS;
}

/** Inject one script tag and resolve when it loads, or on error/timeout. */
function loadScript(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${url}"]`);
    if (existing && window.seon) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.async = true;

    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(ok);
    };

    const timer = setTimeout(() => finish(false), SCRIPT_TIMEOUT_MS);

    script.onload = () => finish(Boolean(window.seon));
    script.onerror = () => finish(false);

    document.head.appendChild(script);
  });
}

/**
 * Load the agent, trying each CDN in turn.
 *
 * Resolves to `null` when every source fails — which is a normal outcome for
 * a player running an ad-blocker, not an error worth surfacing.
 */
async function loadAgent(): Promise<SeonAgent | null> {
  if (typeof window === 'undefined') return null;
  if (window.seon) return window.seon;

  for (const url of scriptUrls()) {
    const ok = await loadScript(url);
    if (ok && window.seon) return window.seon;
  }

  return null;
}

/** Load once per page; concurrent callers await the same promise. */
function agent(): Promise<SeonAgent | null> {
  if (!loadPromise) {
    loadPromise = loadAgent().catch(() => null);
  }
  return loadPromise;
}

/**
 * Start the agent early.
 *
 * `init()` begins behavioural data collection, so the earlier it runs the more
 * signal exists by the time a fingerprint is taken. Safe to call repeatedly;
 * it only ever runs once.
 *
 * Call this on first meaningful interaction rather than on page load: it
 * fetches a third-party script, and doing that during initial render competes
 * with the page the player is waiting for.
 */
export async function warmSeonAgent(): Promise<void> {
  const seon = await agent();
  if (!seon || initialised) return;

  try {
    seon.init?.();
    initialised = true;
  } catch {
    // Behavioural collection is a bonus; getSession() works without it.
  }
}

/**
 * Produce a device fingerprint.
 *
 * Returns `null` — never throws — when the agent is unavailable, blocked or
 * slow. Callers send their request regardless.
 */
export async function getDeviceSession(): Promise<string | null> {
  const seon = await agent();
  if (!seon) return null;

  try {
    const session = await withTimeout(
      seon.getSession({
        // Hard-disabled: the SDK can otherwise trigger a browser location
        // prompt mid-flow. Country-level geography already comes from the IP.
        geolocation: { enabled: false, canPrompt: false },
        // Bound the SDK's own internal field collection so it cannot outlast
        // our timeout below.
        fieldTimeoutMs: 3000,
      }),
      SESSION_TIMEOUT_MS
    );

    return typeof session === 'string' && session.length > 0 ? session : null;
  } catch {
    return null;
  }
}

/**
 * The header carrying the fingerprint to the backend.
 *
 * A header rather than a body field on purpose: it keeps a multi-kilobyte
 * opaque blob out of every endpoint's request schema, and means adding the
 * signal to a new flow does not mean changing that flow's validation.
 *
 * Returns an empty object when there is no fingerprint, so it can always be
 * spread into an axios config.
 */
export async function deviceSessionHeaders(): Promise<Record<string, string>> {
  const session = await getDeviceSession();
  return session ? { 'X-Device-Session': session } : {};
}

/** Reject if a promise has not settled in time. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}
