/**
 * The interface's click sound.
 *
 * Web Audio rather than an <audio> element: an element has to be rewound and
 * re-played for every click, lags on mobile Safari and drops overlapping
 * clicks, where a buffer source is free to start as often as the player taps.
 *
 * With no sample configured the click is synthesised — a short pitch-dropping
 * blip — so the feature works without shipping an asset. To use a recorded
 * sound instead, upload it to the asset bucket and point CLICK_SAMPLE_URL at
 * it; if it fails to load, the synthesised click carries on.
 */

/** e.g. `${ASSET_CDN}/sounds/click.mp3`. Null plays the synthesised click. */
const CLICK_SAMPLE_URL: string | null = null;

/** Master level. Keep it low: this plays on every tap. */
const VOLUME = 0.25;

let ctx: AudioContext | null = null;
let sample: AudioBuffer | null = null;
let sampleRequested = false;

/**
 * The context is made on the first click, not at import: browsers refuse to
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
  }
  // Suspended until a gesture, and again after iOS backgrounds the tab.
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
};

const loadSample = (audio: AudioContext): void => {
  if (!CLICK_SAMPLE_URL || sampleRequested) return;
  sampleRequested = true;
  fetch(CLICK_SAMPLE_URL)
    .then((res) => res.arrayBuffer())
    .then((data) => audio.decodeAudioData(data))
    .then((buffer) => {
      sample = buffer;
    })
    .catch(() => {
      // Stay on the synthesised click.
    });
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
  gain.gain.exponentialRampToValueAtTime(VOLUME, now + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

  osc.connect(gain).connect(audio.destination);
  osc.start(now);
  osc.stop(now + 0.08);
};

export const playClick = (): void => {
  const audio = getContext();
  if (!audio) return;
  loadSample(audio);

  if (!sample) {
    playSynth(audio);
    return;
  }

  const source = audio.createBufferSource();
  const gain = audio.createGain();
  source.buffer = sample;
  gain.gain.value = VOLUME;
  source.connect(gain).connect(audio.destination);
  source.start();
};

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
