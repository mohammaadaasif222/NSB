import type { FC } from 'react';
import Head from 'next/head';

import PlayerLayout from '@/layout/PlayerLayout';
import HomeHero from '@/components/player/HomeHero';
import LandingHero, { LandingBackdrop } from '@/components/player/LandingHero';
import BonusBanner from '@/components/player/BonusBanner';
import GameBrowser from '@/components/player/GameBrowser';
import CrashPreview from '@/components/player/CrashPreview';
import ProviderRow from '@/components/player/ProviderRow';
import SportsRow from '@/components/player/SportsRow';
import StreamersRow from '@/components/player/StreamersRow';
import FaqAccordion from '@/components/player/FaqAccordion';
import SiteFooter from '@/components/player/SiteFooter';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import type { LobbyProps } from '@/services/lobby.server';

interface Props extends LobbyProps {
  /** Document title. */
  title: string;
  /**
   * The route this lobby lives at. Shelf pager links are built against it, so
   * paging a shelf on /casino stays on /casino rather than jumping home.
   */
  basePath: string;
  /** Include the sportsbook teasers. The casino lobby leaves them to /sports. */
  withSports: boolean;
}

/**
 * The lobby body shared by `/` and `/casino`.
 *
 * The top of the page is the one place the two audiences genuinely differ: a
 * visitor gets the marketing hero — the sign-up teaser and the two section
 * shortcuts over the brand artwork, which the layout paints behind the bar and
 * rail as well — while a signed-in player gets their own panel and the promo
 * slider, which is a dashboard and has no reason to change. Everything below
 * the fold is the same page for both.
 *
 * Pure SSR: every shelf's games arrive as props, and paging a shelf is a
 * navigation to a new URL rather than a client fetch. The session-dependent
 * pieces hydrate client-side and default to the signed-out rendering, which is
 * what the server sends too.
 */
const Lobby: FC<Props> = ({
  shelves,
  providers,
  query,
  catalogueFailed,
  title,
  basePath,
  withSports,
}) => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const spotlight = (shelves.find((s) => s.key === 'featured')?.games ?? []).slice(0, 3);

  return (
    <PlayerLayout backdrop={token ? undefined : <LandingBackdrop />}>
      <Head>
        <title>{title}</title>
      </Head>

      <div className="mx-auto max-w-[1600px] space-y-5 sm:space-y-7">
        {token ? <HomeHero spotlight={spotlight} loggedIn /> : <LandingHero />}

        <BonusBanner />

        <CrashPreview />

        {catalogueFailed && (
          <p role="status" className="rl-glass rounded-2xl px-4 py-3 text-sm text-white/55">
            {t('dash.catalogueUnavailable')}
          </p>
        )}

        {/* Search / sort / filter / provider over the shelves. Idle, it renders
            the server's shelves with their URL-based paging untouched. */}
        <GameBrowser shelves={shelves} query={query} basePath={basePath} />

        {/* Curated in the admin console's Providers screen. */}
        <ProviderRow providers={providers} basePath={basePath} query={query} />
        {withSports && <SportsRow />}
        <StreamersRow />
        <FaqAccordion />
        <SiteFooter />
      </div>
    </PlayerLayout>
  );
};

export default Lobby;
