import { useEffect, useRef, useState, type FC, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Accessible modal shell: portal, dimmed backdrop, Esc / outside-click close,
 * body scroll lock, focus moved in on open and restored on close, and Tab kept
 * inside the dialog.
 *
 * The overlay is the scroll container rather than the card, so a tall dialog
 * scrolls on a short screen while anything hanging off the card's edge (the
 * password tooltip, a dropdown) is never clipped.
 */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Id of the element that names the dialog, usually its heading. */
  labelledBy?: string;
  /** Used when there is no visible heading to point `labelledBy` at. */
  ariaLabel?: string;
  /** Classes for the card: width, padding. */
  className?: string;
  children: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Modal: FC<ModalProps> = ({
  open,
  onClose,
  labelledBy,
  ariaLabel,
  className = '',
  children,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  // Portals need `document`, which does not exist during the server render.
  const [mounted, setMounted] = useState(false);

  // Read through a ref so a parent passing an inline onClose does not re-run
  // the effect below (and re-steal focus) on every render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const card = cardRef.current;
    (card?.querySelector<HTMLElement>('[data-autofocus]') ?? card)?.focus();

    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !card) return;

      const items = Array.from(card.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="rl-modal-overlay fixed inset-0 z-[70] overflow-y-auto"
      // mousedown rather than click: a text selection dragged out of the card
      // and released over the backdrop must not close the dialog.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex min-h-full items-center justify-center px-3 py-6 sm:p-6"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-label={labelledBy ? undefined : ariaLabel}
          tabIndex={-1}
          className={`rl-modal-card w-full outline-none ${className}`}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
