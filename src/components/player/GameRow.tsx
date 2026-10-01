import type { FC, ReactNode } from 'react';
import Link from 'next/link';
import type { Game, GameShelfKey } from '@/types';
import { categoryHref } from '@/constants/games';
import { useTranslation } from '@/context/I18nContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
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

const ARROW = 'flex h-8 w-8 items-center justify-center rounded-full';

/* ==================================================================== */
/* Shared heading                                                        */
/* ==================================================================== */

interface HeadingProps {
  title: string;
  /** Omit to render the heading without a "View all" link. */
  href?: string;
  /** Rendered in place of the arrow pair — used by the scroll-paged shelves. */
  controls?: ReactNode;
  className?: string;
}

/**
 * The heading every shelf on the lobby shares: the title, "View all", and a
 * pair of round arrows at the end.
 *
 * Exported because the sports, live-game and streamer rows are not built from
 * catalogue games and so cannot use `GameRow`, but must line up with it to the
 * pixel.
 */
export const ShelfHeading: FC<HeadingProps> = ({ title, href, controls, className = '' }) => {
  const { t } = useTranslation();

  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <h2 className="min-w-0 truncate text-[17px] font-semibold text-white sm:text-[19px]">
        {title}
      </h2>

      <div className="flex flex-shrink-0 items-center gap-2.5">
        {href && (
          <Link
            href={href}
            className="whitespace-nowrap text-[12px] text-white/50 transition-colors hover:text-white"
          >
            {t('dash.viewAll')}
          </Link>
        )}
        {controls}
      </div>
    </div>
  );
};

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
    const glyph = dir === 'prev' ? <ChevronLeftIcon size={13} /> : <ChevronRightIcon size={13} />;

    if (!enabled) {
      return (
        <span
          aria-hidden="true"
          className={`${ARROW} border border-white/[0.05] text-white/15`}
          key={dir}
        >
          {glyph}
        </span>
      );
    }

    return (
      <Link
        key={dir}
        href={hrefForPage(dir === 'prev' ? page - 1 : page + 1)}
        scroll={false}
        aria-label={`${t(dir === 'prev' ? 'games.prev' : 'games.next')}: ${title}`}
        className={`rl-glass rl-glass-hover ${ARROW} text-white/70 hover:text-white`}
      >
        {glyph}
      </Link>
    );
  };

  return (
    <section className="space-y-3">
      <ShelfHeading
        title={title}
        href={categoryHref(shelfKey)}
        controls={
          paged && totalPages > 1 ? (
            <div className="flex items-center gap-1.5">
              {arrow('prev')}
              {arrow('next')}
            </div>
          ) : undefined
        }
      />

      {games.length === 0 ? (
        <p className="rl-glass rounded-2xl px-4 py-6 text-center text-xs text-white/40">
          {t('games.empty')}
        </p>
      ) : (
        <div className="rl-shelf -mx-1 gap-2.5 px-1 pb-1">
          {games.map((game) => (
            <GameTile key={game.id} game={game} layout="shelf" surface={shelfKey} />
          ))}
        </div>
      )}
    </section>
  );
};

export default GameRow;
