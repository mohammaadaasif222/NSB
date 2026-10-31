/**
 * Sound manager stub for the originals games.
 *
 * The Win-Win source references ~40 named sound effects across all games
 * (dice, mines, crash, etc.). Rather than block the port on wiring every
 * sample, this file exports a no-op function for each one. Real audio can
 * be wired here later without touching any game file.
 *
 * To wire real audio: replace each stub with `return play('/sounds/foo.mp3')`
 * using a shared Audio pool.
 */

const noop = (..._args: unknown[]): void => {
  /* intentionally silent until sound assets land */
};

/** Global master volume (0..1). Hooked up to a real audio pool later. */
export const setGlobalVolume = (_volume: number): void => {
  /* no-op */
};

/* ─── Shared ─── */
export const buttonClickSoundFn = noop;
export const preloadSoundsMines = noop;
export const preloadSoundsDice = noop;

/* ─── Mines ─── */
export const mineDiamond1 = noop;
export const mineDiamond2 = noop;
export const mineDiamond3 = noop;
export const mineDiamond4 = noop;
export const mineDiamond5 = noop;
export const mineDiamond6 = noop;
export const mineMineBomb = noop;
export const mineHoverHiddenBlockHover = noop;
export const GridSizeChangeMin = noop;
export const GridSizeChangeMin2 = noop;

/* ─── Dice ─── */
export const diceSliderSound = noop;
export const diceWinSound = noop;
export const playDiceHexSlideLoop = noop;
export const stopDiceHexSlideLoop = noop;

/* ─── Crash / Plinko / HiLo etc. placeholders ─── */
export const crashCountdownTick = noop;
export const crashCrash = noop;
export const crashCashout = noop;
export const plinkoDrop = noop;
export const plinkoBounce = noop;
export const plinkoWin = noop;
export const hiloFlip = noop;
export const hiloWin = noop;
export const hiloLose = noop;
export const kenoDraw = noop;
export const kenoWin = noop;
export const rouletteSpin = noop;
export const rouletteStop = noop;
