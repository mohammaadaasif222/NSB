import { Fragment, useEffect, useMemo, useRef, useState, type FC, type ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from '@/context/I18nContext';
import { fetchCatalogue, providersOf } from '@/services/catalogue';
import { LOBBY_SHELF_KEYS, listMatches, shelfFor } from '@/constants/games';
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
}

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
 * a flat result grid built from the catalogue fetched in the browser, because
 * the API cannot search or sort across pages for us. The catalogue is only
 * fetched once, lazily, the first time a control is touched — an idle visitor
 * never pays for it.
 */
const GameBrowser: FC<Props> = ({
  shelves,
  basePath = '/',
  controls = true,
  shelfKeys = LOBBY_SHELF_KEYS,
  titles = {},
  chipsOnPhone = false,
  inserts = [],
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [wanted, setWanted] = useState(false);

  const [browse, setBrowse] = useState<Omit<BrowseState, 'provider'>>(BROWSE_DEFAULTS);
  const [provider, setProvider] = useState<string>('');
  const [category, setCategory] = useState<ChipKey>('lobby');

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
  const browsing =
    trimmed !== '' ||
    browse.filter !== BROWSE_DEFAULTS.filter ||
    browse.sort !== BROWSE_DEFAULTS.sort ||
    provider !== '' ||
    category !== 'lobby';

  // Pull the catalogue the first time it is actually needed, not on mount.
  //
  // Guarded against unmount only — NOT against this effect re-running. The
  // first version cancelled on every dependency change, and it set `wanted`
  // itself: that re-ran the effect at once, the cleanup marked the fetch
  // cancelled, and the catalogue that arrived a moment later was thrown away.
  // Search, filter, sort and the provider picker all sat on "Loading games…"
  // for ever, with every request answered.
  const mounted = useRef(true);
  useEffect(() => {
    // Set on mount too, not only initialised: React's dev StrictMode mounts,
    // unmounts and remounts, and a flag left false by that rehearsal would
    // discard the result exactly as before.
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!browsing || wanted) {
      return;
    }
    setWanted(true);
    setLoading(true);

    fetchCatalogue()
      .then((all) => mounted.current && setGames(all))
      .catch(() => mounted.current && setFailed(true))
      .finally(() => mounted.current && setLoading(false));
  }, [browsing, wanted]);

  const providers = useMemo(() => providersOf(games), [games]);

  // A shelf with nothing on it (no live games catalogued yet, say) is left
  // out rather than drawn as an empty bar — unless every shelf is empty, when
  // the empty states are the honest thing to show.
  const lobbyShelves = useMemo(() => {
    const listed = shelfKeys
      .map((key) => shelves.find((s) => s.key === key))
      .filter((s): s is GameShelf => s !== undefined);
    const stocked = listed.filter((s) => s.games.length > 0);
    return stocked.length > 0 ? stocked : listed;
  }, [shelves, shelfKeys]);

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

  const results = useMemo(() => {
    const inCategory =
      category === 'lobby' ? games : games.filter((g) => listMatches(g, shelfFor(category).list));
    return browseGames(inCategory, { ...browse, provider });
  }, [games, category, browse, provider]);

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

      {/* --- Category chips: desktop only on the lobby, everywhere on casino */}
      {controls && (
        <div className={chipsOnPhone ? '' : 'hidden lg:block'}>
          <CategoryChips active={category} onChange={setCategory} />
        </div>
      )}

      {/* --- Body ------------------------------------------------------- */}
      {!browsing ? (
        <div className="space-y-10 lg:space-y-[calc(var(--u)*80)]">
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
              />
              {insertsAt(shelf.key)}
            </Fragment>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[17px] font-semibold text-white sm:text-[19px]">
              {t('browse.results')}
              {!loading && !failed && (
                <span className="ms-2 text-xs font-normal text-white/40">
                  {t('dash.gamesCount', { count: results.length })}
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

          {loading && (
            <p className="rl-glass rounded-2xl px-4 py-10 text-center text-xs text-white/40">
              {t('search.loading')}
            </p>
          )}

          {!loading && failed && (
            <p className="rl-glass rounded-2xl px-4 py-10 text-center text-xs text-white/40">
              {t('search.failed')}
            </p>
          )}

          {!loading && !failed && results.length === 0 && (
            <p className="rl-glass rounded-2xl px-4 py-10 text-center text-xs text-white/40">
              {trimmed ? t('search.empty', { query: browse.search }) : t('games.empty')}
            </p>
          )}

          {!loading && !failed && results.length > 0 && (
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
              {results.map((game) => (
                <GameTile key={game.id} game={game} surface="browse" />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default GameBrowser;
