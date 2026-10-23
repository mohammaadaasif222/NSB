import { useCallback, useEffect, useState, type RefObject } from 'react';

/** Safari before 16.4 only knows the prefixed API. */
interface PrefixedDocument extends Document {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
}
interface PrefixedElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void;
}

const fullscreenElement = (): Element | null => {
  const doc = document as PrefixedDocument;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
};

export interface GameFullscreen {
  /** The frame fills the screen, natively or in the fallback. */
  active: boolean;
  /**
   * True while the fallback is on: the frame is pinned over the page rather
   * than handed to the browser, so it needs its own way out.
   */
  emulated: boolean;
  toggle: () => void;
  exit: () => void;
}

/**
 * Full screen for the game frame.
 *
 * Uses the browser's Fullscreen API where it exists. Where it does not, or the
 * browser refuses it (iPhone Safari has no element full screen at all), the
 * frame is pinned over the whole viewport instead, so the button always does
 * something. Escape leaves the fallback the same way it leaves the real thing.
 */
export const useGameFullscreen = (target: RefObject<HTMLElement>): GameFullscreen => {
  const [native, setNative] = useState(false);
  const [emulated, setEmulated] = useState(false);

  useEffect(() => {
    const onChange = (): void => setNative(fullscreenElement() === target.current);
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, [target]);

  useEffect(() => {
    if (!emulated) {
      return;
    }
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setEmulated(false);
    };
    // The page under the pinned frame must not scroll along with a swipe,
    // nor keep its reserved scrollbar gutter (index.css) beside it.
    const root = document.documentElement;
    const { overflow, scrollbarGutter } = root.style;
    root.style.overflow = 'hidden';
    root.style.scrollbarGutter = 'auto';
    window.addEventListener('keydown', onKey);
    return () => {
      root.style.overflow = overflow;
      root.style.scrollbarGutter = scrollbarGutter;
      window.removeEventListener('keydown', onKey);
    };
  }, [emulated]);

  const exit = useCallback((): void => {
    setEmulated(false);
    if (fullscreenElement()) {
      const doc = document as PrefixedDocument;
      void (doc.exitFullscreen?.() ?? doc.webkitExitFullscreen?.())?.catch?.(() => undefined);
    }
  }, []);

  const enter = useCallback((): void => {
    const el = target.current as PrefixedElement | null;
    if (!el) {
      return;
    }
    const request = el.requestFullscreen?.bind(el) ?? el.webkitRequestFullscreen?.bind(el);
    if (!request) {
      setEmulated(true);
      return;
    }
    try {
      const result = request();
      if (result && typeof result.catch === 'function') {
        result.catch(() => setEmulated(true));
      }
    } catch {
      setEmulated(true);
    }
  }, [target]);

  const active = native || emulated;
  const toggle = useCallback(() => (active ? exit() : enter()), [active, enter, exit]);

  return { active, emulated, toggle, exit };
};
