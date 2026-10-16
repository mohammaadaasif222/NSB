import { createContext, useContext, useEffect, useState, type FC, type ReactNode } from 'react';
import { playClick, soundTarget } from '@/lib/uiSound';

/**
 * Interface sound effects: a click on every button, link, card, dropdown and
 * input across the app.
 *
 * One listener on the document rather than a hook in each component, so new
 * controls click without anyone remembering to wire them. Games run in
 * provider iframes, whose clicks never reach this document — they bring their
 * own sound.
 *
 * On by default. The choice is per device, in localStorage like the language,
 * since `/users/me` has no field for it.
 */

interface SoundContextType {
  enabled: boolean;
  setEnabled: (on: boolean) => void;
  /** For a sound tied to something other than a click, e.g. a bet settling. */
  playClick: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const STORAGE_KEY = 'app_sound';

/**
 * A label click is followed by a synthetic click on its input, and a select
 * fires on open and on choosing — closer together than any real double tap.
 */
const MIN_GAP_MS = 60;

export const SoundProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [enabled, setEnabledState] = useState(true);

  // Restored after mount so the server and first client render agree.
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === 'off') setEnabledState(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let last = 0;
    const onClick = (e: MouseEvent): void => {
      if (!soundTarget(e.target)) return;
      const now = performance.now();
      if (now - last < MIN_GAP_MS) return;
      last = now;
      playClick();
    };

    // Capture, so a handler that stops propagation does not silence it.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [enabled]);

  const setEnabled = (on: boolean): void => {
    localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
    setEnabledState(on);
    // The listener only attaches on the next render, so the switch's own
    // click would otherwise be silent; this confirms the sound is back.
    if (on) playClick();
  };

  const play = (): void => {
    if (enabled) playClick();
  };

  return (
    <SoundContext.Provider value={{ enabled, setEnabled, playClick: play }}>
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
