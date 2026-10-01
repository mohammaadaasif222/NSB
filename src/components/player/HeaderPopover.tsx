import { useEffect, useRef, type FC, type ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  /**
   * The header button that opens the panel. It lives inside the same wrapper
   * as the panel so a click on it counts as "inside" — otherwise the
   * outside-click handler would close the panel a tick before the button's
   * own onClick reopened it, and the thing would never open.
   */
  trigger: ReactNode;
  /** Labels the panel for assistive tech; the visible title is in `children`. */
  label: string;
  children: ReactNode;
  /** Panel width. Capped against the viewport so it cannot run off-screen. */
  width?: string;
  /**
   * Classes for the wrapper, which is where responsive visibility belongs: the
   * wrapper is a flex child of the header cluster, so hiding only the trigger
   * inside it would leave an empty box still claiming a gap.
   */
  className?: string;
}

/**
 * A header control and the panel it drops down.
 *
 * Anchored to the end edge of the trigger rather than centred, because every
 * one of these sits in the bar's right-hand cluster and a centred panel would
 * hang off the side of the window. Escape and an outside click both dismiss,
 * matching the balance and account menus already in the bar.
 */
const HeaderPopover: FC<Props> = ({
  open,
  onClose,
  trigger,
  label,
  children,
  width = 'w-[min(21rem,calc(100vw-1.5rem))]',
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div className={`relative ${className}`} ref={ref}>
      {trigger}

      {open && (
        <div
          role="dialog"
          aria-label={label}
          className={`rl-menu absolute end-0 top-12 z-40 ${width} overflow-hidden rounded-2xl`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

/** The title row every panel opens with: heading on the left, action on the right. */
export const PanelHeader: FC<{ title: string; action?: ReactNode }> = ({ title, action }) => (
  <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
    <h2 className="text-base font-bold text-white">{title}</h2>
    {action}
  </div>
);

/** Small square control used for a panel's header affordances (gear, close). */
export const PanelIconButton: FC<{
  label: string;
  onClick?: () => void;
  children: ReactNode;
}> = ({ label, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/10 hover:text-white"
  >
    {children}
  </button>
);

export default HeaderPopover;
