import { useEffect, useLayoutEffect, useRef, useState, type FC, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { DESKTOP_QUERY, useMediaQuery } from '@/hooks/useMediaQuery';
import { POPUP_SURFACE, type PopupTone } from '@/components/player/popupSurface';

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
  /** Panel width classes. Cap them against the viewport so the panel cannot run off-screen. */
  width?: string;
  /** The panel's glass — see popupSurface. */
  tone?: PopupTone;
  /** Dim and blur the page behind the open panel, as the notification design does. */
  dim?: boolean;
  /**
   * On a phone, open as a screen of its own under the bar rather than a
   * dropdown — the bar stays, as the design keeps it.
   */
  phoneSheet?: boolean;
  /** Extra classes for the dropdown panel — e.g. the design's offset from the trigger. */
  panelClassName?: string;
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
 * hang off the side of the window. Escape and an outside click both dismiss.
 *
 * The backdrop and the phone sheet render into <body>: the bar has its own
 * backdrop blur, which makes it the containing block for anything fixed
 * inside it, so either would otherwise be pinned to the bar, not the screen.
 */
const HeaderPopover: FC<Props> = ({
  open,
  onClose,
  trigger,
  label,
  children,
  width = 'w-[min(21rem,calc(100vw-1.5rem))]',
  tone = 'raised',
  dim = false,
  phoneSheet = false,
  panelClassName = '',
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const sheet = phoneSheet && !desktop;
  // How far under the trigger the panel opens: 8 clear of the bar's foot,
  // measured, so it never sits on the bar whatever height the bar has.
  const [drop, setDrop] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!open) return undefined;
    const place = (): void => {
      const wrap = ref.current?.getBoundingClientRect();
      const bar = ref.current?.closest('header')?.getBoundingClientRect();
      if (wrap && bar) setDrop(Math.max(8, bar.bottom - wrap.bottom + 8));
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (e: MouseEvent): void => {
      const target = e.target as Node;
      if (!ref.current?.contains(target) && !sheetRef.current?.contains(target)) {
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

      {open &&
        dim &&
        !sheet &&
        createPortal(
          // Into the layout's stage, whose isolation the bar and the rail
          // live in: there z-[25] puts it over the page but under them
          // (z-30 / z-[26]). In <body> it would cover the whole stage, the
          // open panel included.
          <div
            aria-hidden="true"
            className="fixed inset-0 z-[25] bg-black/[0.34] backdrop-blur-[12px]"
          />,
          document.querySelector('[data-player-stage]') ?? document.body
        )}

      {open &&
        (sheet ? (
          createPortal(
            // Into the stage, under the bar and over the tab bar, as the phone
            // design draws it — the sheet starts where the bar ends, so it
            // only ever covers the page and the tab bar.
            <div
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-label={label}
              className="thin-scrollbar fixed inset-x-0 bottom-0 top-[var(--player-bar-h,0px)] z-[31] overflow-y-auto bg-[#07080a]"
            >
              {children}
            </div>,
            document.querySelector('[data-player-stage]') ?? document.body
          )
        ) : (
          <div
            role="dialog"
            aria-label={label}
            className={`absolute end-0 top-[calc(100%+10px)] z-40 overflow-hidden rounded-[34px] lg:rounded-[calc(var(--u)*34)] ${POPUP_SURFACE[tone]} ${width} ${panelClassName}`}

            style={drop === null ? undefined : { top: `calc(100% + ${drop}px)` }}
          >
            {children}
          </div>
        ))}
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
