import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';

/**
 * Clear space kept around the panel: more above and below, where it meets the
 * header and the foot, than beside it, where the page's own gutter is 16.
 */
const GAP_X = 16;
const GAP_Y = 24;

interface Point {
  x: number;
  y: number;
}

interface Bounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Where a floating panel may sit: the page's content column, below the
 * header and above the phone's tab bar (or the window's foot), with room to
 * spare on every side — so it never touches, or slides under, the shell
 * around it.
 */
const readBounds = (stage: Element): Bounds => {
  const width = document.documentElement.clientWidth;
  const height = window.innerHeight;
  const header = stage.querySelector('header')?.getBoundingClientRect();
  const main = stage.querySelector('main')?.getBoundingClientRect();
  const tabBar = stage.querySelector('[data-mobile-tabbar]')?.getBoundingClientRect();
  // `lg:hidden` leaves the bar in the tree with an empty box.
  const foot = tabBar && tabBar.height > 0 ? tabBar.top : height;

  return {
    top: Math.max(header?.bottom ?? 0, 0) + GAP_Y,
    bottom: foot - GAP_Y,
    left: Math.max(main?.left ?? 0, 0) + GAP_X,
    right: Math.min(main?.right ?? width, width) - GAP_X,
  };
};

const clamp = (point: Point, size: { w: number; h: number }, b: Bounds): Point => ({
  x: Math.round(Math.max(b.left, Math.min(point.x, b.right - size.w))),
  // A panel taller than the room left keeps its head in view.
  y: Math.round(Math.max(b.top, Math.min(point.y, b.bottom - size.h))),
});

const load = (key: string): Point | null => {
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(key) ?? 'null') as Point | null;
    return parsed && Number.isFinite(parsed.x) && Number.isFinite(parsed.y) ? parsed : null;
  } catch {
    return null;
  }
};

const save = (key: string, point: Point): void => {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(point));
  } catch {
    // Storage blocked: the panel just opens in its default spot next time.
  }
};

export interface FloatingPanel {
  /** The stacking context to portal the panel into; null until mounted. */
  host: Element | null;
  /** Fixed position, hidden until the first measurement places it. */
  style: CSSProperties;
  /** Spread on the panel's drag handle. */
  handle: {
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  };
}

/**
 * A panel that floats over the page, outside whatever it describes, and can
 * be dragged anywhere in the content column.
 *
 * It opens inset in the top-right corner of its anchor (or below the header
 * at the column's end edge), and keeps clear of the header, the foot and the
 * rail while dragged, as the window resizes and as its own content grows.
 * Where the player left it is remembered for the tab.
 *
 * It renders into the player shell's stage (`data-player-stage`) rather than
 * <body>, so its z-index is weighed against the header, the menus and the
 * dialogs in the same stacking context — under them all, over the page.
 */
export const useFloatingPanel = (
  panel: RefObject<HTMLElement>,
  storageKey: string,
  /** What the panel opens beside: it starts inset in this element's top-right corner. */
  anchorSelector?: string
): FloatingPanel => {
  const [host, setHost] = useState<Element | null>(null);
  const [position, setPosition] = useState<Point | null>(null);
  const latest = useRef<Point | null>(null);
  latest.current = position;
  /** Ends a drag in progress — also run if the panel unmounts mid-drag. */
  const endDrag = useRef<(() => void) | null>(null);

  useEffect(() => {
    setHost(document.querySelector('[data-player-stage]') ?? document.body);
  }, []);

  /** Puts the panel at `wanted` (or where it was, or its default), inside the bounds. */
  const place = useCallback(
    (wanted?: Point): Point | null => {
      const el = panel.current;
      if (!el || !host) {
        return null;
      }
      const bounds = readBounds(host);
      const size = { w: el.offsetWidth, h: el.offsetHeight };
      const anchor = anchorSelector
        ? document.querySelector(anchorSelector)?.getBoundingClientRect()
        : undefined;
      const fallback = anchor
        ? { x: anchor.right - GAP_X - size.w, y: anchor.top + GAP_X }
        : { x: bounds.right - size.w, y: bounds.top };
      const start = wanted ?? latest.current ?? load(storageKey) ?? fallback;
      const next = clamp(start, size, bounds);
      setPosition((prev) => (prev && prev.x === next.x && prev.y === next.y ? prev : next));
      return next;
    },
    [panel, host, storageKey, anchorSelector]
  );

  // Placed before paint, so it never flashes in the corner first.
  useLayoutEffect(() => {
    place();
  }, [place]);

  useEffect(() => {
    const el = panel.current;
    if (!el || !host) {
      return;
    }
    const replace = (): void => {
      place();
    };
    window.addEventListener('resize', replace);
    // Loading turns into a chart, a scope switch changes the figures: a panel
    // that grows near the foot must step back up.
    const observer = new ResizeObserver(replace);
    observer.observe(el);
    return () => {
      window.removeEventListener('resize', replace);
      observer.disconnect();
    };
  }, [panel, host, place]);

  useEffect(() => () => endDrag.current?.(), []);

  /**
   * Drags by the handle. Followed on the window, with a clear shield laid over
   * the page for the duration: the game below is an iframe, and an iframe
   * takes every pointer event that crosses it — without the shield the panel
   * stops dead the moment the pointer runs ahead of it onto the game.
   */
  const onPointerDown = (event: ReactPointerEvent<HTMLElement>): void => {
    const origin = latest.current;
    if (!origin || !host || event.button !== 0 || (event.target as HTMLElement).closest('button')) {
      return;
    }
    event.preventDefault();
    const pointer = { x: event.clientX, y: event.clientY };
    let last = origin;

    const shield = document.createElement('div');
    // Just under the panel (z-20), over the game and the rest of the page.
    shield.style.cssText = 'position:fixed;inset:0;z-index:19;cursor:grabbing;touch-action:none;';
    host.appendChild(shield);

    const onMove = (move: PointerEvent): void => {
      last =
        place({ x: origin.x + move.clientX - pointer.x, y: origin.y + move.clientY - pointer.y }) ??
        last;
    };
    const finish = (): void => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
      shield.remove();
      endDrag.current = null;
      save(storageKey, last);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
    endDrag.current = finish;
  };

  const style: CSSProperties = position
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }
    : { position: 'fixed', top: 0, left: 0, visibility: 'hidden' };

  return {
    host,
    style,
    handle: { onPointerDown },
  };
};
