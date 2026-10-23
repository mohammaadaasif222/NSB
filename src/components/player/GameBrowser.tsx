import { Fragment, useEffect, useMemo, useRef, useState, type FC, type ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { useFavourites } from '@/context/FavouritesContext';
import { MIN_SEARCH_LENGTH } from '@/services/catalogue';
import { fetchShelfPage, type BrowseQuery } from '@/services/games';
import {
  CATEGORY_PAGE_SIZE,
  LIVE_CASINO_HREF,
  LOBBY_SHELF_KEYS,
  categoryHref,
  shelfFor,
} from '@/constants/games';
import GameRow from '@/components/player/GameRow';
import GameTile from '@/components/player/GameTile';
import {
  BROWSE_DEFAULTS,
  BrowseToolbar,
  CategoryChips,
  browseGames,
  type BrowseState,
  type ChipKey,
} from '@/components/player/BrowseControls';
import type { Game, GameShelf, GameShelfKey } from '@/types';
import type { TranslationKey } from '@/i18n/locales';

/* ==================================================================== */
/* The browser                                                           */
/* ==================================================================== */

/**
 * The browser's element id. The lobby's provider plates link here as
 * `?provider=<name>#browse`, so a plate lands on this section with that
 * studio already selected — and so does the same URL pasted into a new tab.
 */
export const BROWSE_ANCHOR = 'browse';

interface Props {
  /** Server-rendered shelves — the idle view, and what paints before hydration. */
  shelves: GameShelf[];
  /** The route the browser is on; the provider picker keeps the URL there. */
  basePath?: string;
  /**
   * Show the search / sort / filter toolbar and the category chips. The home
   * lobby's design has neither — it is the shelves alone, and browsing lives
   * on /casino — so it turns them off.
   */
  controls?: boolean;
  /** Show the chips on a phone too. The casino page draws them; the lobby keeps them desktop-only. */
  chipsOnPhone?: boolean;
  /** Which shelves to show when idle, in order. */
  shelfKeys?: readonly GameShelfKey[];
  /** A heading to use instead of a shelf's default one. */
  titles?: Partial<Record<GameShelfKey, TranslationKey>>;
  /**
   * Rows placed among the shelves — the signed-in lobby's sports row, the
   * casino page's providers and tournaments — each after the shelf named.
   */
  inserts?: readonly ShelfInsert[];
  providers?: string[];
  /**
   * The Live Casino lobby: its own chips, which jump to rows on the page
   * rather than filtering, and rows that stay up saying "Coming soon" while
   * they have no tables.
   */
  live?: boolean;
}

const SEARCH_DELAY_MS = 250;

export interface ShelfInsert {
  /** Stable React key. */
  id: string;
  after: GameShelfKey;
  node: ReactNode;
}

/**
 * The lobby's catalogue section: search, sort, filter, provider and category
 * chips over the game shelves.
 *
 * Two modes. Idle — nothing typed or picked — renders the server's shelves
 * as sliders, which fetch their further pages as they are slid, and means the
 * section is complete in the first HTML. As soon as any control is used it switches to
 * a flat result grid.
 */
const GameBrowser: FC<Props> = ({
  shelves,
  basePath = '/',
  controls = true,
  shelfKeys = LOBBY_SHELF_KEYS,
  titles = {},
  chipsOnPhone = false,
  inserts = [],
  providers = [],
  live = false,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [chipsStuck, setChipsStuck] = useState(false);

  const [games, setGames] = useState<Game[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const [term, setTerm] = useState('');

  const [browse, setBrowse] = useState<Omit<BrowseState, 'provider'>>(BROWSE_DEFAULTS);
  const [provider, setProvider] = useState<string>('');
  const [category, setCategory] = useState<ChipKey>('lobby');

  const { token } = useAuth();
  const { games: favourites, failed: favouritesFailed } = useFavourites();

  // Signing out takes the Favourites chip away with the list behind it, so
  // the browser cannot be left showing a category that no longer exists.
  useEffect(() => {
    if (!token) {
      setCategory((current) => (current === 'favourites' ? 'lobby' : current));
    }
  }, [token]);

  /**
   * The provider lives in the URL as well as in state, so a provider plate
   * (or a shared link) can select one, and the address never names a studio
   * the grid is not showing.
   *
   * URL -> state here: a plate changed `?provider=`, so adopt it and bring the
   * browser into view. State -> URL in chooseProvider below. Each direction
   * stops when the two agree, so neither feeds the other in a loop.
   */
  const urlProvider = typeof router.query.provider === 'string' ? router.query.provider : '';
  useEffect(() => {
    if (!router.isReady || urlProvider === provider) {
      return;
    }
    setProvider(urlProvider);
    if (urlProvider) {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // `provider` is deliberately not a dependency: this reacts to the URL
    // changing, not to the dropdown, which syncs the URL itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlProvider, router.isReady]);

  const chooseProvider = (name: string): void => {
    setProvider(name);
    if (name === urlProvider) {
      return;
    }
    const next = { ...router.query };
    if (name) {
      next.provider = name;
    } else {
      delete next.provider;
    }
    void router.replace({ pathname: basePath, query: next }, undefined, {
      shallow: true,
      scroll: false,
    });
  };

  const trimmed = browse.search.trim();
  const wantedTerm = trimmed.length >= MIN_SEARCH_LENGTH ? trimmed : '';
  const browsing =
    wantedTerm !== '' ||
    browse.filter !== BROWSE_DEFAULTS.filter ||
    browse.sort !== BROWSE_DEFAULTS.sort ||
    provider !== '' ||
    category !== 'lobby';

  useEffect(() => {
    if (!wantedTerm) {
      setTerm('');
      return;
    }
    const timer = setTimeout(() => setTerm(wantedTerm), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [wantedTerm]);
  const settling = wantedTerm !== term;

  const query = useMemo<BrowseQuery | null>(() => {
    if (!browsing || settling || category === 'favourites') {
      return null;
    }
    return {
      ...(category === 'lobby' ? {} : shelfFor(category).list),
      sort: browse.sort,
      ...(term ? { search: term } : {}),
      ...(provider ? { provider } : {}),
      ...(browse.filter === 'new' ? { is_new: true } : {}),
    };
  }, [browsing, settling, category, browse.sort, browse.filter, term, provider]);

  const latest = useRef<BrowseQuery | null>(null);
  useEffect(() => {
    latest.current = query;
    if (!query) {
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setFailed(false);

    fetchShelfPage(query, 1, CATEGORY_PAGE_SIZE, controller.signal)
      .then((res) => {
        if (controller.signal.aborted) {
          return;
        }
        setGames(res.data);
        setTotal(res.pagination.total);
        setPage(res.pagination.page);
        setTotalPages(res.pagination.totalPages);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setFailed(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [query]);

  const loadMore = (): void => {
    const requested = query;
    if (!requested || loadingMore) {
      return;
    }
    setLoadingMore(true);
    fetchShelfPage(requested, page + 1, CATEGORY_PAGE_SIZE)
      .then((res) => {
        if (latest.current !== requested) {
          return;
        }
        setGames((current) => {
          const seen = new Set(current.map((g) => g.id));
          return [...current, ...res.data.filter((g) => !seen.has(g.id))];
        });
        setTotal(res.pagination.total);
        setPage(res.pagination.page);
        setTotalPages(res.pagination.totalPages);
      })
      .catch(() => undefined)
      .finally(() => setLoadingMore(false));
  };

  // A shelf with nothing on it (no live games catalogued yet, say) is left
  // out rather than drawn as an empty bar — unless every shelf is empty, when
  // the empty states are the honest thing to show.
  const lobbyShelves = useMemo(() => {
    const listed = shelfKeys
      .map((key) => shelves.find((s) => s.key === key))
      .filter((s): s is GameShelf => s !== undefined);
    const stocked = listed.filter((s) => s.games.length > 0);
    return live || stocked.length === 0 ? listed : stocked;
  }, [shelves, shelfKeys, live]);

  // Each insert follows its shelf, or — if that shelf was left out — the
  // nearest shown shelf before it, so the row keeps its place in the order.
  // Keyed by that shelf; `lead` holds any with no shown shelf before them.
  const placed = useMemo(() => {
    const byShelf = new Map<GameShelfKey | 'lead', ShelfInsert[]>();
    for (const insert of inserts) {
      const limit = shelfKeys.indexOf(insert.after);
      const before = lobbyShelves.filter((s) => shelfKeys.indexOf(s.key) <= limit);
      const anchor = before[before.length - 1]?.key ?? 'lead';
      byShelf.set(anchor, [...(byShelf.get(anchor) ?? []), insert]);
    }
    return byShelf;
  }, [inserts, shelfKeys, lobbyShelves]);

  const insertsAt = (anchor: GameShelfKey | 'lead'): ReactNode =>
    placed.get(anchor)?.map((insert) => <Fragment key={insert.id}>{insert.node}</Fragment>);

  const onFavourites = category === 'favourites';
  const results = useMemo(
    () =>
      onFavourites
        ? browseGames(favourites ?? [], { ...browse, search: wantedTerm, provider })
        : games,
    [onFavourites, games, favourites, browse, wantedTerm, provider]
  );

  const stale = !onFavourites && (loading || settling);
  const busy = onFavourites ? favourites === null : stale && games.length === 0;
  const broke = onFavourites ? favouritesFailed : failed;
  const count = onFavourites ? results.length : total;

  // The chips stay pinned under the top bar; they only take a backdrop while
  // pinned, so at rest they sit on the page like any other row.
  useEffect(() => {
    if (!controls) return undefined;
    let frame = 0;
    const measure = (): void => {
      frame = 0;
      const el = chipsRef.current;
      if (!el) return;
      const pinnedAt = parseFloat(getComputedStyle(el).top) || 0;
      setChipsStuck(el.getBoundingClientRect().top <= pinnedAt + 1 && window.scrollY > 0);
    };
    const onScroll = (): void => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [controls]);

  const [liveChip, setLiveChip] = useState<ChipKey>('lobby');

  // Where the chips' foot sits once pinned. Measured from their sticky
  // offset, not where they are now: picked from the top of the page, they
  // have not pinned yet, and aiming under them would stop short.
  const pinnedChipsFoot = (): number => {
    const el = chipsRef.current;
    if (!el) return 0;
    return (parseFloat(getComputedStyle(el).top) || 0) + el.offsetHeight;
  };

  // Brings `target` up to just under the pinned chips.
  const scrollUnderChips = (target: Element): void => {
    const top = target.getBoundingClientRect().top;
    window.scrollBy({ top: top - pinnedChipsFoot() - 16, behavior: 'smooth' });
  };

  // Live chips are a table of contents: a row on this page, or another page.
  const chooseLive = (next: ChipKey): void => {
    setLiveChip(next);
    if (next === 'lobby') {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const row = document.getElementById(`shelf-${next}`);
    if (row) {
      scrollUnderChips(row);
    } else if (next !== 'favourites') {
      void router.push(categoryHref(next));
    }
  };

  // A chip picked from the pinned row brings the new list up to just under
  // it, instead of leaving the player deep in the old one. Live Casino has a
  // lobby of its own to go to.
  const chooseCategory = (next: ChipKey): void => {
    if (next === 'live') {
      void router.push(LIVE_CASINO_HREF);
      return;
    }
    setCategory(next);
    const body = bodyRef.current?.getBoundingClientRect();
    if (body && body.top < pinnedChipsFoot()) {
      window.scrollBy({ top: body.top - pinnedChipsFoot() - 16, behavior: 'smooth' });
    }
  };

  const clear = (): void => {
    setBrowse(BROWSE_DEFAULTS);
    chooseProvider('');
    setCategory('lobby');
  };

  return (
    <section
      id={BROWSE_ANCHOR}
      ref={sectionRef}
      className="scroll-mt-20 space-y-[30px] lg:space-y-[calc(var(--u)*26)]"
    >
      {/* --- Toolbar --------------------------------------------------- */}
      {controls && (
        <BrowseToolbar
          state={{ ...browse, provider }}
          onChange={({ provider: next, ...rest }) => {
            if (next !== undefined) {
              chooseProvider(next);
            }
            setBrowse((current) => ({ ...current, ...rest }));
          }}
          providers={providers}
        />
      )}

      {/* --- Category chips: desktop only on the lobby, everywhere on casino;
          pinned under the top bar while the page scrolls */}
      {controls && (
        <div
          ref={chipsRef}
          // Pinned flush to the bar's foot, so nothing scrolls past in a gap
          // between them; the padding is the breathing room instead.
          className={`sticky top-[var(--player-bar-h,66px)] z-20 -mx-3 px-3 py-2 transition-[background-color,backdrop-filter] lg:top-[calc(var(--u)*20+var(--player-bar-h,80px))] lg:mx-0 lg:rounded-b-[calc(var(--u)*24)] lg:px-[calc(var(--u)*12)] lg:py-[calc(var(--u)*12)] ${
            chipsStuck ? 'bg-[#07080b]/90 backdrop-blur-xl' : ''
          } ${chipsOnPhone ? '' : 'hidden lg:block'}`}
        >
          {live ? (
            <CategoryChips active={liveChip} onChange={chooseLive} set="live" />
          ) : (
            <CategoryChips active={category} onChange={chooseCategory} />
          )}
        </div>
      )}

      {/* --- Body ------------------------------------------------------- */}
      {!browsing ? (
        <div ref={bodyRef} className="space-y-10 lg:space-y-[calc(var(--u)*80)]">
          {insertsAt('lead')}
          {lobbyShelves.map((shelf) => (
            <Fragment key={shelf.key}>
              <GameRow
                title={t(titles[shelf.key] ?? shelfFor(shelf.key).titleKey)}
                games={shelf.games}
                shelfKey={shelf.key}
                page={shelf.pagination.page}
                totalPages={shelf.pagination.totalPages}
                limit={shelf.pagination.limit}
                soon={live}
              />
              {insertsAt(shelf.key)}
            </Fragment>
          ))}
        </div>
      ) : (
        <div ref={bodyRef} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[17px] font-semibold text-white sm:text-[19px]">
              {t('browse.results')}
              {!busy && !broke && !stale && (
                <span className="ms-2 text-xs font-normal text-white/40">
                  {t('dash.gamesCount', { count })}
                </span>
              )}
            </h2>
            <button
              type="button"
              onClick={clear}
              className="rl-btn-ghost flex-shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-medium"
            >
              {t('browse.clear')}
            </button>
          </div>

          {busy && (
            <p className="rl-glass rounded-2xl px-4 py-10 text-center text-xs text-white/40">
              {t('search.loading')}
            </p>
          )}

          {!busy && broke && (
            <p className="rl-glass rounded-2xl px-4 py-10 text-center text-xs text-white/40">
              {t('search.failed')}
            </p>
          )}

          {!busy && !broke && results.length === 0 && (
            <p className="rl-glass rounded-2xl px-4 py-10 text-center text-xs text-white/40">
              {wantedTerm
                ? t('search.empty', { query: wantedTerm })
                : t(onFavourites ? 'favourites.empty' : 'games.empty')}
            </p>
          )}

          {!busy && !broke && results.length > 0 && (
            <div
              aria-busy={stale}
              className={`grid grid-cols-3 gap-2.5 transition-opacity sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 ${
                stale ? 'opacity-60' : ''
              }`}
            >
              {results.map((game) => (
                <GameTile key={game.id} game={game} surface="browse" />
              ))}
            </div>
          )}

          {!onFavourites && !busy && !broke && page < totalPages && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore || stale}
                className="rl-btn-ghost rounded-lg px-5 py-2 text-xs font-medium disabled:opacity-50"
              >
                {loadingMore ? t('search.loading') : t('browse.loadMore')}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default GameBrowser;
