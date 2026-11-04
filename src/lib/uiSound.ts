/**
 * The interface's sound effects.
 *
 * Which file plays for what is not in this code: the console's Sound
 * Management page stores it, and `GET /sounds` returns a map of sound key →
 * file URL. A clickable element names its sound with `data-sound="<key>"`;
 * anything without one plays the generic click. Replacing a sound in the
 * console therefore reaches players without a deploy.
 *
 * Web Audio rather than an <audio> element: an element has to be rewound and
 * re-played for every click, lags on mobile Safari and drops overlapping
 * clicks, where a buffer source is free to start as often as the player taps.
 *
 * Fallbacks, so a click never goes silent by accident:
 *  - Web Audio cannot fetch the file (the bucket sends no CORS headers for
 *    this origin) or decode it → an <audio> element plays it instead;
 *  - the list has not loaded or failed, or the file cannot be played at all
 *    (e.g. an Ogg file on an older Safari) → the synthesised click;
 *  - a key the list does not know → the generic sound;
 *  - a sound switched off in the console → nothing, on purpose.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

/** Level for the synthesised fallback. Keep it low: it plays on every tap. */
const SYNTH_VOLUME = 0.25;

/** Level for recorded sounds, which are mastered quieter than a raw sine. */
const SAMPLE_VOLUME = 0.7;

/**
 * How long a click waits for its file to finish decoding before falling back
 * to the synthesised click. Decoding a few KB takes a few ms; this only
 * matters for the very first click after the page loads.
 */
const DECODE_WAIT_MS = 150;

/** Re-read the list at most this often when the tab comes back into view. */
const REFRESH_AFTER_MS = 2 * 60_000;

/** Plays for any clickable element with no `data-sound` of its own. */
export const GENERIC_SOUND = 'additionalGenericClick';

/** Sounds that are not tied to a click. */
export const POPUP_SOUND = 'PopUpSounds';
export const CLOSE_SOUND = 'close';

interface SoundList {
  generic: string;
  /** null = switched off in the console. */
  sounds: Record<string, string | null>;
  version: string;
}

let list: SoundList | null = null;
let listLoadedAt = 0;
let listRequest: Promise<void> | null = null;

let ctx: AudioContext | null = null;

/** Downloaded bytes, by URL. Fetched before the first tap so it is ready. */
const bytesByUrl = new Map<string, Promise<ArrayBuffer | null>>();
/** Decoded audio, by URL. Null when the file could not be fetched or decoded. */
const buffers = new Map<string, AudioBuffer | null>();
const decoding = new Map<string, Promise<AudioBuffer | null>>();

/**
 * The fallback player, by URL: an <audio> element. Unlike fetch(), it may
 * play a file from another origin that sends no CORS headers — so when the
 * bucket does not allow the site's origin, sounds still play, just through
 * the element. A URL in `brokenUrls` cannot be played at all.
 */
const elements = new Map<string, HTMLAudioElement>();
const brokenUrls = new Set<string>();

const elementFor = (url: string): HTMLAudioElement => {
  let el = elements.get(url);
  if (!el) {
    el = new Audio();
    el.preload = 'auto';
    el.volume = SAMPLE_VOLUME;
    el.addEventListener('error', () => brokenUrls.add(url));
    el.src = url;
    elements.set(url, el);
  }
  return el;
};

/** False when the element cannot play this file either. */
const playElement = (url: string): boolean => {
  if (brokenUrls.has(url)) return false;
  const base = elementFor(url);
  // A sound still playing is left to finish; a quick second tap gets a copy.
  const el = base.paused || base.ended ? base : (base.cloneNode() as HTMLAudioElement);
  el.volume = SAMPLE_VOLUME;
  el.currentTime = 0;
  el.play().catch(() => {
    // Not a format this browser plays (not an autoplay refusal: this runs on a tap).
    if (el.error) brokenUrls.add(url);
  });
  return true;
};

/**
 * Set when fetch() of a sound throws — the bucket does not send CORS headers
 * for this origin. Every later file goes straight to the element, rather than
 * logging one blocked request per sound on each page load.
 */
let crossOriginBlocked = false;

const fetchBytes = (url: string): Promise<ArrayBuffer | null> => {
  let pending = bytesByUrl.get(url);
  if (!pending) {
    // The files are immutable on S3, so the browser cache serves repeat visits.
    pending = (crossOriginBlocked ? Promise.resolve(null) : fetch(url))
      .then((res) => (res?.ok ? res.arrayBuffer() : null))
      .catch(() => {
        // A thrown fetch is a network or CORS refusal, not a missing file.
        crossOriginBlocked = true;
        return null;
      })
      .then((bytes) => {
        // Blocked (CORS) or failed: get the element ready instead.
        if (!bytes) elementFor(url);
        return bytes;
      });
    bytesByUrl.set(url, pending);
  }
  return pending;
};

const decode = (audio: AudioContext, url: string): Promise<AudioBuffer | null> => {
  let pending = decoding.get(url);
  if (!pending) {
    pending = fetchBytes(url)
      // decodeAudioData detaches its input, so it gets a copy.
      .then((bytes) => (bytes ? audio.decodeAudioData(bytes.slice(0)) : null))
      .catch(() => null)
      .then((buffer) => {
        buffers.set(url, buffer);
        return buffer;
      });
    decoding.set(url, pending);
  }
  return pending;
};

/** Every playable URL in the list. */
const urlsOf = (current: SoundList): string[] =>
  Array.from(new Set(Object.values(current.sounds).filter((url): url is string => !!url)));

/**
 * Loads (or refreshes) the sound list and starts downloading the files, so
 * they are on hand by the first tap. Safe to call often: it does nothing while
 * the list is fresh.
 */
export const loadSounds = (force = false): Promise<void> => {
  if (typeof window === 'undefined') return Promise.resolve();
  if (listRequest) return listRequest;
  if (!force && list && Date.now() - listLoadedAt < REFRESH_AFTER_MS) return Promise.resolve();

  listRequest = fetch(`${API_BASE}/sounds`)
    .then((res) => (res.ok ? res.json() : null))
    .then((body: { success?: boolean; data?: SoundList } | null) => {
      const next = body?.success ? body.data : null;
      if (!next || typeof next.sounds !== 'object') return;
      list = next;
      listLoadedAt = Date.now();
      // One file first: if the bucket refuses this origin, the rest skip
      // fetch() and preload as elements.
      const [first, ...rest] = urlsOf(next);
      if (!first) return;
      void fetchBytes(first).then(() => {
        for (const url of rest) void fetchBytes(url);
        // Once audio is running, decode new files straight away too.
        if (ctx) for (const url of urlsOf(next)) void decode(ctx, url);
      });
    })
    .catch(() => {
      // Keep the last list, or the synthesised click if there never was one.
    })
    .finally(() => {
      listRequest = null;
    });
  return listRequest;
};

/**
 * The context is made on the first tap, not at import: browsers refuse to
 * start audio before a user gesture, and the module also loads on the server.
 */
const getContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    if (list) for (const url of urlsOf(list)) void decode(ctx, url);
  }
  // Suspended until a gesture, and again after iOS backgrounds the tab.
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
};

const playSynth = (audio: AudioContext): void => {
  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1400, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);

  // 2 ms attack so it does not pop, then a quick decay.
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(SYNTH_VOLUME, now + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

  osc.connect(gain).connect(audio.destination);
  osc.start(now);
  osc.stop(now + 0.08);
};

const playBuffer = (audio: AudioContext, buffer: AudioBuffer): void => {
  const source = audio.createBufferSource();
  const gain = audio.createGain();
  source.buffer = buffer;
  gain.gain.value = SAMPLE_VOLUME;
  source.connect(gain).connect(audio.destination);
  source.start();
};

/**
 * The URL to play for `key`: undefined when the list does not know the sound
 * (or has not loaded), null when the console switched it off.
 */
const resolve = (key: string): string | null | undefined => {
  if (!list) return undefined;
  if (key in list.sounds) return list.sounds[key];
  const generic = list.generic || GENERIC_SOUND;
  return generic in list.sounds ? list.sounds[generic] : undefined;
};

interface PlayOptions {
  /**
   * Play the synthesised click when the file is unavailable. On for clicks,
   * which always clicked; off for sounds that used not to exist at all, such
   * as a popup opening, so those stay silent rather than blip.
   */
  fallback?: boolean;
  /**
   * Only play if the player has already interacted with the page. A popup that
   * opens by itself on load must not try to start audio, which browsers block.
   */
  afterGesture?: boolean;
}

export const playSound = (
  key: string,
  { fallback = true, afterGesture = false }: PlayOptions = {}
): void => {
  if (typeof window === 'undefined') return;
  if (afterGesture && !ctx) {
    const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } })
      .userActivation;
    if (!activation?.hasBeenActive) return;
  }

  const audio = getContext();
  if (!audio) return;

  const url = resolve(key);
  if (url === null) return; // Switched off in the console.
  if (url === undefined) {
    if (fallback) playSynth(audio);
    return;
  }

  const ready = buffers.get(url);
  if (ready) {
    playBuffer(audio, ready);
    return;
  }
  if (ready === null) {
    // Web Audio could not have it (blocked by CORS, or not decodable): try
    // the <audio> element, and only then the synthesised click.
    if (!playElement(url) && fallback) playSynth(audio);
    return;
  }

  // Still decoding (first tap after load): wait briefly, then use the
  // element for this tap. The decoded copy stays cached for the next one.
  const timeout = new Promise<'late'>((done) => setTimeout(() => done('late'), DECODE_WAIT_MS));
  void Promise.race([decode(audio, url), timeout]).then((buffer) => {
    if (buffer && buffer !== 'late') playBuffer(audio, buffer);
    else if (!playElement(url) && fallback) playSynth(audio);
  });
};

/** The generic click; kept for callers that predate named sounds. */
export const playClick = (): void => playSound(GENERIC_SOUND);

/**
 * What counts as something the player clicked. Text inputs are included so
 * focusing a field ticks too. Anything can opt in with `data-sound`, or out
 * with `data-sound="off"` on itself or an ancestor.
 */
const INTERACTIVE = [
  'button',
  'a[href]',
  'summary',
  'select',
  'input',
  'textarea',
  'label',
  '[role="button"]',
  '[role="link"]',
  '[role="tab"]',
  '[role="switch"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="option"]',
  '[role="menuitem"]',
  '[data-sound]',
].join(',');

/** The element that should click for this event, or null for none. */
export const soundTarget = (target: EventTarget | null): Element | null => {
  if (!(target instanceof Element)) return null;
  if (target.closest('[data-sound="off"]')) return null;

  const el = target.closest(INTERACTIVE);
  if (!el) return null;
  if (el.matches(':disabled') || el.getAttribute('aria-disabled') === 'true') return null;
  return el;
};

/** The sound key an element asks for, or the generic one. */
export const soundKeyOf = (el: Element): string => el.getAttribute('data-sound') || GENERIC_SOUND;

/**
 * A dialog that should play the popup sound when it appears. Popovers that
 * open from a button of their own opt out with `data-sound-popup="off"`.
 */
export const POPUP_SELECTOR = '[aria-modal="true"]:not([data-sound-popup="off"])';
