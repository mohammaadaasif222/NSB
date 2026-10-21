import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FC,
  type Key,
  type ReactNode,
} from 'react';
import { useTranslation } from '@/context/I18nContext';
import {
  ARROW_CLASS,
  ArrowGlyph,
  SHELF_TRACK,
  ShelfHeading,
} from '@/components/player/ShelfHeading';

interface Props {
  title: string;
  /** "View all" destination. Omit on the page the shelf would link to. */
  href?: string;
  /** Anchor target, so other pages can deep-link to the section. */
  id?: string;
  /**
   * The track's layout classes. Defaults to the catalogue shelves' track, so
   * a row of 198px plates lines up with the game tiles above it.
   */
  track?: string;
  /**
   * Lay the items out as the design does for providers and sports on a
   * phone: pages of three-by-two, read row by row. From lg up the pages
   * dissolve and the items run in the ordinary single row.
   */
  paged?: boolean;
  /** A row between the heading and the track — the sportsbook's sport chips. */
  toolbar?: ReactNode;
  /** Classes for the heading's end cluster, e.g. to drop it on desktop. */
  endClassName?: string;
  /** The heading 14px over the track on desktop rather than 20 — the match shelves. */
  tight?: boolean;
  /**
   * More items exist past the end of the track. The arrow towards the end
   * stays live there, and `onLoadMore` is asked for them as the player nears it.
   */
  hasMore?: boolean;
  /**
   * Fetch the next batch and append it to the children. May be called again
   * before the last call has landed, so it must ignore calls while loading.
   */
  onLoadMore?: () => void;
  /** Shown in place of the track when there are no children. */
  empty?: ReactNode;
  children: ReactNode;
}

/** Items per phone page in a `paged` shelf: three across, two down. */
const PAGE_SIZE = 6;

/** Start loading the next batch while this many viewports of items are still ahead. */
const PREFETCH_VIEWPORTS = 2;

/**
 * The `paged` track. Below lg it is a row of full-width pages, each a 3×2
 * grid; from lg up each page is `display: contents`, so its items become the
 * row's own flex items and take the same 7-across sizing as the game tiles.
 */
const PAGED_TRACK =
  'rl-shelf flex snap-x snap-mandatory gap-[calc(var(--u)*11)] [--gap:calc(var(--u)*11)] lg:gap-[var(--gap)] lg:[--cols:7] lg:[--gap:calc(var(--u)*27)]';
const PAGE = 'grid w-full flex-none snap-start grid-cols-3 gap-[calc(var(--u)*11)] lg:contents';
const PAGED_ITEM =
  'min-w-0 lg:flex-none lg:snap-start lg:w-[calc((100%-(var(--cols)-1)*var(--gap))/var(--cols))]';

interface Position {
  /** Scrolled distance from the left edge, whatever the writing direction. */
  left: number;
  /** The furthest `left` can go. */
  max: number;
  rtl: boolean;
}

/**
 * Where the track is scrolled to. RTL reports `scrollLeft` as a non-positive
 * distance from the right, so it is normalised to count from the left.
 */
const positionOf = (el: HTMLElement): Position => {
  const max = el.scrollWidth - el.clientWidth;
  const rtl = getComputedStyle(el).direction === 'rtl';
  return { left: rtl ? max + el.scrollLeft : el.scrollLeft, max, rtl };
};

/** How far is left to go before the last item — the right edge in LTR, the left in RTL. */
const remainingOf = ({ left, max, rtl }: Position): number => (rtl ? left : max - left);

/**
 * A horizontal slider whose heading arrows glide it a page at a time.
 *
 * Used for every row on the lobby: the game shelves (see GameRow), which
 * feed it more tiles through `hasMore` / `onLoadMore` as it nears the end,
 * and the providers, sports, tournaments and fixtures. The native scrollbar
 * is hidden by `rl-shelf`, so without the arrows a mouse user has no way to
 * reach whatever overflows; touch and trackpads still swipe it natively.
 *
 * A step is the track's width plus one gutter, which is exactly one page of
 * whole tiles, so each glide lands on a tile edge with no snap correction.
 *
 * The arrows are physical — left scrolls left — rather than logical, so they
 * stay correct in right-to-left locales. Loading more, though, follows the
 * reading direction: in RTL the items run out at the left edge.
 */
const ScrollShelf: FC<Props> = ({
  title,
  href,
  id,
  track = SHELF_TRACK,
  paged = false,
  toolbar,
  endClassName,
  tight = false,
  hasMore = false,
  onLoadMore,
  empty,
  children,
}) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [rtl, setRtl] = useState(false);
  // A click towards the end arrived before there was anything to scroll to;
  // it is carried out once the next batch is in.
  const pendingStep = useRef<-1 | 1 | null>(null);
  // The track is not rendered while the empty state stands in for it.
  const isEmpty = empty !== undefined && Children.count(children) === 0;

  // Read from the scroll listener, which is bound once.
  const more = useRef({ hasMore, onLoadMore });
  more.current = { hasMore, onLoadMore };

  const update = useCallback((): void => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const { left, max, rtl: isRtl } = positionOf(el);
    setRtl(isRtl);
    setCanLeft(left > 4);
    setCanRight(left < max - 4);
  }, []);

  /** Ask for the next batch if the player is within reach of the end. */
  const prefetch = useCallback((): void => {
    const el = ref.current;
    const { hasMore: canLoad, onLoadMore: load } = more.current;
    if (
      el &&
      canLoad &&
      load &&
      remainingOf(positionOf(el)) < el.clientWidth * PREFETCH_VIEWPORTS
    ) {
      load();
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    update();
    // Only scrolling prefetches, not mounting: a short shelf is "near the
    // end" from the start, and a lobby of them should not all fetch on load.
    const onScroll = (): void => {
      update();
      prefetch();
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    // Resizes change what overflows; so does late-loading content.
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, [update, prefetch, isEmpty]);

  /** One page: the visible width plus the gutter after the last whole tile. */
  const stepOf = (el: HTMLElement): number =>
    el.clientWidth + (parseFloat(getComputedStyle(el).columnGap) || 0);

  // New items change the track's length without resizing it, so re-measure,
  // and finish a click that was waiting on them.
  useEffect(() => {
    update();
    const el = ref.current;
    const dir = pendingStep.current;
    if (!el || dir === null) {
      return;
    }
    if (remainingOf(positionOf(el)) > 4) {
      pendingStep.current = null;
      el.scrollBy({ left: dir * stepOf(el) });
    } else if (!hasMore) {
      pendingStep.current = null;
    }
  }, [children, hasMore, update]);

  /** `rl-shelf` sets smooth scrolling (off under reduced motion), which scrollBy honours. */
  const scroll = (dir: -1 | 1): void => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const position = positionOf(el);
    const towardEnd = position.rtl ? dir < 0 : dir > 0;
    if (towardEnd && remainingOf(position) <= 4) {
      // At the end with more on the way: glide on as soon as it lands.
      pendingStep.current = dir;
      onLoadMore?.();
      return;
    }
    el.scrollBy({ left: dir * stepOf(el) });
    if (towardEnd) {
      prefetch();
    }
  };

  const arrow = (dir: -1 | 1, canScroll: boolean): ReactNode => {
    const towardEnd = rtl ? dir < 0 : dir > 0;
    const enabled = canScroll || (towardEnd && hasMore);
    // At an end only the chevron dims: the design draws both discs alike.
    return (
      <button
        type="button"
        onClick={() => scroll(dir)}
        disabled={!enabled}
        aria-label={`${t(dir < 0 ? 'games.prev' : 'games.next')}: ${title}`}
        className={`${ARROW_CLASS} ${enabled ? 'hover:bg-white/10' : 'cursor-default [&>img]:opacity-35'}`}
      >
        <ArrowGlyph dir={dir < 0 ? 'prev' : 'next'} />
      </button>
    );
  };

  return (
    <section
      id={id}
      className={`scroll-mt-28 space-y-[calc(var(--u)*14)] ${tight ? '' : 'lg:space-y-[calc(var(--u)*20)]'}`}
    >
      <ShelfHeading
        title={title}
        href={href}
        endClassName={endClassName}
        controls={
          isEmpty ? undefined : (
            <div className="flex items-center gap-[calc(var(--u)*8)] lg:gap-[calc(var(--u)*14)]">
              {arrow(-1, canLeft)}
              {arrow(1, canRight)}
            </div>
          )
        }
      />
      {toolbar}
      {isEmpty ? (
        empty
      ) : (
        // Room above and below for the tiles' drop shadows, which the
        // scroller would otherwise clip.
        <div ref={ref} className={`${paged ? PAGED_TRACK : track} -my-4 py-[calc(var(--u)*16)]`}>
          {paged ? <Pages>{children}</Pages> : children}
        </div>
      )}
    </section>
  );
};

const keyOf = (node: ReactNode): Key => (isValidElement(node) && node.key !== null ? node.key : '');

/** Splits a paged shelf's items into phone pages of PAGE_SIZE. */
const Pages: FC<{ children: ReactNode }> = ({ children }) => {
  const items = Children.toArray(children);
  const pages: ReactNode[][] = [];
  for (let i = 0; i < items.length; i += PAGE_SIZE) {
    pages.push(items.slice(i, i + PAGE_SIZE));
  }

  return (
    <>
      {pages.map((page) => (
        // Keyed by the first item's own key — `toArray` gives every item one.
        <div key={keyOf(page[0])} className={PAGE}>
          {page.map((item) => (
            <div key={keyOf(item)} className={PAGED_ITEM}>
              {item}
            </div>
          ))}
        </div>
      ))}
    </>
  );
};

export default ScrollShelf;
