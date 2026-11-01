"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

const FOCUSABLE = "a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)";

/**
 * What every public overlay does while it is open: Escape closes it (other keys go to `onKey`), the
 * page behind stops scrolling, focus moves inside (unless a field there already took it), and it
 * returns to whatever had it on close. Put the returned ref on the overlay, and pass `open` when
 * the component stays mounted while the overlay is shut.
 */
export function useModalBehaviour(onClose: () => void, { open = true, onKey }: { open?: boolean; onKey?: (e: KeyboardEvent) => void } = {}) {
  const dialog = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);
  // The latest handlers, so the listener, scroll lock and focus are set up once per opening.
  const handlers = useRef({ onClose, onKey });
  useEffect(() => {
    handlers.current = { onClose, onKey };
  });

  // A layout effect, because a field's own focus effect inside the overlay runs before the effect below.
  useLayoutEffect(() => {
    if (open) opener.current = document.activeElement;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => (e.key === "Escape" ? handlers.current.onClose() : handlers.current.onKey?.(e));
    document.addEventListener("keydown", handle);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const container = dialog.current;
    if (!container?.contains(document.activeElement)) container?.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true });
    const returnTo = opener.current;
    return () => {
      document.removeEventListener("keydown", handle);
      document.body.style.overflow = overflow;
      if (returnTo instanceof HTMLElement && returnTo.isConnected) returnTo.focus({ preventScroll: true });
    };
  }, [open]);

  return dialog;
}
