import { useEffect, useMemo, useRef, useState, type FC, type ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from '@/context/I18nContext';
import { fetchCatalogue, gameMatches, providersOf } from '@/services/catalogue';
import { GAME_CATEGORIES } from '@/constants/games';
import GameRow from '@/components/player/GameRow';
import GameTile from '@/components/player/GameTile';
import {
  CATEGORY_ICONS,
  ChevronDownIcon,
  LayersIcon,
  SearchIcon,
  SlidersIcon,
  SortIcon,
  type IconProps,
} from '@/components/icons';
import type { Game, GameShelf, GameShelfKey } from '@/types';
import type { TranslationKey } from '@/i18n/locales';

/* ==================================================================== */
/* Controls                                                              */
/* ==================================================================== */

type SortKey = 'az' | 'za' | 'rtp' | 'new';
type FilterKey = 'all' | 'new';

const SORTS: { key: SortKey; labelKey: TranslationKey }[] = [
  { key: 'az', labelKey: 'browse.sortAZ' },
  { key: 'za', labelKey: 'browse.sortZA' },
  { key: 'rtp', labelKey: 'browse.sortRtp' },
  { key: 'new', labelKey: 'browse.sortNewest' },
];

const FILTERS: { key: FilterKey; labelKey: TranslationKey }[] = [
  { key: 'all', labelKey: 'browse.filterAll' },
  { key: 'new', labelKey: 'browse.filterNew' },
];

interface DropdownProps {
  icon: ReactNode;
  label: string;
  children: (close: () => void) => ReactNode;
}

/** A toolbar dropdown: pill trigger, panel anchored under it, closes on click-away. */
const Dropdown: FC<DropdownProps> = ({ icon, label, children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const away = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const esc = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="rl-glass rl-glass-hover flex h-11 w-full items-center gap-2 rounded-xl px-3 text-[12px] font-medium text-white/85 sm:w-auto"
      >
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60">
          {icon}
        </span>
        <span className="truncate">{label}</span>
        <ChevronDownIcon
          size={12}
          className={`ms-auto flex-shrink-0 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="rl-menu thin-scrollbar absolute end-0 top-12 z-30 max-h-72 w-56 overflow-y-auto rounded-xl py-1"
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
};

const Option: FC<{ selected: boolean; onSelect: () => void; children: ReactNode }> = ({
  selected,
  onSelect,
  children,
}) => (
  <button
    type="button"
    role="menuitemradio"
    aria-checked={selected}
    onClick={onSelect}
    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
      selected ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
    }`}
  >
    <span className="truncate">{children}</span>
  </button>
);

/* ==================================================================== */
/* Category chips                                                        */
/* ==================================================================== */

/**
 * The chip row.
 *
 * The first five are real: "Lobby" plus the four categories the catalogue
 * actually has. The rest are in the design but have no games behind them —
 * the backend's category enum is ORIGINALS / NEW_RELEASE / FEATURED / SLOTS —
 * so they render dimmed and tagged "Soon" rather than filtering to an empty
 * grid. Delete DESIGN_ONLY_CHIPS to drop them.
 */
const DESIGN_ONLY_CHIPS = [
  'Live Casino',
  'Blackjack',
  'Roulette',
  'Baccarat',
  'Game Shows',
  'Table Games',
];

type ChipKey = GameShelfKey | 'lobby';

const CategoryChips: FC<{
  active: ChipKey;
  onChange: (key: ChipKey) => void;
  soonLabel: string;
}> = ({ active, onChange, soonLabel }) => {
  const { t } = useTranslation();

  const chip = (key: ChipKey, label: string, Icon: FC<IconProps>): ReactNode => (
    <button
      key={key}
      type="button"
      onClick={() => onChange(key)}
      aria-pressed={active === key}
      className={`inline-flex h-9 flex-shrink-0 items-center gap-2 rounded-full px-3 text-[12px] font-medium transition-colors ${
        active === key
          ? 'rl-glass-active text-white'
          : 'rl-glass rl-glass-hover text-white/55 hover:text-white'
      }`}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white/60">
        <Icon size={11} />
      </span>
      {label}
    </button>
  );

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
      {chip('lobby', t('browse.lobby'), LayersIcon)}
      {GAME_CATEGORIES.map((c) => chip(c.key, t(c.titleKey), CATEGORY_ICONS[c.key]))}

      {DESIGN_ONLY_CHIPS.map((label) => (
        <span
          key={label}
          title={`${label} — ${soonLabel}`}
          aria-disabled="true"
          className="rl-glass inline-flex h-9 flex-shrink-0 cursor-default items-center gap-2 rounded-full px-3 text-[12px] font-medium text-white/25"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.06] text-white/25">
            <LayersIcon size={11} />
          </span>
          {label}
        </span>
      ))}
    </div>
  );
};

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
  /** The page's query, so shelf pager links keep the other shelves' pages. */
  query: Record<string, string>;
  /** The route the shelves are on; their pager links are built against it. */
  basePath?: string;
}

const sortGames = (games: Game[], key: SortKey): Game[] => {
  const out = [...games];
  switch (key) {
    case 'az':
      return out.sort((a, b) => a.title.localeCompare(b.title));
    case 'za':
      return out.sort((a, b) => b.title.localeCompare(a.title));
    case 'rtp':
      // Games without a published RTP sort last.
      return out.sort((a, b) => (b.rtp ?? -1) - (a.rtp ?? -1));
    case 'new':
      return out.sort((a, b) => Number(b.is_new) - Number(a.is_new));
  }
};

/**
 * The lobby's catalogue section: search, sort, filter, provider and category
 * chips over the game shelves.
 *
 * Two modes. Idle — nothing typed or picked — renders the server's shelves
 * exactly as before, which keeps their URL-based paging and means the section
 * is complete in the first HTML. As soon as any control is used it switches to
 * a flat result grid built from the catalogue fetched in the browser, because
 * the API cannot search or sort across pages for us. The catalogue is only
 * fetched once, lazily, the first time a control is touched — an idle visitor
 * never pays for it.
 */
const GameBrowser: FC<Props> = ({ shelves, query, basePath = '/' }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [wanted, setWanted] = useState(false);

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('az');
  const [filter, setFilter] = useState<FilterKey>('all');
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

  const trimmed = search.trim().toLowerCase();
  const browsing =
    trimmed !== '' || filter !== 'all' || provider !== '' || category !== 'lobby' || sort !== 'az';

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

  const results = useMemo(() => {
    let out = games;

    if (category !== 'lobby') {
      const def = GAME_CATEGORIES.find((c) => c.key === category);
      out = def ? out.filter((g) => g.category === def.category) : out;
    }
    if (trimmed) {
      out = out.filter((g) => gameMatches(g, trimmed));
    }
    if (filter === 'new') {
      out = out.filter((g) => g.is_new);
    }
    if (provider) {
      out = out.filter((g) => g.provider === provider);
    }
    return sortGames(out, sort);
  }, [games, category, trimmed, filter, provider, sort]);

  const clear = (): void => {
    setSearch('');
    setSort('az');
    setFilter('all');
    chooseProvider('');
    setCategory('lobby');
  };

  const sortLabel = t(SORTS.find((s) => s.key === sort)?.labelKey ?? 'browse.sort');
  const filterLabel = t(FILTERS.find((f) => f.key === filter)?.labelKey ?? 'browse.filter');

  return (
    <section id={BROWSE_ANCHOR} ref={sectionRef} className="scroll-mt-20 space-y-4">
      {/* --- Toolbar --------------------------------------------------- */}
      <div className="rl-glass rounded-2xl p-3">
        <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
          <label className="rl-field flex h-11 items-center gap-2.5 rounded-xl px-3">
            <span className="flex-shrink-0 text-white/40" aria-hidden="true">
              <SearchIcon size={17} />
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search.placeholder')}
              aria-label={t('search.title')}
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
            />
          </label>

          <Dropdown icon={<SortIcon size={12} />} label={sortLabel}>
            {(close) =>
              SORTS.map((s) => (
                <Option
                  key={s.key}
                  selected={sort === s.key}
                  onSelect={() => {
                    setSort(s.key);
                    close();
                  }}
                >
                  {t(s.labelKey)}
                </Option>
              ))
            }
          </Dropdown>

          <Dropdown icon={<SlidersIcon size={12} />} label={filterLabel}>
            {(close) =>
              FILTERS.map((f) => (
                <Option
                  key={f.key}
                  selected={filter === f.key}
                  onSelect={() => {
                    setFilter(f.key);
                    close();
                  }}
                >
                  {t(f.labelKey)}
                </Option>
              ))
            }
          </Dropdown>

          <Dropdown icon={<LayersIcon size={12} />} label={provider || t('browse.provider')}>
            {(close) => (
              <>
                <Option
                  selected={provider === ''}
                  onSelect={() => {
                    chooseProvider('');
                    close();
                  }}
                >
                  {t('browse.allProviders')}
                </Option>
                {providers.map((name) => (
                  <Option
                    key={name}
                    selected={provider === name}
                    onSelect={() => {
                      chooseProvider(name);
                      close();
                    }}
                  >
                    {name}
                  </Option>
                ))}
              </>
            )}
          </Dropdown>
        </div>
      </div>

      {/* --- Category chips -------------------------------------------- */}
      <CategoryChips active={category} onChange={setCategory} soonLabel={t('common.soon')} />

      {/* --- Body ------------------------------------------------------- */}
      {!browsing ? (
        <div className="space-y-5 sm:space-y-7">
          {shelves.map((shelf) => (
            <GameRow
              key={shelf.key}
              title={t(
                GAME_CATEGORIES.find((c) => c.key === shelf.key)?.titleKey ?? 'dash.featuredGames'
              )}
              games={shelf.games}
              shelfKey={shelf.key}
              page={shelf.pagination.page}
              totalPages={shelf.pagination.totalPages}
              query={query}
              basePath={basePath}
            />
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
              {trimmed ? t('search.empty', { query: search }) : t('games.empty')}
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
