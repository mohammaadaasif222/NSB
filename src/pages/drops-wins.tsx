import type { FC } from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';

import PlayerLayout from '@/layout/PlayerLayout';
import GameTile from '@/components/player/GameTile';
import Pager from '@/components/player/Pager';
import GameListToolbar, { SORTS, type Sort } from '@/components/player/GameListToolbar';
import PrizeDropCard from '@/components/player/PrizeDropCard';
import RecentWinners from '@/components/player/RecentWinners';
import SiteFooter from '@/components/player/SiteFooter';
import { CATEGORY_ICONS } from '@/components/icons';
import { CHIP_BAR, CHIP_ICON, CHIP_ROW, chipClass } from '@/components/player/BrowseControls';
import { useTranslation } from '@/context/I18nContext';
import {
  CASINO_LISTING_KEYS,
  CATEGORY_PAGE_SIZE,
  categoryHref,
  dropsWinsHref,
  shelfFor,
  type CategoryFilters,
} from '@/constants/games';
import { MIN_SEARCH_LENGTH } from '@/services/catalogue';
import {
  fetchPrizeDropsServer,
  fetchShelfList,
  fetchShelfProviders,
  parsePageParam,
} from '@/services/games.server';
import type { PrizeDrop } from '@/services/prizeDrops';
import { markUnavailable } from '@/utils/unavailable.server';
import type { Game, GamePagination } from '@/types';
import Seo from '@/components/seo/Seo';

interface Props extends Required<CategoryFilters> {
  /** Every campaign running now, without its game list (the grid below pages through it). */
  drops: PrizeDrop[];
  /** The campaign shown; null when none runs. */
  dropId: string | null;
  /** Studio names for the toolbar's provider list. */
  providers: string[];
  games: Game[];
  pagination: GamePagination;
  failed: boolean;
}

const NO_PAGE: GamePagination = { total: 0, page: 1, limit: CATEGORY_PAGE_SIZE, totalPages: 0 };

/**
 * Drops & Wins: a prize drop campaign's facts, then its games as every
 * casino listing shows them — the same chips, pager, toolbar and tiles as
 * /games/[category], backed by `GET /games?prize_drop=…`. With more than one
 * campaign running, chips pick between them (`?drop=`). The providers pick
 * the winners and pay the prizes; this page only says where and when to play.
 */
const DropsWinsPage: FC<Props> = ({
  drops,
  dropId,
  providers,
  games,
  pagination,
  failed,
  ...filters
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const drop = drops.find((d) => d.id === dropId) ?? null;
  // The address names a campaign only when there is a choice to make.
  const dropKey = drops.length > 1 ? dropId : null;
  const filtered = !!(filters.q || filters.provider || filters.sort);
  const go = (next: CategoryFilters): void => {
    void router.push(dropsWinsHref(dropKey, 1, { ...filters, ...next }), undefined, {
      scroll: false,
    });
  };
  const title = t('lobby.rail.dropsWins');

  const from =
    pagination.total === 0 || games.length === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const to = from === 0 ? 0 : from + games.length - 1;

  const pager = (
    <Pager
      page={pagination.page}
      totalPages={pagination.totalPages}
      hrefFor={(page) => dropsWinsHref(dropKey, page, filters)}
    />
  );

  return (
    <PlayerLayout>
      <Seo
        title={title}
        description={t('lobby.drops.pageIntro')}
        path={dropsWinsHref(dropKey, pagination.page)}
      />

      <div className="mx-auto max-w-[1548px] px-1 lg:max-w-[calc(var(--u)*1548)] lg:px-0 space-y-4 pb-2 sm:space-y-6">
        {/* Category tabs, as on every casino listing */}
        <nav className={CHIP_BAR} aria-label={t('dash.categories')}>
          <div className={CHIP_ROW}>
            {CASINO_LISTING_KEYS.map(shelfFor).map((c) => {
              const Icon = CATEGORY_ICONS[c.key];
              return (
                <Link
                  key={c.key}
                  href={categoryHref(c.key)}
                  className={`${chipClass(false)} whitespace-nowrap`}
                >
                  <Icon className={CHIP_ICON} />
                  {t(c.titleKey)}
                </Link>
              );
            })}
          </div>
        </nav>

        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white sm:text-2xl">{title}</h1>
            {pagination.total > 0 && (
              <p className="mt-1 text-xs tabular-nums text-white/40">
                {t('games.showing', { from, to, total: pagination.total })}
              </p>
            )}
          </div>
          {pager}
        </header>

        <p className="max-w-[720px] text-sm text-white/55">{t('lobby.drops.pageIntro')}</p>

        {drops.length > 1 && (
          <nav aria-label={title} className="rl-shelf -mx-4 flex gap-[7px] px-4 lg:mx-0 lg:px-0">
            {drops.map((d) => (
              <Link
                key={d.id}
                href={dropsWinsHref(d.id)}
                aria-current={d.id === dropId ? 'page' : undefined}
                className={`${chipClass(d.id === dropId)} whitespace-nowrap`}
              >
                {d.name}
              </Link>
            ))}
          </nav>
        )}

        {drop ? (
          <PrizeDropCard drop={drop} />
        ) : (
          <p className="rl-glass rounded-2xl px-4 py-10 text-center text-sm text-white/50">
            {t('lobby.drops.empty')}
          </p>
        )}

        {drop && (
          <>
            <GameListToolbar
              q={filters.q}
              sort={filters.sort}
              provider={filters.provider}
              providers={providers}
              defaultSort
              onChange={go}
            />

            {failed && (
              <p role="status" className="rl-glass rounded-2xl px-4 py-3 text-sm text-white/55">
                {t('dash.catalogueUnavailable')}
              </p>
            )}

            {!failed && games.length === 0 && (
              <p className="rl-glass rounded-2xl px-4 py-10 text-center text-sm text-white/50">
                {filtered ? t('games.noMatch') : t('games.empty')}
              </p>
            )}

            {games.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4">
                {games.map((game) => (
                  <GameTile key={game.id} game={game} surface="drops-wins" />
                ))}
              </div>
            )}

            {pagination.totalPages > 1 && <div className="flex justify-center pt-2">{pager}</div>}
          </>
        )}

        <div className="mt-10 space-y-10 lg:mt-[calc(var(--u)*80)] lg:space-y-[calc(var(--u)*80)]">
          <RecentWinners />
          <SiteFooter />
        </div>
      </div>
    </PlayerLayout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ query, req, res }) => {
  const one = (value: string | string[] | undefined): string =>
    (Array.isArray(value) ? value[0] : value)?.trim() ?? '';

  const listed = await fetchPrizeDropsServer();
  // The grid pages through the games; the props carry the campaigns' facts only.
  const drops = (listed ?? []).map((d) => ({ ...d, games: [] }));
  const drop = drops.find((d) => d.id === one(query.drop)) ?? drops[0] ?? null;

  const empty = {
    drops,
    dropId: drop?.id ?? null,
    providers: [],
    q: '',
    sort: '' as const,
    provider: '',
    games: [],
    pagination: NO_PAGE,
    failed: false,
  };
  if (!drop) {
    if (listed === null) markUnavailable({ req, res });
    return { props: empty };
  }

  const page = parsePageParam(query.page);
  const list = { prize_drop: drop.id };
  const providers = (await fetchShelfProviders(list)) ?? [];

  // Only what the toolbar offers: a hand-typed studio or order would fail the whole list.
  const provider = providers.includes(one(query.provider)) ? one(query.provider) : '';
  const sort = (SORTS as readonly string[]).includes(one(query.sort))
    ? (one(query.sort) as Sort)
    : '';
  const asked = one(query.q).slice(0, 80);
  const q = asked.length >= MIN_SEARCH_LENGTH ? asked : '';

  const result = await fetchShelfList(
    {
      ...list,
      ...(sort ? { sort } : {}),
      ...(provider ? { provider } : {}),
      ...(q ? { search: q } : {}),
    },
    page,
    CATEGORY_PAGE_SIZE
  );
  if (result.failed) {
    markUnavailable({ req, res });
  }

  return {
    props: {
      ...empty,
      providers,
      q,
      sort,
      provider,
      games: result.data,
      pagination: result.pagination,
      failed: result.failed,
    },
  };
};

export default DropsWinsPage;
