import type { FC, ReactNode } from 'react';
import Link from 'next/link';
import type { Game, GameShelfKey } from '@/types';
import { categoryHref } from '@/constants/games';
import { useTranslation } from '@/context/I18nContext';
import chevronLeft from '@/assets/lobby/chevron-left.svg';
import chevronRight from '@/assets/lobby/chevron-right.svg';
import GameTile from './GameTile';

interface Props {
  title: string;
  games: Game[];
  /** The category this shelf belongs to; "View all" links to its page. */
  shelfKey: GameShelfKey;
  /**
   * Home-page paging. `page` and `totalPages` come from the API, `query` is
   * the current URL query so paging one shelf preserves the others' pages.
   * Leave all three out to render the shelf without arrows.
   */
  page?: number;
  totalPages?: number;
  query?: Record<string, string>;
  /** The route the shelf is on, so paging stays there. Defaults to the home lobby. */
  basePath?: string;
}

/* ==================================================================== */
/* Shared heading                                                        */
/* ==================================================================== */

/**
 * The round arrow at the end of a shelf heading: the design's 40px dark glass
 * disc on phones, its 48px clear glass disc on desktop.
 */
export const ARROW_CLASS =
  'flex h-[calc(var(--u)*40)] w-[calc(var(--u)*40)] items-center justify-center rounded-full border border-white/10 bg-black/40 backdrop-blur-md transition-colors lg:h-[calc(var(--u)*48)] lg:w-[calc(var(--u)*48)] lg:border-white/[0.06] lg:bg-white/[0.07] lg:shadow-[0_8px_40px_rgba(0,0,0,0.2)]';

export const ArrowGlyph: FC<{ dir: 'prev' | 'next' }> = ({ dir }) => (
  <img
    src={(dir === 'prev' ? chevronLeft : chevronRight).src}
    alt=""
    className="h-[calc(var(--u)*20)] w-[calc(var(--u)*20)] lg:h-[calc(var(--u)*24)] lg:w-[calc(var(--u)*24)]"
  />
);

interface HeadingProps {
  title: string;
  /** Omit to render the heading without a "View all" link. */
  href?: string;
  /** The arrow pair, or whatever stands in for it. */
  controls?: ReactNode;
  className?: string;
}

/**
 * The heading every shelf on the lobby shares: the title, "View All", and a
 * pair of round arrows at the end.
 *
 * Exported because the provider, sports and live-game rows are not built from
 * catalogue games and so cannot use `GameRow`, but must line up with it to the
 * pixel.
 */
export const ShelfHeading: FC<HeadingProps> = ({ title, href, controls, className = '' }) => {
  const { t } = useTranslation();

  return (
    <div className={`flex items-center justify-between gap-[calc(var(--u)*12)] ${className}`}>
      <h2 className="min-w-0 truncate text-[length:max(min(11px,20px),calc(var(--u)*20))] font-semibold leading-[calc(var(--u)*28)] tracking-[-0.02em] text-[#f0f1f5] lg:text-[length:max(min(11px,36px),calc(var(--u)*36))] lg:font-bold lg:leading-[calc(var(--u)*44)]">
        {title}
      </h2>

      <div className="flex flex-shrink-0 items-center gap-[calc(var(--u)*15)] lg:gap-[calc(var(--u)*27)]">
        {href && (
          <Link
            href={href}
            className="whitespace-nowrap text-[length:max(min(11px,14px),calc(var(--u)*14))] font-medium leading-[calc(var(--u)*20)] text-[#f0f1f5] transition-colors hover:text-[#f9d028] lg:text-[length:max(min(11px,18px),calc(var(--u)*18))] lg:font-normal lg:leading-[calc(var(--u)*28)]"
          >
            {t('dash.viewAll')}
          </Link>
        )}
        {controls}
      </div>
    </div>
  );
};

/**
 * The shelf's track: a scroller that shows a whole number of tiles — three on
 * a phone, seven at the design's 1548px — with the design's gutter between
 * them. Each child is sized from `--cols` and `--gap`, so a tile is exactly
 * 198px wide where the design measures it and scales with the column below.
 */
export const SHELF_TRACK =
  'rl-shelf rl-track flex [--cols:3] [--gap:calc(var(--u)*11)] sm:[--cols:4] md:[--cols:5] lg:[--cols:7] lg:[--gap:calc(var(--u)*27)]';

/* ==================================================================== */
/* Catalogue shelf                                                       */
/* ==================================================================== */

/**
 * One shelf of games, with optional server-rendered paging.
 *
 * The arrows are `<Link>`s, not buttons: each page is a real URL
 * (`/casino?slots=2&featured=1`), so a shelf's position survives a refresh, is
 * shareable, and works with the back button. Only this shelf's key changes in
 * the href; the rest of the query rides along, which is what keeps paging
 * Slots from resetting Originals to page 1.
 */
const GameRow: FC<Props> = ({
  title,
  games,
  shelfKey,
  page,
  totalPages,
  query,
  basePath = '/',
}) => {
  const { t } = useTranslation();
  const paged = page !== undefined && totalPages !== undefined && query !== undefined;

  const hrefForPage = (target: number): string => {
    const next = new URLSearchParams(query);
    // Page 1 is the default, so drop the parameter entirely; it keeps the
    // canonical URL clean rather than accumulating `?originals=1&new=1&…`.
    if (target <= 1) {
      next.delete(shelfKey);
    } else {
      next.set(shelfKey, String(target));
    }
    const qs = next.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const arrow = (dir: 'prev' | 'next'): ReactNode => {
    const enabled = paged && (dir === 'prev' ? page > 1 : page < totalPages);

    if (!enabled) {
      return (
        <span aria-hidden="true" className={`${ARROW_CLASS} opacity-40`} key={dir}>
          <ArrowGlyph dir={dir} />
        </span>
      );
    }

    return (
      <Link
        key={dir}
        href={hrefForPage(dir === 'prev' ? page - 1 : page + 1)}
        scroll={false}
        aria-label={`${t(dir === 'prev' ? 'games.prev' : 'games.next')}: ${title}`}
        className={`${ARROW_CLASS} hover:bg-white/10`}
      >
        <ArrowGlyph dir={dir} />
      </Link>
    );
  };

  return (
    <section className="space-y-[calc(var(--u)*14)] lg:space-y-[calc(var(--u)*20)]">
      <ShelfHeading
        title={title}
        href={categoryHref(shelfKey)}
        controls={
          paged && totalPages > 1 ? (
            <div className="flex items-center gap-[calc(var(--u)*8)] lg:gap-[calc(var(--u)*14)]">
              {arrow('prev')}
              {arrow('next')}
            </div>
          ) : undefined
        }
      />

      {games.length === 0 ? (
        <p className="rl-liquid rounded-[calc(var(--u)*24)] px-[calc(var(--u)*16)] py-[calc(var(--u)*24)] text-center text-xs text-white/40">
          {t('games.empty')}
        </p>
      ) : (
        <div className={SHELF_TRACK}>
          {games.map((game) => (
            <GameTile key={game.id} game={game} surface={shelfKey} />
          ))}
        </div>
      )}
    </section>
  );
};

export default GameRow;
