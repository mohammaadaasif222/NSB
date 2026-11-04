import { createContext, useContext, useEffect, useState, type FC, type ReactNode } from 'react';
import {
  GENERIC_SOUND,
  POPUP_SELECTOR,
  POPUP_SOUND,
  loadSounds,
  playSound,
  soundKeyOf,
  soundTarget,
} from '@/lib/uiSound';

/**
 * Interface sound effects: a click on every button, link, card, dropdown and
 * input across the app, and a sound when a popup opens.
 *
 * One listener on the document rather than a hook in each component, so new
 * controls click without anyone remembering to wire them. An element picks its
 * own sound with `data-sound="<key>"`; the files behind the keys are managed in
 * the console (see lib/uiSound). Games run in provider iframes, whose clicks
 * never reach this document — they bring their own sound.
 *
 * On by default. The choice is per device, in localStorage like the language,
 * since `/users/me` has no field for it.
 */

interface SoundContextType {
  enabled: boolean;
  setEnabled: (on: boolean) => void;
  /** For a sound tied to something other than a click, e.g. a bet settling. */
  playClick: () => void;
  /** Plays a named sound from the console's list. */
  play: (key: string) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const STORAGE_KEY = 'app_sound';

/**
 * A label click is followed by a synthetic click on its input, and a select
 * fires on open and on choosing — closer together than any real double tap.
 */
const MIN_GAP_MS = 60;

/** A dialog swapping its content (login → register) is one popup, not two. */
const POPUP_GAP_MS = 250;

export const SoundProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [enabled, setEnabledState] = useState(true);

  // Restored after mount so the server and first client render agree.
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === 'off') setEnabledState(false);
  }, []);

  // The list of files. Re-read when the tab comes back, so a sound replaced in
  // the console reaches an open tab too.
  useEffect(() => {
    if (!enabled) return undefined;
    void loadSounds();
    const onVisible = (): void => {
      if (document.visibilityState === 'visible') void loadSounds();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;

    let last = 0;
    const onClick = (e: MouseEvent): void => {
      const el = soundTarget(e.target);
      if (!el) return;
      const now = performance.now();
      if (now - last < MIN_GAP_MS) return;
      last = now;
      playSound(soundKeyOf(el));
    };

    // Capture, so a handler that stops propagation does not silence it.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [enabled]);

  // Popups: one observer instead of a hook in each of the site's dialogs.
  useEffect(() => {
    if (!enabled || typeof MutationObserver === 'undefined') return undefined;

    let last = 0;
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of Array.from(record.addedNodes)) {
          if (!(node instanceof Element)) continue;
          if (!node.matches(POPUP_SELECTOR) && !node.querySelector(POPUP_SELECTOR)) continue;
          const now = performance.now();
          if (now - last >= POPUP_GAP_MS) {
            playSound(POPUP_SOUND, { fallback: false, afterGesture: true });
          }
          last = now;
          return;
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [enabled]);

  const setEnabled = (on: boolean): void => {
    localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
    setEnabledState(on);
    // The listener only attaches on the next render, so the switch's own
    // click would otherwise be silent; this confirms the sound is back.
    if (on) {
      void loadSounds();
      playSound(GENERIC_SOUND);
    }
  };

  const play = (key: string): void => {
    if (enabled) playSound(key);
  };

  return (
    <SoundContext.Provider
      value={{ enabled, setEnabled, playClick: () => play(GENERIC_SOUND), play }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = (): SoundContextType => {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    throw new Error('useSound must be used within SoundProvider');
  }
  return ctx;
};
