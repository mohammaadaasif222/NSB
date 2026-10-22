import { useCallback, useRef, useState, type FC } from 'react';
import type { Game, GameShelfKey } from '@/types';
import { LIVE_CASINO_HREF, categoryHref, shelfFor } from '@/constants/games';
import { useTranslation } from '@/context/I18nContext';
import { fetchShelfPage } from '@/services/games';
import ScrollShelf from './ScrollShelf';
import GameTile from './GameTile';
import ComingSoonCard from './ComingSoonCard';

interface Props {
  title: string;
  /** The server-rendered tiles: the shelf's first page, painted before hydration. */
  games: Game[];
  /** The category this shelf belongs to; "View all" links to its page. */
  shelfKey: GameShelfKey;
  /**
   * Where the server-rendered games sit in the shelf's listing. With both
   * given, the slider fetches the following pages as it nears the end; leave
   * them out for a fixed row (a game page's "more from").
   */
  page?: number;
  totalPages?: number;
  /** Games per page in that listing, so the pages fetched here follow on from it. */
  limit?: number;
  /** Empty, say "Coming soon" instead of "no games" — for rows waiting on content. */
  soon?: boolean;
}

/** The API's default page size, which the home shelves are rendered at. */
const DEFAULT_LIMIT = 10;

/**
 * One shelf of games, as a slider.
 *
 * The server renders the first page, so the shelf is complete in the first
 * HTML. The heading arrows glide it a page of tiles at a time, and as the
 * player nears the end the next page of the shelf's listing is fetched in
 * the browser and appended — the same query its "View all" page sends — so
 * the shelf runs on until the listing does, without a navigation.
 */
const GameRow: FC<Props> = ({
  title,
  games: initial,
  shelfKey,
  page,
  totalPages,
  limit = DEFAULT_LIMIT,
  soon = false,
}) => {
  const { t } = useTranslation();
  const [games, setGames] = useState(initial);
  const [loaded, setLoaded] = useState(page ?? 1);
  const [last, setLast] = useState(totalPages ?? 1);
  const [failed, setFailed] = useState(false);
  const loading = useRef(false);

  // A fresh server render (a navigation, another game's page) starts the
  // shelf over. Compared by content, not identity, so a parent re-render that
  // rebuilds the same array does not throw away what was loaded.
  const seed = `${initial.map((g) => g.id).join(',')}@${page}/${totalPages}`;
  const [current, setCurrent] = useState(seed);
  const generation = useRef(seed);
  if (current !== seed) {
    setCurrent(seed);
    setGames(initial);
    setLoaded(page ?? 1);
    setLast(totalPages ?? 1);
    setFailed(false);
  }
  generation.current = seed;

  const hasMore = page !== undefined && totalPages !== undefined && !failed && loaded < last;

  const loadMore = useCallback((): void => {
    if (loading.current || !hasMore) {
      return;
    }
    loading.current = true;
    const startedFor = generation.current;

    fetchShelfPage(shelfFor(shelfKey).list, loaded + 1, limit)
      .then(({ data, pagination }) => {
        if (generation.current !== startedFor) {
          return;
        }
        // Popularity can reorder the listing between requests, so a game
        // may turn up on two pages; it is shown once.
        setGames((held) => {
          const ids = new Set(held.map((g) => g.id));
          return [...held, ...data.filter((g) => !ids.has(g.id))];
        });
        setLoaded(pagination.page);
        setLast(pagination.totalPages);
      })
      // The shelf keeps what it has; the arrow at the end simply stops.
      .catch(() => generation.current === startedFor && setFailed(true))
      .finally(() => {
        loading.current = false;
      });
  }, [hasMore, shelfKey, loaded, limit]);

  return (
    <ScrollShelf
      id={`shelf-${shelfKey}`}
      title={title}
      // An empty "coming soon" row has nothing to view all of.
      // Live Casino's "View all" is its own lobby rather than a flat grid.
      href={
        soon && games.length === 0
          ? undefined
          : shelfKey === 'live'
            ? LIVE_CASINO_HREF
            : categoryHref(shelfKey)
      }
      hasMore={hasMore}
      onLoadMore={loadMore}
      empty={
        soon ? (
          <ComingSoonCard body={t('lobby.live.comingSoonBody')} />
        ) : (
          <p className="rl-liquid rounded-[calc(var(--u)*24)] px-[calc(var(--u)*16)] py-[calc(var(--u)*24)] text-center text-xs text-white/40">
            {t('games.empty')}
          </p>
        )
      }
    >
      {games.map((game) => (
        <GameTile key={game.id} game={game} surface={shelfKey} />
      ))}
    </ScrollShelf>
  );
};

export default GameRow;
