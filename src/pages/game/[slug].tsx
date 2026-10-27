import type { FC } from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';

import PlayerLayout from '@/layout/PlayerLayout';
import GameRow from '@/components/player/GameRow';
import RecentWinners from '@/components/player/RecentWinners';
import SiteFooter from '@/components/player/SiteFooter';
import DiceGame from '@/components/dice/DiceGame';
import { CATEGORY_ICONS } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { DICE_SLUG } from '@/constants/dice';
import { categoryForEnum, categoryHref, gameHref, playHref, providerHref } from '@/constants/games';
import { absoluteUrl, localizedPath } from '@/constants/site';
import {
  fetchDiceConfig,
  fetchGameBySlug,
  fetchProviders,
  fetchShelfList,
} from '@/services/games.server';
import { markUnavailable } from '@/utils/unavailable.server';
import { displayProvider } from '@/utils/branding';
import { fetchWinnerGames } from '@/services/myGames.server';
import type { DiceConfig, Game } from '@/types';
import Seo, { type JsonLd } from '@/components/seo/Seo';
import { gameDescription } from '@/components/seo/gameMeta';
import { featureKeys, maxWinLabel } from '@/utils/gameFacts';

interface Props {
  game: Game | null;
  /** Up to ten more titles from the same category. */
  related: Game[];
  /** True when the API was unreachable (as opposed to the game not existing). */
  failed: boolean;
  /**
   * Dice settings, for the Dice game only. When enabled the page plays
   * the game in place of the details view.
   */
  dice: DiceConfig | null;
  /** Real games for the Recent Winners row at the foot of the page. */
  winnerGames: Game[];
  providerSlug: string | null;
}

/**
 * Deterministic, so the server and client render the same string. Synced games
 * may not publish a figure, which reads as a dash rather than a misleading 0.
 */
const money = (value: number | null, currency?: string | null): string =>
  value === null ? '—' : `${value.toFixed(2)}${currency ? ` ${currency}` : ''}`;

const Stat: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-xl bg-slate-900 border border-slate-800 px-4 py-3">
    <dt className="text-[11px] uppercase tracking-wide text-slate-500">{label}</dt>
    <dd className="mt-1 text-base font-semibold text-slate-100 tabular-nums">{value}</dd>
  </div>
);

const PRIMARY =
  'inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 text-sm font-bold transition-colors';
const SECONDARY =
  'inline-flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors';

/**
 * Play calls to action. Real money needs an account, so a visitor is sent to
 * log in instead; the demo is open to everyone on games that have one. A game
 * no aggregator can serve right now says so rather than offering a button
 * that would only fail.
 */
const PlayActions: FC<{ game: Game }> = ({ game }) => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const { openLogin } = useAuthModal();

  if (!game.launchable) {
    return token ? (
      <span
        aria-disabled="true"
        className="inline-flex items-center justify-center rounded-lg bg-slate-800/60 border border-slate-800 px-6 py-2.5 text-sm font-semibold text-slate-400 cursor-not-allowed"
      >
        {t('game.unavailable')}
      </span>
    ) : (
      <button
        type="button"
        onClick={() => openLogin()}
        className="inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 text-sm font-bold transition-colors"
      >
        {t('game.loginToPlay')}
      </button>
    );
  }

  return (
    <>
      {token ? (
        <Link href={playHref(game.slug)} className={PRIMARY}>
          {t('game.playReal')}
        </Link>
      ) : (
        <Link href="/auth/login" className={PRIMARY}>
          {t('game.loginToPlay')}
        </Link>
      )}
      {game.demo_available && (
        <Link href={playHref(game.slug, 'DEMO')} className={SECONDARY}>
          {t('game.playDemo')}
        </Link>
      )}
    </>
  );
};

const GamePage: FC<Props> = ({ game, related, failed, dice, winnerGames, providerSlug }) => {
  const { t, locale } = useTranslation();

  if (!game) {
    return (
      <PlayerLayout>
        <Seo title="ROLLUCK" bareTitle noindex />
        <div className="p-6 max-w-lg mx-auto text-center space-y-4">
          <p className="text-sm text-slate-400">
            {failed ? t('dash.catalogueUnavailable') : t('game.notFound')}
          </p>
          <Link
            href="/"
            className="inline-flex rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            {t('game.backToLobby')}
          </Link>
        </div>
      </PlayerLayout>
    );
  }

  // A synced game an operator has not put on a shelf has no category.
  const def = game.category ? categoryForEnum(game.category) : null;
  const categoryTitle = def ? t(def.titleKey) : null;
  const Icon = def ? CATEGORY_ICONS[def.key] : null;

  const crumbs = [
    { name: t('nav.home'), path: '/' },
    ...(def && categoryTitle ? [{ name: categoryTitle, path: categoryHref(def.key) }] : []),
    { name: game.title, path: gameHref(game.slug) },
  ];
  const breadcrumbs: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(localizedPath(locale, crumb.path)),
    })),
  };

  return (
    <PlayerLayout>
      <Seo
        title={game.title}
        description={gameDescription(t, game)}
        image={game.image_url}
        imageAlt={game.title}
        card={game.image_url ? 'summary' : 'summary_large_image'}
        jsonLd={breadcrumbs}
      />

      <div className="mx-auto max-w-[1600px] space-y-6 pb-2 sm:space-y-8">
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-1.5 text-xs text-slate-500"
          aria-label={t('lobby.game.breadcrumb')}
        >
          <Link href="/" className="hover:text-slate-200 transition-colors">
            {t('nav.home')}
          </Link>
          {def && (
            <>
              <span aria-hidden="true">/</span>
              <Link href={categoryHref(def.key)} className="hover:text-slate-200 transition-colors">
                {categoryTitle}
              </Link>
            </>
          )}
          <span aria-hidden="true">/</span>
          <span className="text-slate-300 truncate">{game.title}</span>
        </nav>

        {dice?.enabled ? (
          <DiceGame game={game} config={dice} />
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-[minmax(200px,320px)_1fr] gap-6 lg:gap-10 items-start">
            <div className="relative aspect-[3/4] w-full max-w-[320px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-800 shadow-2xl">
              {game.image_url ? (
                <Image
                  src={game.image_url}
                  alt={game.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 80vw, 320px"
                  className="object-cover"
                />
              ) : (
                <span className="absolute inset-0 flex items-end bg-gradient-to-br from-slate-700 to-slate-900 p-4 text-lg font-extrabold text-slate-200">
                  {game.title}
                </span>
              )}
              {game.is_new && (
                <span className="absolute top-3 right-3 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  {t('game.new')}
                </span>
              )}
            </div>

            <div className="min-w-0">
              {def && Icon && (
                <Link
                  href={categoryHref(def.key)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-600/15 border border-blue-500/30 px-3 py-1 text-[11px] font-semibold text-blue-300 hover:bg-blue-600/25 transition-colors"
                >
                  <Icon size={12} />
                  {categoryTitle}
                </Link>
              )}

              <h1 className="mt-3 text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                {game.title}
              </h1>
              <p className="mt-1.5 text-sm text-slate-400">
                {t('game.provider')}:{' '}
                {providerSlug ? (
                  <Link
                    href={providerHref(providerSlug)}
                    className="text-slate-200 font-medium underline-offset-2 hover:text-white hover:underline"
                  >
                    {displayProvider(game.provider)}
                  </Link>
                ) : (
                  <span className="text-slate-200 font-medium">{displayProvider(game.provider)}</span>
                )}
              </p>

              <dl className="mt-6 grid grid-cols-3 gap-3 max-w-md">
                <Stat
                  label={t('game.rtp')}
                  value={game.rtp === null ? '—' : `${game.rtp.toFixed(2)}%`}
                />
                <Stat label={t('game.minBet')} value={money(game.min_bet, game.bet_currency)} />
                <Stat label={t('game.maxBet')} value={money(game.max_bet, game.bet_currency)} />
                {game.volatility && (
                  <Stat label={t('game.volatility')} value={t(`game.vol.${game.volatility}`)} />
                )}
                {maxWinLabel(game) && <Stat label={t('game.maxWin')} value={maxWinLabel(game)!} />}
                {game.release_date && (
                  <Stat
                    label={t('game.released')}
                    value={new Date(`${game.release_date}T00:00:00Z`).toLocaleDateString(
                      undefined,
                      {
                        year: 'numeric',
                        month: 'short',
                        timeZone: 'UTC',
                      }
                    )}
                  />
                )}
              </dl>
              {featureKeys(game).length > 0 && (
                <ul aria-label={t('game.features')} className="mt-3 flex max-w-md flex-wrap gap-2">
                  {featureKeys(game).map((key) => (
                    <li
                      key={key}
                      className="rounded-full border border-[#f9d028]/40 px-3 py-1 text-xs font-medium text-[#f9d028]"
                    >
                      {t(key)}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {/*
                  Only disable the launch button when the NATIVE dice game is
                  actually enabled. The /dice slug used to belong exclusively
                  to our native in-house dice (DiceGame.tsx) which doesn't go
                  through an aggregator — but Tequity's catalogue also ships
                  a "dice" game that we now treat as a Tequity Original. If
                  `dice` config comes back with `enabled: false`, there is no
                  native dice to render here, and the game is a normal
                  aggregator game whose `launchable` flag should be respected.
                */}
                <PlayActions game={dice?.enabled ? { ...game, launchable: false } : game} />
                {def && (
                  <Link href={categoryHref(def.key)} className={SECONDARY}>
                    {t('game.moreFrom', { category: categoryTitle ?? '' })}
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {def && related.length > 0 && (
          <GameRow
            title={t('game.moreFrom', { category: categoryTitle ?? '' })}
            games={related}
            shelfKey={def.key}
          />
        )}

        <div className="mt-10 space-y-10 lg:mt-[calc(var(--u)*80)] lg:space-y-[calc(var(--u)*80)]">
          <RecentWinners games={winnerGames} tabs="player" />
          <SiteFooter />
        </div>
      </div>
    </PlayerLayout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ params, req, res }) => {
  const raw = params?.slug;
  const slug = Array.isArray(raw) ? raw[0] : raw;
  if (!slug) {
    return { notFound: true };
  }

  const lookup = await fetchGameBySlug(slug);

  if (lookup.status === 'missing') {
    return { notFound: true };
  }

  if (lookup.status === 'failed') {
    markUnavailable({ req, res });
    return {
      props: {
        game: null,
        related: [],
        failed: true,
        dice: null,
        winnerGames: [],
        providerSlug: null,
      },
    };
  }

  const { category } = lookup.game;
  const [shelf, dice, providers] = await Promise.all([
    // Eleven, so there are still ten once the current title is dropped. A
    // synced game on no shelf has nothing to be related to.
    category ? fetchShelfList({ category }, 1, 11) : Promise.resolve(null),
    lookup.game.slug === DICE_SLUG ? fetchDiceConfig() : Promise.resolve(null),
    fetchProviders(),
  ]);
  const related = shelf ? shelf.data.filter((g) => g.slug !== lookup.game.slug).slice(0, 10) : [];

  return {
    props: {
      game: lookup.game,
      related,
      failed: false,
      dice,
      winnerGames: await fetchWinnerGames(related),
      providerSlug: providers?.find((p) => p.name === lookup.game.provider)?.slug ?? null,
    },
  };
};

export default GamePage;
