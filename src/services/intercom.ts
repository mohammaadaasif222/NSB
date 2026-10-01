import type { IntercomDisplayAttributes } from '@/types/intercom';

/**
 * Intercom messenger loader.
 *
 * Three rules shape this file:
 *
 * 1. Nothing is downloaded on page load. The Intercom bundles cost roughly
 *    440 ms of main-thread CPU and four network requests, which a lobby page
 *    should not pay for. The script is fetched only after the visitor's first
 *    real interaction, or immediately when they click a support entry point.
 *    A visitor who never interacts never downloads Intercom.
 * 2. Every failure is survivable. A missing App ID, a missing identity token,
 *    an ad-blocker eating the script — each one degrades to "no chat", never
 *    to a broken page or an unhandled rejection.
 * 3. The browser only ever sends cosmetic attributes. VIP tier, account status
 *    and wagering are written to Intercom by the API, because a payload that
 *    travels through the page is a payload the player can rewrite. The backend
 *    decides what lands here; this file forwards it and never invents a field.
 */

type IntercomCommand = (command: string, payload?: unknown) => void;

declare global {
  interface Window {
    Intercom?: IntercomCommand;
  }
}

export interface IntercomIdentity {
  /** Straight from GET /intercom/identity. */
  attributes: IntercomDisplayAttributes;
  /** The JWT signed by the API. Absent means the player is unverified. */
  token?: string;
}

const INTERACTION_EVENTS = ['click', 'keydown', 'touchstart', 'scroll'] as const;

/**
 * Supplied at runtime by GET /intercom/settings, not baked into the bundle.
 *
 * That is what makes the System config switch mean something: an operator can
 * turn Intercom on and have it appear, instead of flipping a switch that does
 * nothing until someone rebuilds the frontend.
 */
let appId = '';

/**
 * Who the messenger should identify, and any page context added on top.
 *
 * Kept as inputs and turned into a payload only when one is needed — never
 * cached as a built object. The App ID arrives after this module is first
 * evaluated, so anything built eagerly would be stamped with an empty one and
 * quietly boot the wrong workspace.
 */
let currentIdentity: IntercomIdentity | null = null;
let extraAttributes: Record<string, unknown> = {};

let loadPromise: Promise<void> | null = null;
let lazyArmed = false;
let booted = false;
let scriptLoaded = false;

/** Guards against re-sending a payload the widget already has. */
let appliedFingerprint = '';

/** False until the API supplies an App ID — every entry point then no-ops. */
export const isIntercomConfigured = (): boolean => appId.length > 0;

/**
 * Records the App ID the API reported. Safe to call repeatedly with the same
 * value; a *different* one after the script has loaded is ignored, because
 * Intercom binds the workspace at boot and re-pointing it needs a full reload
 * rather than an `update`.
 */
export function configureIntercom(id: string): void {
  if (!id || id === appId) return;

  if (scriptLoaded) {
    console.warn('[intercom] App ID changed after the widget loaded; ignoring until reload');
    return;
  }

  appId = id;
}

/**
 * The payload handed to `boot` / `update`.
 *
 * Our own launcher is used instead of Intercom's, so it can sit with the rest
 * of the Rolluck chrome and disappear the moment an operator switches chat off.
 */
function currentSettings(): Record<string, unknown> {
  const base: Record<string, unknown> = {
    app_id: appId,
    hide_default_launcher: true,
  };

  if (!currentIdentity) return { ...base, ...extraAttributes };

  return {
    ...base,
    ...currentIdentity.attributes,
    // The claim that makes Intercom trust the identity above. Without it the
    // player is just an anonymous visitor who typed a name.
    ...(currentIdentity.token ? { intercom_user_jwt: currentIdentity.token } : {}),
    ...extraAttributes,
  };
}

type IntercomStub = IntercomCommand & { q: unknown[]; c: (args: unknown) => void };

/**
 * Installs Intercom's command queue before the script is fetched.
 *
 * Not optional boilerplate: `widget.js` does not define `window.Intercom`
 * itself. It looks for the stub the official snippet leaves behind and flushes
 * whatever was queued on it. Skip this and the script still loads with a 200,
 * `window.Intercom` stays undefined, and every call is swallowed — a failure
 * with no error anywhere to explain it.
 */
function installCommandQueue(): void {
  if (typeof window.Intercom === 'function') return;

  const stub = function (...args: unknown[]) {
    stub.c(args);
  } as IntercomStub;

  stub.q = [];
  stub.c = (args: unknown) => {
    stub.q.push(args);
  };

  window.Intercom = stub;
}

/**
 * Downloads the widget. Resolves either way — a blocked script is a normal
 * outcome here, not an error, so callers never need a try/catch.
 */
function loadScript(): Promise<void> {
  if (loadPromise) return loadPromise;

  // Before the request goes out, so anything called while it is in flight is
  // queued rather than lost.
  installCommandQueue();

  loadPromise = new Promise<void>((resolve) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://widget.intercom.io/widget/${appId}`;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    // Ad-blockers take this path, and it is common enough to be normal.
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });

  return loadPromise;
}

function applySettings(): void {
  const intercom = window.Intercom;
  if (typeof intercom !== 'function') return;

  const payload = currentSettings();
  const fingerprint = JSON.stringify(payload);

  // React re-renders, StrictMode's double-invoke and a re-fetched identity that
  // happens to be identical all land here. Booting is a real cost; re-sending a
  // payload the widget already has is pure waste.
  if (booted && fingerprint === appliedFingerprint) return;

  intercom(booted ? 'update' : 'boot', payload);
  appliedFingerprint = fingerprint;
  booted = true;
}

/** Arms the "load on first interaction" listeners. Safe to call repeatedly. */
function armLazyLoad(): void {
  if (typeof window === 'undefined' || lazyArmed || loadPromise || !isIntercomConfigured()) {
    return;
  }

  lazyArmed = true;

  const onFirstInteraction = (): void => {
    INTERACTION_EVENTS.forEach((event) => window.removeEventListener(event, onFirstInteraction));
    void ensureIntercom();
  };

  INTERACTION_EVENTS.forEach((event) =>
    window.addEventListener(event, onFirstInteraction, { passive: true })
  );
}

/**
 * Held while a signed-in player's identity is still being fetched.
 *
 * Without this, clicking support in that window boots the messenger as an
 * anonymous visitor and only identifies them on the follow-up `update` — which
 * starts the conversation under a guest record and loses the verification the
 * whole design exists to provide.
 */
let identityGate: Promise<void> | null = null;
let openGate: (() => void) | null = null;

/** Called when a session exists and its identity request is in flight. */
export function holdForIdentity(): void {
  if (identityGate) return;
  identityGate = new Promise<void>((resolve) => {
    openGate = resolve;
  });
}

/** Called when that request settles, whether it succeeded or not. */
export function releaseIdentity(): void {
  openGate?.();
  identityGate = null;
  openGate = null;
}

/** A hung identity request must delay chat, never deny it. */
const GATE_TIMEOUT_MS = 4_000;

/** Forces the widget to load right now, then applies the pending settings. */
export async function ensureIntercom(): Promise<void> {
  if (!isIntercomConfigured()) return;

  if (identityGate) {
    await Promise.race([
      identityGate,
      new Promise<void>((resolve) => setTimeout(resolve, GATE_TIMEOUT_MS)),
    ]);
  }

  await loadScript();
  applySettings();
}

/**
 * Records who the messenger should identify. The script is NOT downloaded
 * here — that waits for an interaction or a support entry point.
 *
 * Pass null for a signed-out visitor: they still get chat, just anonymously.
 */
export function bootIntercom(identity?: IntercomIdentity | null): void {
  if (!isIntercomConfigured()) return;

  currentIdentity = identity ?? null;

  if (scriptLoaded) {
    applySettings();
    return;
  }

  armLazyLoad();
}

/**
 * Sends extra attributes to an already-booted widget.
 *
 * Reserved for genuinely client-side context — the page the player is stuck
 * on, the step of a flow they abandoned. Anything an agent would act on does
 * NOT belong here: the player can call this themselves from the console.
 */
export function updateIntercom(attributes: Record<string, unknown>): void {
  if (!isIntercomConfigured()) return;

  extraAttributes = { ...extraAttributes, ...attributes };
  if (booted) applySettings();
}

/**
 * Ends the chat session on sign-out, so the next player on this browser cannot
 * read the previous player's conversation. A guest session takes its place.
 */
export function shutdownIntercom(): void {
  if (!isIntercomConfigured()) return;

  if (booted && typeof window.Intercom === 'function') {
    window.Intercom('shutdown');
    booted = false;
  }

  currentIdentity = null;
  extraAttributes = {};
  appliedFingerprint = '';

  if (scriptLoaded) applySettings();
}

/** Support entry point: the launcher, the footer, a KYC or closure flow. */
export async function showIntercom(): Promise<void> {
  await ensureIntercom();
  window.Intercom?.('show');
}

/** Support entry point that opens straight into a composer. */
export async function showIntercomNewMessage(message = ''): Promise<void> {
  await ensureIntercom();
  window.Intercom?.('showNewMessage', message);
}
