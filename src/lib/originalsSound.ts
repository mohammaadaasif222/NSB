// @ts-nocheck
// Ported from Win-Win-user/src/sound/soundManager.js. Original audio graph (Web Audio API)
// preserved verbatim; asset URLs rewritten to Next.js /public paths.
// src/sounds/soundManager.js

const cardSlideSound = "/assets/sound/card-slide.ogg";
const cardShuffleSound = "/assets/sound/card-shuffle.ogg";
const cardPlacingSound = "/assets/sound/card-placing.ogg";
const cardPlacedSound = "/assets/sound/card-placed.ogg";
const cardFlipSound = "/assets/sound/card-flip.ogg";
const buttonClickSound = "/assets/sound/button-click.ogg";
const cardSetRemoving = "/assets/sound/card-set-removing.ogg";
const MineBomb = "/assets/sound/bomb.ogg";
const diamond1 = "/assets/sound/diamond1.ogg";
const diamond2 = "/assets/sound/diamond2.ogg";
const diamond3 = "/assets/sound/diamond3.ogg";
const diamond4 = "/assets/sound/diamond4.ogg";
const diamond5 = "/assets/sound/diamond5.ogg";
const diamond6 = "/assets/sound/diamond6.ogg";
const GridSizeChangeMine = "/assets/sound/mine_gems setting window.ogg";
const GridSizeChangeMine2 = "/assets/sound/mineGameSettingTiels.ogg";
const hiddenBlockHoverMine = "/assets/sound/hidden block highlighting when pointer reach.ogg";
const DiceSlider = "/assets/sound/dice-slider.ogg";
const DiceWin = "/assets/sound/dice-win.ogg";
const coinFlipCoinSpin = "/assets/sound/coinFlip  coin spin.ogg";
const coinFlipMinusPoint = "/assets/sound/coinFlip  point minus.ogg";
const coinFlipPlusPoint = "/assets/sound/coinFlip  point plus.ogg";
const coinFlipAutoWrongCombination = "/assets/sound/coinFlip  wrong combination.ogg";
const coinFlipAutoRightCombination = "/assets/sound/coinFlip automode toggling.ogg";
const DiceHexSlide = "/assets/sound/dice-hex-slide.ogg";
const HiloShakeDeck = "/assets/sound/cardshakeHilo.ogg";
const plinkoPinTouch = "/assets/sound/plinkoPinTuch.ogg";
const plinkoBinInBasket = "/assets/sound/plinkoBininBasket.ogg";
const rouletteSpin = "/assets/sound/roulettespin.ogg";
const rouletteTripleRoo = "/assets/sound/roulette roo triple model.ogg";
const roulettePositiveResult = "/assets/sound/roulette positive result.ogg";
const rouletteNegativeResult = "/assets/sound/roulette negative result.ogg";
const kenoAutoPick = "/assets/sound/keno autopick play for each box.ogg";
const kenoClearTable = "/assets/sound/keno clear table.ogg";
const kenoGemOpen = "/assets/sound/keno gem open in box.ogg";
const kenoNormalReveal = "/assets/sound/keno normal number revealing.ogg";
// The player's choice, kept on this device. Sound is on unless they switched
// it off in the game's settings; it is separate from the site's interface
// sounds, which start off.
const MUTE_KEY = 'originals_sound'; // 'off' = muted
const VOLUME_KEY = 'originals_volume';
const readStored = (key) => {
  try {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
  } catch {
    return null;
  }
};
const writeStored = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private mode or blocked storage: the choice lasts for this page only.
  }
};
const storedVolume = parseFloat(readStored(VOLUME_KEY) ?? '');

let globalVolume = Number.isFinite(storedVolume) ? Math.max(0, Math.min(1, storedVolume)) : 1; // 0 = muted, 1 = full

let isMuted = readStored(MUTE_KEY) === 'off';
let soundQueue = [];
let isPlayingQueue = false;
let soundCooldown = {};
let queueTimeoutId = null;

let audioCtx;
const soundCache = {}; // stores decoded AudioBuffers
const activeLoops = {}; // store active loop sources by id


export const setGlobalVolume = (value) => {
  globalVolume = Math.max(0, Math.min(1, value)); // clamp between 0-1
  writeStored(VOLUME_KEY, String(globalVolume));
};
export const getGlobalVolume = () => globalVolume;


// 🔹 Preload all sounds into memory
export const preloadSoundsMines = async () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  const sounds = {
    diamond1,
    diamond2,
    diamond3,
    diamond4,
    diamond5,
    diamond6,
    GridSizeChangeMine,
    MineBomb,
    buttonClickSound,
    hiddenBlockHoverMine,
    GridSizeChangeMine2
  };

  for (const [key, src] of Object.entries(sounds)) {
    if (!soundCache[key]) {
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      soundCache[key] = audioBuffer;
    }
  }
};
export const preloadSoundsCrash = async () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  const sounds = {
    GridSizeChangeMine,
    buttonClickSound,
  };

  for (const [key, src] of Object.entries(sounds)) {
    if (!soundCache[key]) {
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      soundCache[key] = audioBuffer;
    }
  }
};
export const preloadSoundsHelo = async () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  const sounds = {
    GridSizeChangeMine,
    buttonClickSound,
    HiloShakeDeck,
    cardSlideSound,
    cardFlipSound,
  };

  for (const [key, src] of Object.entries(sounds)) {
    if (!soundCache[key]) {
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      soundCache[key] = audioBuffer;
    }
  }
};
export const preloadSoundsDice = async () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  const sounds = {
    buttonClickSound,
    DiceSlider,
    DiceWin,
    DiceHexSlide,
  };

  for (const [key, src] of Object.entries(sounds)) {
    if (!soundCache[key]) {
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      soundCache[key] = audioBuffer;
    }
  }
};
export const preloadSoundsPlinko = async () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  const sounds = {
    buttonClickSound,
    plinkoPinTouch,
    plinkoBinInBasket,
  };

  for (const [key, src] of Object.entries(sounds)) {
    if (!soundCache[key]) {
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      soundCache[key] = audioBuffer;
    }
  }
};
export const preloadSoundsCoinFlip = async () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  const sounds = {
    buttonClickSound,
    DiceWin,
    coinFlipCoinSpin,
    coinFlipMinusPoint,
    coinFlipPlusPoint,
    coinFlipAutoWrongCombination,
    coinFlipAutoRightCombination,
    GridSizeChangeMine,
    hiddenBlockHoverMine
  };

  for (const [key, src] of Object.entries(sounds)) {
    if (!soundCache[key]) {
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      soundCache[key] = audioBuffer;
    }
  }
};
export const preloadSoundsRoulette = async () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  const sounds = {
    buttonClickSound,
    rouletteSpin,
    rouletteTripleRoo,
    roulettePositiveResult,
    rouletteNegativeResult,
  };

  for (const [key, src] of Object.entries(sounds)) {
    if (!soundCache[key]) {
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      soundCache[key] = audioBuffer;
    }
  }
};
export const preloadSoundsKeno = async () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  const sounds = {
    buttonClickSound,
    kenoAutoPick,
    kenoClearTable,
    kenoGemOpen,
    kenoNormalReveal,
    GridSizeChangeMine
  };

  for (const [key, src] of Object.entries(sounds)) {
    if (!soundCache[key]) {
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      soundCache[key] = audioBuffer;
    }
  }
};
export const preloadSounds = async () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  const sounds = {
    cardSlideSound,
    cardShuffleSound,
    cardPlacingSound,
    cardPlacedSound,
    cardFlipSound,
    buttonClickSound,
    cardSetRemoving,
  };

  for (const [key, src] of Object.entries(sounds)) {
    if (!soundCache[key]) {
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      soundCache[key] = audioBuffer;
    }
  }
};

// 🔹 Core sound play function
const playSound = (key, volume = 0.5) => {
  if (isMuted || !soundCache[key] || !audioCtx) return;

  const source = audioCtx.createBufferSource();
  source.buffer = soundCache[key];

  const gainNode = audioCtx.createGain();
  gainNode.gain.value = volume * globalVolume;

  source.connect(gainNode).connect(audioCtx.destination);
  source.start(0);

  return new Promise(resolve => {
    source.onended = resolve;
  });
};

// Play a sound in a loop (returns loopId key)
const playLoopSound = (key, volume = 1, loopId = 'loop') => {
  if (isMuted || !soundCache[key] || !audioCtx) return null;

  // if there's already a loop for this id, stop it first
  if (activeLoops[loopId]) {
    try { activeLoops[loopId].stop(); } catch (e) { }
    delete activeLoops[loopId];
  }

  const source = audioCtx.createBufferSource();
  source.buffer = soundCache[key];
  source.loop = true;

  const gainNode = audioCtx.createGain();
  gainNode.gain.value = volume * globalVolume;

  source.connect(gainNode).connect(audioCtx.destination);
  source.start(0);

  activeLoops[loopId] = source;
  return loopId;
};

const stopLoopSound = (loopId) => {
  const src = activeLoops[loopId];
  if (src) {
    try { src.stop(); } catch (e) { }
    delete activeLoops[loopId];
  }
};

// 🔹 Queue processor
const processSoundQueue = async () => {
  if (isPlayingQueue || soundQueue.length === 0) return;

  isPlayingQueue = true;

  while (soundQueue.length > 0) {
    const { key, volume, delay, soundId } = soundQueue.shift();

    // Cooldown check
    const now = Date.now();
    if (soundCooldown[soundId] && (now - soundCooldown[soundId]) < 100) {
      continue;
    }
    soundCooldown[soundId] = now;

    // Optional delay before playing
    if (delay > 0) {
      await new Promise(resolve => {
        queueTimeoutId = setTimeout(resolve, delay);
      });
    }

    await playSound(key, volume);

    // Small gap between sounds
    await new Promise(resolve => {
      queueTimeoutId = setTimeout(resolve, 50);
    });
  }

  isPlayingQueue = false;
  queueTimeoutId = null;
};

const addSoundToQueue = (key, volume = 1, delay = 0, soundId = 'default') => {
  soundQueue.push({ key, volume, delay, soundId });
  processSoundQueue();
};

// 🔹 Immediate play (ignores queue)
const playImmediateSound = (key, volume = 1, soundId = 'immediate', OverLap) => {
  if (isMuted || !soundCache[key]) return;

  const now = Date.now();
  if (soundCooldown[soundId] && (now - soundCooldown[soundId]) < 100) {
    if (["mines", "dice", "coinFlip", "helo", "plinko", "roulette", "keno"].includes(OverLap)) {
      soundCooldown[soundId] = now;
      playSound(key, volume);
    }
    return;
  }
  soundCooldown[soundId] = now;

  playSound(key, volume);
};

// ---- Exported sound functions ----
export const playCardSlideSound = (useQueue = false, delay = 0) => {
  const id = `slide_${Date.now()}`;
  useQueue ? addSoundToQueue("cardSlideSound", 1, delay, id)
    : playImmediateSound("cardSlideSound", 1, "slide");
};

export const playShuffleSound = (useQueue = false, delay = 0) => {
  const id = `shuffle_${Date.now()}`;
  useQueue ? addSoundToQueue("cardShuffleSound", 1, delay, id)
    : playImmediateSound("cardShuffleSound", 1, "shuffle");
};

export const playCardPlacingSound = (useQueue = false, delay = 0) => {
  const id = `placing_${Date.now()}`;
  useQueue ? addSoundToQueue("cardPlacingSound", 1, delay, id)
    : playImmediateSound("cardPlacingSound", 1, "placing");
};

export const playCardPlacedSound = (useQueue = false, delay = 0) => {
  const id = `placed_${Date.now()}`;
  useQueue ? addSoundToQueue("cardPlacedSound", 1, delay, id)
    : playImmediateSound("cardPlacedSound", 1, "placed");
};

export const playCardFlipSound = (useQueue = false, delay = 0) => {
  const id = `flip_${Date.now()}`;
  useQueue ? addSoundToQueue("cardFlipSound", 1, delay, id)
    : playImmediateSound("cardFlipSound", 1, "flip");
};

// helo
export const HeloShakeDeckFn = (useQueue = false, delay = 0) => {
  const id = `heloShake_${Date.now()}`;
  useQueue
    ? addSoundToQueue("HiloShakeDeck", 1, delay, id)
    : playImmediateSound("HiloShakeDeck", 1, "heloShake", "helo");
};

// plinko
export const plinkoPinTouchFn = () => playImmediateSound("plinkoPinTouch", 0.6, "plinkoPin", "plinko");
export const plinkoBinInBasketFn = () => playImmediateSound("plinkoBinInBasket", 1, "plinkoBin", "plinko");

export const buttonClickSoundFn = () => playImmediateSound("buttonClickSound", 1, "button");
export const cardSetRemovingFn = () => playImmediateSound("cardSetRemoving", 1, "remove");
// mines
export const mineHoverHiddenBlockHover = () => playImmediateSound("hiddenBlockHoverMine", 1, "button", "mines");
export const mineMineBomb = () => playImmediateSound("MineBomb", 1, "button", "mines");
export const mineDiamond1 = () => playImmediateSound("diamond1", 1, "button", "mines");
export const mineDiamond2 = () => playImmediateSound("diamond2", 1, "button", "mines");
export const mineDiamond3 = () => playImmediateSound("diamond3", 1, "button", "mines");
export const mineDiamond4 = () => playImmediateSound("diamond4", 1, "button", "mines");
export const mineDiamond5 = () => playImmediateSound("diamond5", 1, "button", "mines");
export const mineDiamond6 = () => playImmediateSound("diamond6", 1, "button", "mines");
export const GridSizeChangeMin = () => playImmediateSound("GridSizeChangeMine", 1, "button", "mines");
export const GridSizeChangeMin2 = () => playImmediateSound("GridSizeChangeMine2", 1, "button", "mines");

// soundManager.js - Dice section update

// Dice hex slide loop: use a proper AudioBufferSourceNode loop
let isDiceHexPlaying = false;

export const playDiceHexSlideLoop = () => {
  if (isDiceHexPlaying) return;
  isDiceHexPlaying = true;
  // console.log('🔊 Dice hex loop START');

  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  // resume if suspended (autoplay policies)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => { });
  }

  // start loop asynchronously; ensure buffer is available
  (async () => {
    try {
      if (!soundCache.DiceHexSlide) {
        const response = await fetch(DiceHexSlide);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        soundCache.DiceHexSlide = audioBuffer;
      }

      if (isMuted || !isDiceHexPlaying) return;

      // use existing helper to start a looping source
      playLoopSound('DiceHexSlide', 0.15, 'diceHexLoop');
    } catch (err) {
      console.debug('playDiceHexSlideLoop error:', err);
      isDiceHexPlaying = false;
    }
  })();
};

export const stopDiceHexSlideLoop = () => {
  // console.log('🔇 Dice hex loop STOP');
  isDiceHexPlaying = false;
  stopLoopSound('diceHexLoop');
};

// Dice sounds (same as before)
export const diceSliderSound = () => playImmediateSound("DiceSlider", 0.2, "button", "dice");
export const diceWinSound = () => playImmediateSound("DiceWin", 0.4, "button", "dice");
export const diceHexSlideSound = () => playImmediateSound("DiceHexSlide", 1, "button", "dice");

// coin flip
export const rouletteSpinFn = () => playImmediateSound("rouletteSpin", 1, "rouletteSpin", "roulette");
export const rouletteTripleRooFn = () => playImmediateSound("rouletteTripleRoo", 1, "rouletteTripleRoo", "roulette");
export const roulettePositiveResultFn = () => playImmediateSound("roulettePositiveResult", 1, "roulettePositive", "roulette");
export const rouletteNegativeResultFn = () => playImmediateSound("rouletteNegativeResult", 1, "rouletteNegative", "roulette");

export const CoinFlipCoinSpinFn = () => playImmediateSound("coinFlipCoinSpin", 1, "button", "coinFlip");
export const coinFlipMinusPointFn = () => playImmediateSound("coinFlipMinusPoint", 1, "button", "coinFlip");
export const coinFlipPlusPointFn = () => playImmediateSound("coinFlipPlusPoint", 1, "button", "coinFlip");
export const coinFlipAutoWrongCombinationFn = () => playImmediateSound("coinFlipAutoWrongCombination", 1, "button", "coinFlip");
export const coinFlipAutoRightCombinationFn = () => playImmediateSound("coinFlipAutoRightCombination", 1, "button", "coinFlip");

// keno
export const kenoAutoPickFn = () => playImmediateSound("kenoAutoPick", 1, "kenoAutoPick", "keno");
export const kenoClearTableFn = () => playImmediateSound("kenoClearTable", 1, "kenoClearTable", "keno");
export const kenoGemOpenFn = () => playImmediateSound("kenoGemOpen", 1, "kenoGemOpen", "keno");
export const kenoNormalRevealFn = () => playImmediateSound("kenoNormalReveal", 1, "kenoNormalReveal", "keno");


// ---- Queue + Stop management ----
export const clearSoundQueue = () => {
  soundQueue = [];
  soundCooldown = {};
  if (queueTimeoutId) {
    clearTimeout(queueTimeoutId);
    queueTimeoutId = null;
  }
  isPlayingQueue = false;
};

export const stopAllSounds = () => {
  clearSoundQueue();
};

// Play multiple sounds in sequence
export const playMultipleSounds = (sounds) => {
  sounds.forEach((sound, index) => {
    const delay = index * 200;
    const soundId = `multi_${sound.type}_${index}`;
    addSoundToQueue(sound.key, 1, delay, soundId);
  });
};

// ---- Mute controls ----
export const muteSound = () => {
  isMuted = true;
  writeStored(MUTE_KEY, 'off');
  stopAllSounds();
};
export const unmuteSound = () => {
  isMuted = false;
  writeStored(MUTE_KEY, 'on');
};
export const toggleMute = () => {
  if (isMuted) unmuteSound();
  else muteSound();
};
export const isSoundMuted = () => isMuted;
