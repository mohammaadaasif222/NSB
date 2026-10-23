import type { FC } from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';

import PlayerLayout from '@/layout/PlayerLayout';
import GameTile from '@/components/player/GameTile';
import Pager from '@/components/player/Pager';
import RecentWinners from '@/components/player/RecentWinners';
import SiteFooter from '@/components/player/SiteFooter';
import Seo from '@/components/seo/Seo';
import { breadcrumbJsonLd } from '@/components/seo/breadcrumbs';
import { useTranslation } from '@/context/I18nContext';
import { CATEGORY_PAGE_SIZE, PROVIDERS_PATH, providerHref } from '@/constants/games';
import { fetchProviders, fetchShelfList, parsePageParam } from '@/services/games.server';
import { fetchWinnerGames } from '@/services/myGames.server';
import { markUnavailable } from '@/utils/unavailable.server';
import type { Game, GamePagination, LobbyProvider } from '@/types';

interface Props {
  provider: LobbyProvider | null;
  others: LobbyProvider[];
  games: Game[];
  pagination: GamePagination;
  failed: boolean;
  winnerGames: Game[];
}

const ProviderPage: FC<Props> = ({ provider, ...rest }) => {
  const { t } = useTranslation();

  if (!provider) {
    return (
      <PlayerLayout>
        <Seo title={t('lobby.providers.title')} noindex />
        <div className="mx-auto max-w-[1600px] space-y-10 pb-2">
          <p role="status" className="rl-glass rounded-2xl px-4 py-3 text-sm text-white/55">
            {t('dash.catalogueUnavailable')}
          </p>
          <SiteFooter />
        </div>
      </PlayerLayout>
    );
  }

  return <ProviderGames provider={provider} {...rest} />;
};

const ProviderGames: FC<Omit<Props, 'provider'> & { provider: LobbyProvider }> = ({
  provider,
  others,
  games,
  pagination,
  failed,
  winnerGames,
}) => {
  const { t, locale } = useTranslation();
  const heading = t('lobby.providers.games', { provider: provider.name });
  const count = pagination.total || provider.game_count;

  const from =
    pagination.total === 0 || games.length === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const to = from === 0 ? 0 : from + games.length - 1;

  const pager = (
    <Pager
      page={pagination.page}
      totalPages={pagination.totalPages}
      hrefFor={(page) => providerHref(provider.slug, page)}
    />
  );

  return (
    <PlayerLayout>
      <Seo
        title={heading}
        description={t('misc.meta.provider', { provider: provider.name, count })}
        path={providerHref(provider.slug, pagination.page)}
        jsonLd={breadcrumbJsonLd(locale, [
          { name: t('nav.home'), path: '/' },
          { name: t('lobby.providers.title'), path: PROVIDERS_PATH },
          { name: provider.name, path: providerHref(provider.slug) },
        ])}
      />

      <div className="mx-auto max-w-[1600px] space-y-4 pb-2 sm:space-y-6">
        <nav aria-label={t('lobby.game.breadcrumb')} className="text-xs text-white/45">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-white">
                {t('nav.home')}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={PROVIDERS_PATH} className="hover:text-white">
                {t('lobby.providers.title')}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-white/70">
              {provider.name}
            </li>
          </ol>
        </nav>

        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white sm:text-2xl">{heading}</h1>
            <p className="mt-1 text-sm text-white/55">
              {t('lobby.providers.count', { count, provider: provider.name })}
            </p>
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
            {t('lobby.providers.empty')}
          </p>
        )}

        {games.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
            {games.map((game) => (
              <GameTile key={game.id} game={game} surface={`provider:${provider.slug}`} />
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && <div className="flex justify-center pt-2">{pager}</div>}

        {others.length > 0 && (
          <section className="space-y-3 pt-4">
            <h2 className="text-base font-semibold text-white sm:text-lg">
              {t('lobby.providers.more')}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {others.map((other) => (
                <li key={other.id}>
                  <Link
                    href={providerHref(other.slug)}
                    className="rl-glass rl-glass-hover inline-flex items-center rounded-full px-3.5 py-1.5 text-[12px] font-medium text-white/70 transition-colors hover:text-white"
                  >
                    {other.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-10 space-y-10 lg:mt-[calc(var(--u)*80)] lg:space-y-[calc(var(--u)*80)]">
          <RecentWinners games={winnerGames} tabs="player" />
          <SiteFooter />
        </div>
      </div>
    </PlayerLayout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
  query,
  req,
  res,
}) => {
  const raw = params?.slug;
  const slug = Array.isArray(raw) ? raw[0] : raw;
  if (!slug) {
    return { notFound: true };
  }

  const providers = await fetchProviders();
  if (!providers) {
    markUnavailable({ req, res });
    return {
      props: {
        provider: null,
        others: [],
        games: [],
        pagination: { total: 0, page: 1, limit: CATEGORY_PAGE_SIZE, totalPages: 0 },
        failed: true,
        winnerGames: [],
      },
    };
  }

  const provider = providers.find((p) => p.slug === slug);
  if (!provider) {
    return { notFound: true };
  }

  const page = parsePageParam(query.page);
  const result = await fetchShelfList({ provider: provider.name }, page, CATEGORY_PAGE_SIZE);
  if (result.failed) {
    markUnavailable({ req, res });
  } else if (page > 1 && page > result.pagination.totalPages) {
    return { redirect: { destination: providerHref(provider.slug), permanent: false } };
  }

  return {
    props: {
      provider,
      others: providers.filter((p) => p.id !== provider.id),
      games: result.data,
      pagination: result.pagination,
      failed: result.failed,
      winnerGames: await fetchWinnerGames(result.data),
    },
  };
};

export default ProviderPage;
