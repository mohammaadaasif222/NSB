import type { FC } from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import PlayerLayout from '@/layout/PlayerLayout';
import GameTile from '@/components/player/GameTile';
import Pager from '@/components/player/Pager';
import { CATEGORY_ICONS } from '@/components/icons';
import { useTranslation } from '@/context/I18nContext';
import {
  CATEGORY_PAGE_SIZE,
  GAME_SHELVES,
  categoryForKey,
  categoryHref,
  shelfFor,
} from '@/constants/games';
import { fetchShelfList, parsePageParam } from '@/services/games.server';
import type { Game, GamePagination, GameShelfKey } from '@/types';

interface Props {
  categoryKey: GameShelfKey;
  games: Game[];
  pagination: GamePagination;
  failed: boolean;
}

/**
 * Every game on one shelf, paged.
 *
 * Backed by `GET /games?…&page=…&limit=…` with the shelf's own filter — a
 * category, `type=LIVE`, or `sort=popular`. Each page is a real URL
 * (`/games/slots?page=3`), so it survives a refresh and works with the back
 * button; the pager links are plain navigations.
 */
const CategoryPage: FC<Props> = ({ categoryKey, games, pagination, failed }) => {
  const { t } = useTranslation();
  const def = shelfFor(categoryKey);
  const title = t(def.titleKey);

  const from =
    pagination.total === 0 || games.length === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const to = from === 0 ? 0 : from + games.length - 1;

  const pager = (
    <Pager
      page={pagination.page}
      totalPages={pagination.totalPages}
      hrefFor={(page) => categoryHref(def.key, page)}
    />
  );

  return (
    <PlayerLayout>
      <Head>
        <title>{`${title} · ROLLUCK`}</title>
      </Head>

      <div className="mx-auto max-w-[1600px] space-y-4 pb-2 sm:space-y-6">
        {/* Category tabs */}
        <nav
          className="flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1"
          aria-label={t('dash.categories')}
        >
          {GAME_SHELVES.map((c) => {
            const Icon = CATEGORY_ICONS[c.key];
            const active = c.key === def.key;
            return (
              <Link
                key={c.key}
                href={categoryHref(c.key)}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                  active
                    ? 'rl-glass-active text-white'
                    : 'rl-glass rl-glass-hover text-white/55 hover:text-white'
                }`}
              >
                <Icon size={14} />
                {t(c.titleKey)}
              </Link>
            );
          })}
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

        {failed && (
          <p role="status" className="rl-glass rounded-2xl px-4 py-3 text-sm text-white/55">
            {t('dash.catalogueUnavailable')}
          </p>
        )}

        {!failed && games.length === 0 && (
          <p className="rl-glass rounded-2xl px-4 py-10 text-center text-sm text-white/50">
            {t('games.empty')}
          </p>
        )}

        {games.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4">
            {games.map((game) => (
              <GameTile key={game.id} game={game} surface={`category:${categoryKey}`} />
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && <div className="flex justify-center pt-2">{pager}</div>}
      </div>
    </PlayerLayout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ params, query }) => {
  const def = categoryForKey(params?.category);
  if (!def) {
    return { notFound: true };
  }

  const page = parsePageParam(query.page);
  const result = await fetchShelfList(def.list, page, CATEGORY_PAGE_SIZE);

  return {
    props: {
      categoryKey: def.key,
      games: result.data,
      pagination: result.pagination,
      failed: result.failed,
    },
  };
};

export default CategoryPage;
