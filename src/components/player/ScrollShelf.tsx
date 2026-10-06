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
import { ARROW_CLASS, ArrowGlyph, SHELF_TRACK, ShelfHeading } from '@/components/player/GameRow';

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
  children: ReactNode;
}

/** Items per phone page in a `paged` shelf: three across, two down. */
const PAGE_SIZE = 6;

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

/**
 * A horizontal shelf whose heading arrows scroll it a viewport at a time.
 *
 * For shelves that are not server-paged (providers, sports, fixtures): the
 * catalogue shelves page through real URLs instead, see GameRow. The native
 * scrollbar is hidden by `rl-shelf`, so without these a mouse user has no
 * way to reach whatever overflows.
 *
 * The arrows are physical — left scrolls left — rather than logical, so they
 * stay correct in right-to-left locales. That needs the scroll position as a
 * distance from the left edge, which RTL reports as a non-positive
 * `scrollLeft` counting from the right; `leftOffset` normalises it.
 */
const ScrollShelf: FC<Props> = ({
  title,
  href,
  id,
  track = SHELF_TRACK,
  paged = false,
  children,
}) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback((): void => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const max = el.scrollWidth - el.clientWidth;
    const rtl = getComputedStyle(el).direction === 'rtl';
    const leftOffset = rtl ? max + el.scrollLeft : el.scrollLeft;
    setCanLeft(leftOffset > 4);
    setCanRight(leftOffset < max - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    update();
    el.addEventListener('scroll', update, { passive: true });
    // Resizes change what overflows; so does late-loading content.
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [update]);

  /** `rl-shelf` sets smooth scrolling (off under reduced motion), which scrollBy honours. */
  const scroll = (dir: -1 | 1): void => {
    const el = ref.current;
    el?.scrollBy({ left: dir * el.clientWidth });
  };

  const arrow = (dir: -1 | 1, enabled: boolean): ReactNode => (
    <button
      type="button"
      onClick={() => scroll(dir)}
      disabled={!enabled}
      aria-label={`${t(dir < 0 ? 'games.prev' : 'games.next')}: ${title}`}
      className={`${ARROW_CLASS} ${enabled ? 'hover:bg-white/10' : 'opacity-40'}`}
    >
      <ArrowGlyph dir={dir < 0 ? 'prev' : 'next'} />
    </button>
  );

  return (
    <section
      id={id}
      className="scroll-mt-28 space-y-[calc(var(--u)*14)] lg:space-y-[calc(var(--u)*20)]"
    >
      <ShelfHeading
        title={title}
        href={href}
        controls={
          <div className="flex items-center gap-[calc(var(--u)*8)] lg:gap-[calc(var(--u)*14)]">
            {arrow(-1, canLeft)}
            {arrow(1, canRight)}
          </div>
        }
      />
      {/* Room above and below for the tiles' drop shadows, which the
          scroller would otherwise clip. */}
      <div ref={ref} className={`${paged ? PAGED_TRACK : track} -my-4 py-[calc(var(--u)*16)]`}>
        {paged ? <Pages>{children}</Pages> : children}
      </div>
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
