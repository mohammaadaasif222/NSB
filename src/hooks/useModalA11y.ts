import { useEffect, useRef } from 'react';

/**
 * The keyboard and screen-reader behaviour a dialog is expected to have.
 *
 * Neither KYC modal had any of it: Tab walked straight out of the dialog into
 * the page behind, Escape did nothing, and a screen reader was never told a
 * dialog had opened — it simply carried on reading the page it could still
 * reach. For a modal a player is asked to complete before they can withdraw,
 * that is the difference between usable and not.
 *
 * Returns a ref to put on the dialog element. Pair it with
 * `role="dialog" aria-modal="true"` and an `aria-labelledby` pointing at the
 * title.
 */
export function useModalA11y(onClose: () => void) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    // Where focus was before the dialog opened, so it can be put back. A
    // dialog that closes and drops focus to the top of the document makes a
    // keyboard user start again.
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusable = (): HTMLElement[] =>
      Array.from(
        node.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);

    // Move focus in. The dialog itself when it holds nothing focusable yet —
    // the Sumsub widget mounts asynchronously, so the first render often has
    // only a spinner.
    const first = focusable()[0];
    (first ?? node).focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        /* A dropdown open inside the dialog gets Escape first. Both this and
           `RlSelect` listen in the capture phase, and this one is registered
           earlier — so without the check here, closing a select would take the
           half-filled form down with it. */
        if (document.querySelector('[role="listbox"]')) return;
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const items = focusable();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      const active = document.activeElement;

      // Wrap at both ends, and pull focus back in if it has escaped — which
      // it can, because the widget renders in an iframe the trap cannot see
      // into.
      if (event.shiftKey && (active === firstItem || !node.contains(active))) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && (active === lastItem || !node.contains(active))) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);

    // The page behind must not scroll under the dialog.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [onClose]);

  return ref;
}
