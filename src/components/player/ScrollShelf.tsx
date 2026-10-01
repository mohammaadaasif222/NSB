import { useCallback, useEffect, useRef, useState, type FC, type ReactNode } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import { ShelfHeading } from '@/components/player/GameRow';

interface Props {
  title: string;
  /** "View all" destination. Omit on the page the shelf would link to. */
  href?: string;
  /** Anchor target, so other pages can deep-link to the section. */
  id?: string;
  /** Gap between items; shelves of wide cards want a little more air. */
  gap?: string;
  children: ReactNode;
}

const ARROW = 'flex h-8 w-8 items-center justify-center rounded-full';

/**
 * A horizontal shelf whose heading arrows scroll it a viewport at a time.
 *
 * For shelves that are not server-paged (sports, fixtures, providers): the
 * catalogue shelves page through real URLs instead, see GameRow. The native
 * scrollbar is hidden by `rl-shelf`, so without these a mouse user has no
 * way to reach whatever overflows.
 *
 * The arrows are physical — left scrolls left — rather than logical, so they
 * stay correct in right-to-left locales. That needs the scroll position as a
 * distance from the left edge, which RTL reports as a non-positive
 * `scrollLeft` counting from the right; `leftOffset` normalises it.
 */
const ScrollShelf: FC<Props> = ({ title, href, id, gap = 'gap-2.5', children }) => {
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
    el?.scrollBy({ left: dir * el.clientWidth * 0.8 });
  };

  const arrow = (dir: -1 | 1, enabled: boolean): ReactNode => (
    <button
      type="button"
      onClick={() => scroll(dir)}
      disabled={!enabled}
      aria-label={`${t(dir < 0 ? 'games.prev' : 'games.next')}: ${title}`}
      className={`${ARROW} ${
        enabled
          ? 'rl-glass rl-glass-hover text-white/70 hover:text-white'
          : 'border border-white/[0.05] text-white/15'
      }`}
    >
      {dir < 0 ? <ChevronLeftIcon size={13} /> : <ChevronRightIcon size={13} />}
    </button>
  );

  return (
    <section id={id} className="scroll-mt-28 space-y-3">
      <ShelfHeading
        title={title}
        href={href}
        controls={
          <div className="flex items-center gap-1.5">
            {arrow(-1, canLeft)}
            {arrow(1, canRight)}
          </div>
        }
      />
      <div ref={ref} className={`rl-shelf -mx-1 px-1 pb-1 ${gap}`}>
        {children}
      </div>
    </section>
  );
};

export default ScrollShelf;
