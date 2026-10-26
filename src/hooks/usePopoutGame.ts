import { useCallback, useEffect, useRef, useState } from 'react';
import { playHref } from '@/constants/games';
import type { GameMode } from '@/types';

/** How often the page checks whether the player closed the pop-out. */
const CLOSED_POLL_MS = 800;

/** Query flag that makes the play page render as a bare pop-out window. */
export const POPOUT_PARAM = 'popout';

/** The play page as a pop-out: the game alone, no shell around it. */
export const popoutHref = (slug: string, mode: GameMode): string => {
  const href = playHref(slug, mode);
  return `${href}${href.includes('?') ? '&' : '?'}${POPOUT_PARAM}=1`;
};

export interface PopoutGame {
  /** The browser can host a pop-out here. False on phones, where it would only be a tab. */
  supported: boolean;
  /** The game is running in the pop-out right now. */
  active: boolean;
  /**
   * Opens the pop-out, or focuses it if it is already open. False when the
   * browser blocked the window.
   */
  open: () => boolean;
  /** Closes the pop-out, so the game can come back to the page. */
  close: () => void;
}

/**
 * Plays the game in a window of its own.
 *
 * The aggregator's launch URL cannot be handed to a new window: it is single
 * use and only opens embedded under our Referer. So the pop-out loads this
 * site's own play page with `?popout=1`, which launches a fresh session and
 * shows nothing but the game. The page that opened it should stop its own
 * game meanwhile, so the player never has two real-money sessions running at
 * once. The window is named per game, so a second click focuses the window
 * that is already open rather than opening another. When the player closes
 * it, `active` turns false and the page takes the game back.
 */
export const usePopoutGame = (slug: string, mode: GameMode, supported: boolean): PopoutGame => {
  const windowRef = useRef<Window | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) {
      return;
    }
    const id = window.setInterval(() => {
      if (!windowRef.current || windowRef.current.closed) {
        windowRef.current = null;
        setActive(false);
      }
    }, CLOSED_POLL_MS);
    return () => window.clearInterval(id);
  }, [active]);

  // Switching game or mode on this page takes the game back from the window.
  // Leaving the page does not: playing on elsewhere is the point of a pop-out.
  const key = `${slug}:${mode}`;
  const lastKey = useRef(key);
  useEffect(() => {
    if (lastKey.current !== key) {
      lastKey.current = key;
      windowRef.current?.close();
    }
  }, [key]);

  const open = useCallback((): boolean => {
    if (windowRef.current && !windowRef.current.closed) {
      windowRef.current.focus();
      return true;
    }
    // About 16:9 at a comfortable size, never bigger than the screen.
    const width = Math.min(1280, Math.round(window.screen.availWidth * 0.8));
    const height = Math.min(760, Math.round(window.screen.availHeight * 0.8));
    const left = Math.round((window.screen.availWidth - width) / 2);
    const top = Math.round((window.screen.availHeight - height) / 2);
    const popup = window.open(
      popoutHref(slug, mode),
      `rolluck-game-${slug}`,
      `popup=yes,width=${width},height=${height},left=${left},top=${top}`
    );
    if (!popup) {
      return false;
    }
    windowRef.current = popup;
    popup.focus();
    setActive(true);
    return true;
  }, [slug, mode]);

  const close = useCallback((): void => {
    windowRef.current?.close();
  }, []);

  return { supported, active, open, close };
};
