import { useEffect, useState, type FC } from 'react';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import PlayerLayout from '@/layout/PlayerLayout';
import GameTile from '@/components/player/GameTile';
import Pager from '@/components/player/Pager';
import SiteFooter from '@/components/player/SiteFooter';
import Seo from '@/components/seo/Seo';
import { useTranslation } from '@/context/I18nContext';
import { ALL_GAMES_PATH, CATEGORY_PAGE_SIZE, type ShelfListQuery } from '@/constants/games';
import {
  fetchShelfList,
  fetchTagFilters,
  fetchProviders,
  parsePageParam,
} from '@/services/games.server';
import { markUnavailable } from '@/utils/unavailable.server';
import type { TranslationKey } from '@/i18n/locales';
import type { Game, GamePagination, TagFilterGroup } from '@/types';

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

interface Filters {
  /** Tag slugs, as the API takes them: any within a group, every group. */
  tags: string[];
  provider: string;
  sort: Sort;
}

interface Props extends Filters {
  games: Game[];
  pagination: GamePagination;
  failed: boolean;
  groups: TagFilterGroup[];
  providers: string[];
}

/** The URL for a set of filters: only what differs from the defaults, so the plain page is `/games`. */
const allGamesHref = (f: Filters, page = 1): string => {
  const query = new URLSearchParams();
  if (f.tags.length) query.set('tags', f.tags.join(','));
  if (f.provider) query.set('provider', f.provider);
  if (f.sort !== 'popular') query.set('sort', f.sort);
  if (page > 1) query.set('page', String(page));
  const qs = query.toString();
  return qs ? `${ALL_GAMES_PATH}?${qs}` : ALL_GAMES_PATH;
};

const CHIP =
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors';

/**
 * Every game, with filters that combine (Casino Manager sheet, "All games
 * page"): the Tag Manager groups the operator made public — type, RTP band,
 * volatility, features such as Bonus Buy, Jackpot and Max win — with the
 * studio and the order. Any tag within a group, every group picked: "Bonus
 * Buy + RTP 96–97% + High volatility" narrows, two features widen within
 * Features.
 *
 * Every choice is in the URL, so a filtered list can be shared, survives a
 * refresh and works with the back button; each change is a navigation.
 */
const AllGamesPage: FC<Props> = ({ games, pagination, failed, groups, providers, ...filters }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

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

  const toggleTag = (group: TagFilterGroup, slug: string): void => {
    const on = filters.tags.includes(slug);
    const inGroup = new Set(group.tags.map((tag) => tag.slug));
    // A one-at-a-time group (an RTP band) swaps its pick rather than adding one.
    const kept = group.multiple ? filters.tags : filters.tags.filter((s) => !inGroup.has(s));
    go({ tags: on ? filters.tags.filter((s) => s !== slug) : [...kept, slug] });
  };

  const picked = filters.tags.length + (filters.provider ? 1 : 0);
  const tagName = (slug: string): string =>
    groups.flatMap((g) => g.tags).find((tag) => tag.slug === slug)?.name ?? slug;

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

  const panel = (
    <div className="space-y-5">
      <div>
        <label
          htmlFor="all-games-provider"
          className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-white/45"
        >
          {t('allGames.provider')}
        </label>
        <select
          id="all-games-provider"
          value={filters.provider}
          onChange={(e) => go({ provider: e.target.value })}
          className="rl-glass w-full rounded-xl bg-transparent px-3 py-2 text-[13px] text-white outline-none"
        >
          <option value="" className="bg-[#14161b]">
            {t('allGames.anyProvider')}
          </option>
          {providers.map((name) => (
            <option key={name} value={name} className="bg-[#14161b]">
              {name}
            </option>
          ))}
        </select>
      </div>

      {groups.map((group) => (
        <fieldset key={group.key}>
          <legend className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-white/45">
            {group.name}
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {group.tags.map((tag) => {
              const on = filters.tags.includes(tag.slug);
              return (
                <button
                  key={tag.slug}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleTag(group, tag.slug)}
                  className={`${CHIP} ${on ? 'rl-glass-active text-white' : 'rl-glass rl-glass-hover text-white/60 hover:text-white'}`}
                >
                  {tag.name}
                  <span className="tabular-nums text-[10px] text-white/35">{tag.games}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {groups.length === 0 && (
        <p className="text-[12px] text-white/40">{t('allGames.noFilters')}</p>
      )}
    </div>
  );

  return (
    <PlayerLayout>
      <Seo
        title={t('allGames.title')}
        description={t('allGames.meta')}
        path={allGamesHref({ tags: [], provider: '', sort: 'popular' })}
      />

      <div className="mx-auto max-w-[1600px] space-y-4 pb-2 sm:space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white sm:text-2xl">{t('allGames.title')}</h1>
            <p className="mt-1 text-xs tabular-nums text-white/40">
              {pagination.total > 0
                ? t('games.showing', { from, to, total: pagination.total })
                : ' '}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPanelOpen((v) => !v)}
              aria-expanded={panelOpen}
              aria-controls="all-games-filters"
              className={`${CHIP} rl-glass rl-glass-hover text-white lg:hidden`}
            >
              {picked > 0 ? t('allGames.filtersCount', { count: picked }) : t('allGames.filters')}
            </button>
            <label htmlFor="all-games-sort" className="sr-only">
              {t('allGames.sortBy')}
            </label>
            <select
              id="all-games-sort"
              value={filters.sort}
              onChange={(e) => go({ sort: e.target.value as Sort })}
              className="rl-glass rounded-full bg-transparent px-3 py-1.5 text-[12px] font-medium text-white outline-none"
            >
              {SORTS.map((sort) => (
                <option key={sort} value={sort} className="bg-[#14161b]">
                  {t(SORT_LABEL[sort])}
                </option>
              ))}
            </select>
          </div>
        </header>

        {picked > 0 && (
          <div className="flex flex-wrap items-center gap-1.5" aria-label={t('allGames.active')}>
            {filters.provider && (
              <button
                type="button"
                onClick={() => go({ provider: '' })}
                className={`${CHIP} rl-glass-active text-white`}
              >
                {filters.provider} <span aria-hidden>×</span>
                <span className="sr-only">{t('allGames.remove')}</span>
              </button>
            )}
            {filters.tags.map((slug) => (
              <button
                key={slug}
                type="button"
                onClick={() => go({ tags: filters.tags.filter((s) => s !== slug) })}
                className={`${CHIP} rl-glass-active text-white`}
              >
                {tagName(slug)} <span aria-hidden>×</span>
                <span className="sr-only">{t('allGames.remove')}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => go({ tags: [], provider: '' })}
              className="px-2 text-[12px] font-medium text-[#f9d028] hover:underline"
            >
              {t('allGames.clear')}
            </button>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6">
          <aside
            id="all-games-filters"
            aria-label={t('allGames.filters')}
            className={`${panelOpen ? 'block' : 'hidden'} rl-glass mb-4 rounded-2xl p-4 lg:sticky lg:top-[calc(var(--u)*20+var(--player-bar-h,80px))] lg:mb-0 lg:block lg:max-h-[calc(100vh-120px)] lg:self-start lg:overflow-y-auto`}
          >
            {panel}
          </aside>

          <section
            aria-busy={busy}
            className={`min-w-0 space-y-4 transition-opacity ${busy ? 'opacity-50' : ''}`}
          >
            {failed && (
              <p role="status" className="rl-glass rounded-2xl px-4 py-3 text-sm text-white/55">
                {t('dash.catalogueUnavailable')}
              </p>
            )}

            {!failed && games.length === 0 && (
              <div className="rl-glass rounded-2xl px-4 py-10 text-center text-sm text-white/50">
                <p>{t('allGames.empty')}</p>
                {picked > 0 && (
                  <button
                    type="button"
                    onClick={() => go({ tags: [], provider: '' })}
                    className="mt-3 text-[13px] font-medium text-[#f9d028] hover:underline"
                  >
                    {t('allGames.clear')}
                  </button>
                )}
              </div>
            )}

            {games.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-7">
                {games.map((game) => (
                  <GameTile key={game.id} game={game} surface="all-games" />
                ))}
              </div>
            )}

            {pagination.totalPages > 1 && <div className="flex justify-center pt-2">{pager}</div>}
          </section>
        </div>

        <div className="mt-10 lg:mt-[calc(var(--u)*80)]">
          <SiteFooter />
        </div>
      </div>
    </PlayerLayout>
  );
};

const one = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value)?.trim() ?? '';

export const getServerSideProps: GetServerSideProps<Props> = async ({ query, req, res }) => {
  const [groupRows, providerRows] = await Promise.all([fetchTagFilters(), fetchProviders()]);
  const groups = groupRows ?? [];

  // Only slugs the filters offer: a stale or hand-typed one would fail the whole list.
  // Without the filters to check against, a shared link keeps its tags and the API judges them.
  const known = groupRows && new Set(groupRows.flatMap((g) => g.tags.map((tag) => tag.slug)));
  const tags = [...new Set(one(query.tags).toLowerCase().split(','))].filter((s) =>
    known ? known.has(s) : /^[a-z0-9-]+$/.test(s)
  );
  const providers = (providerRows ?? []).map((p) => p.name);
  const provider = providers.includes(one(query.provider)) ? one(query.provider) : '';
  const sort = (SORTS as readonly string[]).includes(one(query.sort))
    ? (one(query.sort) as Sort)
    : 'popular';
  const page = parsePageParam(query.page);

  const result = await fetchShelfList(
    { sort, ...(provider ? { provider } : {}), ...(tags.length ? { tags: tags.join(',') } : {}) },
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
      tags,
      provider,
      sort,
    },
  };
};

export default AllGamesPage;
