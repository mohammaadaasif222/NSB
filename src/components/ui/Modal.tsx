import { useEffect, useRef, useState, type CSSProperties, type FC, type ReactNode } from 'react';
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
  /** The card's glass: the auth dialogs' by default. */
  surface?: string;
  /** Inline style for the card — a zoom, a custom property. */
  style?: CSSProperties;
  /**
   * `dim` darkens and blurs the page (the default); `none` leaves it as it
   * is, for a dialog the design draws straight over the page (Select Game).
   * Either way a click outside closes.
   */
  backdrop?: 'dim' | 'none';
  /**
   * Below `sm`, a sheet instead of a floating card: full width, joined to the
   * screen's foot, its top corners rounded. `true` reaches up to 140px under
   * the screen's top (Select Game); `'fit'` is as tall as its content, the
   * auth flows' sheets. The card's class sets the radius.
   */
  phoneSheet?: boolean | 'fit';
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
  surface = 'rl-modal-card',
  style,
  backdrop = 'dim',
  phoneSheet = false,
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
      className={`${backdrop === 'dim' ? 'rl-modal-overlay' : ''} fixed inset-0 z-[70] overflow-y-auto`}
      // mousedown rather than click: a text selection dragged out of the card
      // and released over the backdrop must not close the dialog.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`flex min-h-full justify-center sm:items-center sm:p-6 ${
          phoneSheet ? 'items-end' : 'items-center px-4 py-6'
        }`}
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
          className={`${surface} w-full outline-none ${
            phoneSheet === 'fit'
              ? 'max-sm:max-h-[calc(100dvh-24px)] max-sm:max-w-none max-sm:overflow-y-auto max-sm:!rounded-b-none'
              : phoneSheet
                ? 'max-sm:flex max-sm:h-[calc(100dvh-140px)] max-sm:max-w-none max-sm:flex-col max-sm:!rounded-b-none'
                : ''
          } ${className}`}
          style={style}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
