import { useEffect, useState, type FC } from 'react';
import type { GetServerSideProps } from 'next';
import type { StaticImageData } from 'next/image';
import { useRouter } from 'next/router';

import PlayerLayout from '@/layout/PlayerLayout';
import GameTile from '@/components/player/GameTile';
import Pager from '@/components/player/Pager';
import SiteFooter from '@/components/player/SiteFooter';
import Seo from '@/components/seo/Seo';
import {
  CHIP_ROW,
  ChipButton,
  Dropdown,
  Option,
  SearchField,
} from '@/components/player/BrowseControls';
import { useTranslation } from '@/context/I18nContext';
import {
  ALL_GAMES_PATH,
  CATEGORY_PAGE_SIZE,
  shelfFor,
  type ShelfListQuery,
} from '@/constants/games';
import { MIN_SEARCH_LENGTH } from '@/services/catalogue';
import {
  fetchProviders,
  fetchShelfList,
  fetchTagFilters,
  parsePageParam,
} from '@/services/games.server';
import { markUnavailable } from '@/utils/unavailable.server';
import type { TranslationKey } from '@/i18n/locales';
import type { Game, GamePagination, GameShelfKey, TagFilterGroup } from '@/types';
import sortIcon from '@/assets/lobby/player/tool-sort.svg';
import filterIcon from '@/assets/lobby/player/tool-filter.svg';
import providerIcon from '@/assets/lobby/player/tool-provider.svg';
import chipLobby from '@/assets/lobby/player/chip-lobby.svg';
import chipSlots from '@/assets/lobby/player/chip-slots.svg';
import chipLive from '@/assets/lobby/player/chip-live.svg';
import chipRoulette from '@/assets/lobby/player/chip-roulette.svg';
import chipBaccarat from '@/assets/lobby/player/chip-baccarat.svg';
import chipGameShows from '@/assets/lobby/player/chip-gameshows.svg';
import chipNewArrivals from '@/assets/lobby/player/chip-newarrivals.svg';
import chipOriginals from '@/assets/lobby/player/chip-originals.svg';

type Sort = NonNullable<ShelfListQuery['sort']>;
const SORTS: readonly Sort[] = ['popular', 'trending', 'new', 'rtp', 'az', 'za'];
const SORT_LABEL: Record<Sort, TranslationKey> = {
  popular: 'allGames.sort.popular',
  trending: 'allGames.sort.trending',
  new: 'allGames.sort.new',
  rtp: 'allGames.sort.rtp',
  az: 'allGames.sort.az',
  za: 'allGames.sort.za',
};

/** Max win and release are ranges the API takes as numbers, not tags. */
const MAX_WINS = [1000, 5000, 10000, 20000] as const;
const RELEASES: { days: number; labelKey: TranslationKey }[] = [
  { days: 30, labelKey: 'allGames.release.30' },
  { days: 90, labelKey: 'allGames.release.90' },
  { days: 365, labelKey: 'allGames.release.365' },
];

/**
 * The chip row: the casino's own shelves (a category, live, a collection), so
 * it works whatever the operator has made public in the Tag Manager, and
 * reads as the casino page's chips do.
 */
const KINDS: { key: GameShelfKey; labelKey: TranslationKey; icon: StaticImageData }[] = [
  { key: 'slots', labelKey: 'dash.slots', icon: chipSlots },
  { key: 'live', labelKey: 'dash.liveCasino', icon: chipLive },
  { key: 'originals', labelKey: 'nav.originals', icon: chipOriginals },
  { key: 'instant-wins', labelKey: 'lobby.chips.instantWins', icon: chipNewArrivals },
  { key: 'blackjack', labelKey: 'lobby.chips.blackjack', icon: chipLive },
  { key: 'roulette', labelKey: 'lobby.chips.roulette', icon: chipRoulette },
  { key: 'baccarat', labelKey: 'lobby.chips.baccarat', icon: chipBaccarat },
  { key: 'game-shows', labelKey: 'lobby.chips.gameShows', icon: chipGameShows },
  { key: 'table', labelKey: 'dash.tableGames', icon: chipOriginals },
];
const kindOf = (value: string): GameShelfKey | '' => KINDS.find((k) => k.key === value)?.key ?? '';

/** The Tag Manager's Type group repeats the chips, so it is left out of the dropdowns. */
const TYPE_GROUP = 'type';

interface Filters {
  /** A chip: a shelf key, or '' for every kind. */
  kind: GameShelfKey | '';
  /** Tag slugs, as the API takes them: any within a group, every group. */
  tags: string[];
  provider: string;
  sort: Sort;
  q: string;
  /** 0: any. */
  maxWin: number;
  /** 0: any. */
  released: number;
}

interface Props extends Filters {
  games: Game[];
  pagination: GamePagination;
  failed: boolean;
  groups: TagFilterGroup[];
  providers: string[];
}

const NO_FILTERS: Filters = {
  kind: '',
  tags: [],
  provider: '',
  sort: 'popular',
  q: '',
  maxWin: 0,
  released: 0,
};

/** The URL for a set of filters: only what differs from the defaults, so the plain page is bare. */
const allGamesHref = (f: Filters, page = 1): string => {
  const query = new URLSearchParams();
  if (f.kind) query.set('type', f.kind);
  if (f.q) query.set('q', f.q);
  if (f.tags.length) query.set('tags', f.tags.join(','));
  if (f.provider) query.set('provider', f.provider);
  if (f.maxWin) query.set('max_win', String(f.maxWin));
  if (f.released) query.set('released', String(f.released));
  if (f.sort !== 'popular') query.set('sort', f.sort);
  if (page > 1) query.set('page', String(page));
  const qs = query.toString();
  return qs ? `${ALL_GAMES_PATH}?${qs}` : ALL_GAMES_PATH;
};

const SEARCH_DELAY_MS = 400;

/**
 * Every game, with filters that combine (Casino Manager sheet, "All games
 * page"), in the casino browser's own controls: search, sort and studio on
 * top, the Type tags as the chip row, and a dropdown per other filter — the
 * Tag Manager groups the operator shows players (RTP, volatility,
 * features…), the maximum win and the release date. Any tag within a group,
 * every group: "Bonus Buy + RTP 96–97% + High volatility" narrows.
 *
 * Every choice is in the URL, so a filtered list can be shared, survives a
 * refresh and works with the back button; each change is a navigation.
 */
const AllGamesPage: FC<Props> = ({ games, pagination, failed, groups, providers, ...filters }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [term, setTerm] = useState(filters.q);

  useEffect(() => {
    const start = (): void => setBusy(true);
    const done = (): void => setBusy(false);
    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', done);
    router.events.on('routeChangeError', done);
    return () => {
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', done);
      router.events.off('routeChangeError', done);
    };
  }, [router.events]);

  const go = (next: Partial<Filters>): void => {
    void router.push(allGamesHref({ ...filters, ...next }), undefined, { scroll: false });
  };

  // The box follows the URL (back button, Clear all) and searches once typing pauses.
  useEffect(() => setTerm(filters.q), [filters.q]);
  useEffect(() => {
    const wanted = term.trim().length >= MIN_SEARCH_LENGTH ? term.trim() : '';
    if (wanted === filters.q) return undefined;
    const timer = setTimeout(() => go({ q: wanted }), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
    // `go` reads the current filters; re-running on them would re-arm the timer for nothing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  const filterGroups = groups.filter((g) => g.key !== TYPE_GROUP);
  const allTags = groups.flatMap((g) => g.tags);
  const tagName = (slug: string): string => allTags.find((tag) => tag.slug === slug)?.name ?? slug;
  const inGroup = (group: TagFilterGroup): string[] =>
    filters.tags.filter((slug) => group.tags.some((tag) => tag.slug === slug));
  const without = (group: TagFilterGroup): string[] =>
    filters.tags.filter((slug) => !group.tags.some((tag) => tag.slug === slug));

  const toggleTag = (group: TagFilterGroup, slug: string): void => {
    const on = filters.tags.includes(slug);
    // A one-at-a-time group (an RTP band) swaps its pick rather than adding one.
    const kept = group.multiple ? filters.tags : without(group);
    go({ tags: on ? filters.tags.filter((s) => s !== slug) : [...kept, slug] });
  };

  const maxWinLabel = (value: number): string =>
    t('allGames.maxWinAtLeast', { value: value.toLocaleString() });
  const releaseLabel = (days: number): string =>
    t(RELEASES.find((r) => r.days === days)?.labelKey ?? 'allGames.release');

  const active: { key: string; label: string; clear: Partial<Filters> }[] = [
    ...(filters.provider
      ? [{ key: 'provider', label: filters.provider, clear: { provider: '' } }]
      : []),
    ...filters.tags.map((slug) => ({
      key: slug,
      label: tagName(slug),
      clear: { tags: filters.tags.filter((s) => s !== slug) },
    })),
    ...(filters.maxWin
      ? [{ key: 'max_win', label: maxWinLabel(filters.maxWin), clear: { maxWin: 0 } }]
      : []),
    ...(filters.released
      ? [{ key: 'released', label: releaseLabel(filters.released), clear: { released: 0 } }]
      : []),
  ];

  const from =
    pagination.total === 0 || games.length === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const to = from === 0 ? 0 : from + games.length - 1;
  const pager = (
    <Pager
      page={pagination.page}
      totalPages={pagination.totalPages}
      hrefFor={(page) => allGamesHref(filters, page)}
    />
  );

  return (
    <PlayerLayout>
      <Seo title={t('allGames.title')} description={t('allGames.meta')} path={ALL_GAMES_PATH} />

      <div className="mx-auto max-w-[1600px] space-y-4 pb-2 sm:space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white sm:text-2xl">{t('allGames.title')}</h1>
            <p className="mt-1 text-xs tabular-nums text-white/40">
              {pagination.total > 0
                ? t('games.showing', { from, to, total: pagination.total })
                : ' '}
            </p>
          </div>
          <div className="hidden sm:block">{pager}</div>
        </header>

        {/* --- Search, order and studio: the casino browser's toolbar --- */}
        <div className="flex flex-col gap-[14px] lg:flex-row lg:gap-[calc(var(--u)*20)]">
          <SearchField
            value={term}
            onChange={setTerm}
            placeholder={t('search.placeholder')}
            label={t('search.title')}
          />
          <div className="grid grid-cols-2 gap-[7px] lg:flex lg:gap-[calc(var(--u)*10)]">
            <Dropdown icon={sortIcon} label={t(SORT_LABEL[filters.sort])}>
              {(close) =>
                SORTS.map((sort) => (
                  <Option
                    key={sort}
                    selected={filters.sort === sort}
                    onSelect={() => {
                      close();
                      go({ sort });
                    }}
                  >
                    {t(SORT_LABEL[sort])}
                  </Option>
                ))
              }
            </Dropdown>
            <Dropdown
              icon={providerIcon}
              label={filters.provider || t('browse.provider')}
              active={!!filters.provider}
            >
              {(close) => (
                <>
                  <Option
                    selected={!filters.provider}
                    onSelect={() => {
                      close();
                      go({ provider: '' });
                    }}
                  >
                    {t('browse.allProviders')}
                  </Option>
                  {providers.map((name) => (
                    <Option
                      key={name}
                      selected={filters.provider === name}
                      onSelect={() => {
                        close();
                        go({ provider: name });
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

        {/* --- Kind: the chip row, pinned under the top bar as on the casino page --- */}
        <div className="sticky top-[var(--player-bar-h,66px)] z-20 -mx-3 bg-[#07080b]/90 px-3 py-2 backdrop-blur-xl lg:top-[calc(var(--u)*20+var(--player-bar-h,80px))] lg:mx-0 lg:rounded-b-[calc(var(--u)*24)] lg:px-[calc(var(--u)*12)] lg:py-[calc(var(--u)*12)]">
          <div className={CHIP_ROW}>
            <ChipButton active={!filters.kind} onClick={() => go({ kind: '' })} icon={chipLobby}>
              {t('allGames.allTypes')}
            </ChipButton>
            {KINDS.map((kind) => (
              <ChipButton
                key={kind.key}
                active={filters.kind === kind.key}
                onClick={() => go({ kind: filters.kind === kind.key ? '' : kind.key })}
                icon={kind.icon}
              >
                {t(kind.labelKey)}
              </ChipButton>
            ))}
          </div>
        </div>

        {/* --- One dropdown per filter: a scrolling row on a phone, where each opens as a sheet --- */}
        <div className="scrollbar-none flex gap-[7px] max-lg:-mx-3 max-lg:overflow-x-auto max-lg:px-3 lg:flex-wrap lg:gap-[calc(var(--u)*10)] [&>*]:flex-shrink-0">
          {filterGroups.map((group) => {
            const picked = inGroup(group);
            return (
              <Dropdown
                key={group.key}
                icon={filterIcon}
                label={picked.length ? picked.map(tagName).join(', ') : group.name}
                active={picked.length > 0}
                align="start"
                sheetOnPhone
              >
                {(close) => (
                  <>
                    <Option
                      selected={picked.length === 0}
                      onSelect={() => {
                        close();
                        go({ tags: without(group) });
                      }}
                    >
                      {t('allGames.any')}
                    </Option>
                    {group.tags.map((tag) => (
                      <Option
                        key={tag.slug}
                        multi={group.multiple}
                        selected={filters.tags.includes(tag.slug)}
                        count={tag.games}
                        onSelect={() => {
                          if (!group.multiple) close();
                          toggleTag(group, tag.slug);
                        }}
                      >
                        {tag.name}
                      </Option>
                    ))}
                  </>
                )}
              </Dropdown>
            );
          })}

          <Dropdown
            icon={filterIcon}
            label={
              filters.maxWin
                ? `${t('game.maxWin')} ${maxWinLabel(filters.maxWin)}`
                : t('game.maxWin')
            }
            active={filters.maxWin > 0}
            align="start"
            sheetOnPhone
          >
            {(close) =>
              [0, ...MAX_WINS].map((value) => (
                <Option
                  key={value}
                  selected={filters.maxWin === value}
                  onSelect={() => {
                    close();
                    go({ maxWin: value });
                  }}
                >
                  {value ? maxWinLabel(value) : t('allGames.any')}
                </Option>
              ))
            }
          </Dropdown>

          <Dropdown
            icon={filterIcon}
            label={filters.released ? releaseLabel(filters.released) : t('allGames.release')}
            active={filters.released > 0}
            align="start"
            sheetOnPhone
          >
            {(close) =>
              [{ days: 0, labelKey: 'allGames.any' as TranslationKey }, ...RELEASES].map((r) => (
                <Option
                  key={r.days}
                  selected={filters.released === r.days}
                  onSelect={() => {
                    close();
                    go({ released: r.days });
                  }}
                >
                  {t(r.labelKey)}
                </Option>
              ))
            }
          </Dropdown>
        </div>

        {active.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5" aria-label={t('allGames.active')}>
            {active.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => go(chip.clear)}
                className="rl-glass-btn inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-[#f0f1f5]"
              >
                {chip.label} <span aria-hidden>×</span>
                <span className="sr-only">{t('allGames.remove')}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => go({ ...NO_FILTERS, sort: filters.sort })}
              className="px-2 text-[12px] font-medium text-[#ffe779] hover:underline"
            >
              {t('allGames.clear')}
            </button>
          </div>
        )}

        <section
          aria-busy={busy}
          className={`space-y-4 transition-opacity ${busy ? 'opacity-50' : ''}`}
        >
          {failed && (
            <p role="status" className="rl-glass rounded-2xl px-4 py-3 text-sm text-white/55">
              {t('dash.catalogueUnavailable')}
            </p>
          )}

          {!failed && games.length === 0 && (
            <div className="rl-glass rounded-2xl px-4 py-10 text-center text-sm text-white/50">
              <p>{filters.q ? t('search.empty', { query: filters.q }) : t('allGames.empty')}</p>
              {active.length > 0 && (
                <button
                  type="button"
                  onClick={() => go({ ...NO_FILTERS, sort: filters.sort })}
                  className="mt-3 text-[13px] font-medium text-[#ffe779] hover:underline"
                >
                  {t('allGames.clear')}
                </button>
              )}
            </div>
          )}

          {games.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
              {games.map((game) => (
                <GameTile key={game.id} game={game} surface="all-games" />
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && <div className="flex justify-center pt-2">{pager}</div>}
        </section>

        <div className="mt-10 lg:mt-[calc(var(--u)*80)]">
          <SiteFooter />
        </div>
      </div>
    </PlayerLayout>
  );
};

const one = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value)?.trim() ?? '';

/** A positive whole number from the query that is one of `allowed`, or 0. */
const oneOf = (value: string | string[] | undefined, allowed: readonly number[]): number => {
  const n = Number(one(value));
  return allowed.includes(n) ? n : 0;
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
  query,
  req,
  res,
  locale,
  defaultLocale,
}) => {
  const [groupRows, providerRows] = await Promise.all([fetchTagFilters(), fetchProviders()]);
  const groups = groupRows ?? [];

  // Only slugs the filters offer: a stale or hand-typed one would fail the whole list.
  // Without the filters to check against, a shared link keeps its tags and the API judges them.
  const known = groupRows && new Set(groupRows.flatMap((g) => g.tags.map((tag) => tag.slug)));
  const asked = [...new Set(one(query.tags).toLowerCase().split(','))].filter(Boolean);
  const tags = asked.filter((s) => (known ? known.has(s) : /^[a-z0-9-]+$/.test(s)));
  const kind = kindOf(one(query.type));
  const providers = (providerRows ?? []).map((p) => p.name);
  const provider = providers.includes(one(query.provider)) ? one(query.provider) : '';
  const sort = (SORTS as readonly string[]).includes(one(query.sort))
    ? (one(query.sort) as Sort)
    : 'popular';
  const q = one(query.q).slice(0, 80);
  const maxWin = oneOf(query.max_win, MAX_WINS);
  const released = oneOf(
    query.released,
    RELEASES.map((r) => r.days)
  );
  const page = parsePageParam(query.page);

  // A link naming a tag no longer offered, or an unknown kind, lands on the list it
  // actually shows, so the address and the grid never disagree.
  if (tags.length !== asked.length || (one(query.type) && !kind)) {
    const prefix = locale && locale !== defaultLocale ? `/${locale}` : '';
    const href = allGamesHref(
      { kind, tags, provider, sort, q: q.length >= MIN_SEARCH_LENGTH ? q : '', maxWin, released },
      page
    );
    return { redirect: { destination: `${prefix}${href}`, permanent: false } };
  }

  const result = await fetchShelfList(
    {
      ...(kind ? shelfFor(kind).list : {}),
      sort,
      ...(provider ? { provider } : {}),
      ...(tags.length ? { tags: tags.join(',') } : {}),
      ...(q.length >= MIN_SEARCH_LENGTH ? { search: q } : {}),
      ...(maxWin ? { max_win_min: maxWin } : {}),
      ...(released ? { released_within_days: released } : {}),
    },
    page,
    CATEGORY_PAGE_SIZE
  );
  if (result.failed) {
    markUnavailable({ req, res });
  }

  return {
    props: {
      games: result.data,
      pagination: result.pagination,
      failed: result.failed,
      groups,
      providers,
      kind,
      tags,
      provider,
      sort,
      q: q.length >= MIN_SEARCH_LENGTH ? q : '',
      maxWin,
      released,
    },
  };
};

export default AllGamesPage;
