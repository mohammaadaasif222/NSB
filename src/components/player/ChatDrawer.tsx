import { useEffect, useState, type FC, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '@/context/I18nContext';

/**
 * The sliding panel the chat lives in.
 *
 * **Portalled to `document.body`, and it has to be.** The header bar carries
 * `backdrop-blur-xl`, and a backdrop-filter makes an element a containing
 * block for `position: fixed` descendants — a fixed drawer rendered inside the
 * header would be positioned against the header, not the viewport, and would
 * be clipped to it. Nothing about the markup hints at that, which is why it is
 * written down here.
 *
 * **Non-modal on purpose.** No dimmed backdrop, no focus trap, no body scroll
 * lock, and an outside click does NOT close it — all of which `ui/Modal` does,
 * and all of which would be wrong here. A player keeps chat open while they
 * bet; the design shows the slip and the Place bet button fully usable beside
 * it. A drawer that closed when you clicked the thing you opened it to use
 * would be worse than no drawer. It closes from its own X, from the header
 * button, or with Escape.
 */

interface Props {
  open: boolean;
  onClose: () => void;
  /** Names the panel for assistive tech. */
  label: string;
  children: ReactNode;
}

/**
 * Must match the `duration-300` below.
 *
 * The panel stays mounted for this long after `open` goes false so the slide
 * OUT is visible; unmounting on the same tick would make it vanish. Reading it
 * from the DOM would be more robust than restating it, but a transitionend
 * that never fires (a cancelled transition, `prefers-reduced-motion`) would
 * strand the drawer mounted and invisible, holding its chat subscription open.
 * A timer always completes.
 */
const SLIDE_MS = 300;

/** Fired by the phone's tab bar to open or close the chat drawer. */
export const CHAT_TOGGLE_EVENT = 'rl:toggle-chat';

const ChatDrawer: FC<Props> = ({ open, onClose, label, children }) => {
  // useI18n rather than useTranslation: only the full context carries the
  // direction, and which edge the panel slides out towards depends on it.
  const { isRtl } = useI18n();

  // Portals need `document`, which the server render does not have.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /** In the tree at all — true through the closing slide, then false. */
  const [present, setPresent] = useState(open);
  /** Slid into view. Separate from `present` so the two can differ by a frame. */
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (open) {
      setPresent(true);
      return undefined;
    }

    setShown(false);
    const timer = setTimeout(() => setPresent(false), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [open]);

  /**
   * Flip to the open position one frame AFTER the panel is in the DOM.
   *
   * Setting both in the same commit paints the element already open and there
   * is nothing to transition from. Two nested rAFs rather than one: the first
   * only guarantees we are before the next paint, which can still be the same
   * paint that inserts the node. The second puts the change in the frame
   * after it, which is what makes the browser interpolate.
   */
  useEffect(() => {
    if (!present || !open) return undefined;

    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setShown(true));
    });

    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [present, open]);

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;
      // The emoji picker is open and wants this Escape for itself; it marks
      // the event so the drawer does not close out from under it.
      if (event.defaultPrevented) return;
      onClose();
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted || !present) return null;

  // The panel is pinned to the inline-end edge, so it must slide out towards
  // whichever side that is — right in English, left in Arabic.
  const hidden = isRtl ? '-translate-x-full' : 'translate-x-full';

  return createPortal(
    <aside
      role="dialog"
      aria-label={label}
      // `inset-y-0 end-0`: full height against the inline-end edge.
      //
      // z-60 places it in the shell's existing ladder — above the header
      // (z-30/40) and the phone menu drawer (z-50) so it is not painted under
      // either, and below ui/Modal (z-70) so the wallet dialog still covers
      // chat rather than fighting it.
      data-chat-drawer={shown ? 'open' : 'closed'}
      // A phone keeps the bar in view, as its design draws chat: the
      // drawer starts where the bar ends, on the page's own black.
      className={`fixed bottom-0 end-0 top-[var(--player-bar-h,0px)] z-[60] flex w-full flex-col bg-[#07080a] transition-transform duration-300 ease-out sm:top-0 sm:w-[var(--chat-drawer-w)] sm:rl-menu-panel-glass ${
        shown ? 'translate-x-0' : hidden
      }`}
    >
      {children}
    </aside>,
    document.body
  );
};

export default ChatDrawer;
