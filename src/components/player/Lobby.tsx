import type { FC, ReactNode } from 'react';
import Head from 'next/head';

import PlayerLayout from '@/layout/PlayerLayout';
import HomeHero from '@/components/player/HomeHero';
import LandingHero, { LandingBackdrop } from '@/components/player/LandingHero';
import GameBrowser, { type ShelfInsert } from '@/components/player/GameBrowser';
import LobbyBanner from '@/components/player/LobbyBanner';
import CrashPreview from '@/components/player/CrashPreview';
import ProviderRow from '@/components/player/ProviderRow';
import SportsRow, { SportsShelf } from '@/components/player/SportsRow';
import TournamentsShelf from '@/components/player/TournamentsShelf';
import { WinnersStrip } from '@/components/player/TopWinnersTicker';
import { CASINO_SHELF_KEYS, PLAYER_SHELF_KEYS } from '@/constants/games';
import StreamersRow from '@/components/player/StreamersRow';
import RecentWinners from '@/components/player/RecentWinners';
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
  /**
   * `home` — the landing page signed out, the player's dashboard signed in.
   * `casino` — the catalogue: banner, browser and every casino shelf, with
   * the providers and tournaments among them; the sportsbook is left to /sports.
   */
  variant: 'home' | 'casino';
}

/** The signed-in lobby's sports row, after Live Casino. */
const PLAYER_INSERTS: readonly ShelfInsert[] = [
  { id: 'sports', after: 'live', node: <SportsShelf viewAll="/sports" paged={false} /> },
];

/** The casino page's rows among its shelves: providers after Live Casino, tournaments after Recommended. */
const CASINO_INSERTS = (providerRow: ReactNode): readonly ShelfInsert[] => [
  { id: 'providers', after: 'live', node: providerRow },
  { id: 'tournaments', after: 'featured', node: <TournamentsShelf /> },
];

/**
 * The lobby body shared by `/` and `/casino`.
 *
 * On /casino the page is the catalogue for everyone: the banner over the
 * browser, which carries the provider and tournament rows among its shelves.
 * The rest of this note is about the home page.
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
  variant,
}) => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const player = !!token;
  // The winners row pairs its sample wins with real games, newest first.
  const winnerGames = [
    ...(shelves.find((s) => s.key === 'new')?.games ?? []),
    ...shelves.filter((s) => s.key !== 'new').flatMap((s) => s.games),
  ];
  const casino = variant === 'casino';
  // Signed out, the home lobby is the shelves alone, so a provider plate
  // opens /casino, which has the browser controls to show and clear it.
  const controls = player || casino;

  const providerRow = (
    <ProviderRow
      providers={providers}
      basePath={controls ? basePath : '/casino'}
      query={controls ? query : {}}
    />
  );

  const unavailable = catalogueFailed && (
    <p role="status" className="rl-glass rounded-2xl px-4 py-3 text-sm text-white/55">
      {t('dash.catalogueUnavailable')}
    </p>
  );

  const browser = (
    <GameBrowser
      shelves={shelves}
      basePath={basePath}
      controls={controls}
      {...(casino
        ? {
            // The casino design's shelves, with the providers and tournaments
            // among them; Featured is its "Recommended".
            shelfKeys: CASINO_SHELF_KEYS,
            titles: { originals: 'nav.originals', featured: 'dash.recommended' },
            chipsOnPhone: true,
            inserts: CASINO_INSERTS(providerRow),
          }
        : player && {
            // The signed-in design's shelves, with the sports row among them.
            shelfKeys: PLAYER_SHELF_KEYS,
            titles: { originals: 'nav.originals' },
            inserts: PLAYER_INSERTS,
          })}
    />
  );

  return (
    <PlayerLayout backdrop={player ? undefined : <LandingBackdrop />}>
      <Head>
        <title>{title}</title>
      </Head>

      {/* The design's 1548px content column, centred in the space beside the
          rail; `--u` (set by PlayerLayout) scales it on a narrower desktop. */}
      <div className="mx-auto max-w-[1548px] space-y-10 px-1 lg:max-w-[calc(var(--u)*1548)] lg:space-y-[calc(var(--u)*80)] lg:px-0">
        {casino ? (
          // Winners (signed in), banner and browser, 30px apart on a phone
          // and 26px on desktop — the browser's own rhythm.
          <div className="space-y-[30px] pt-1 lg:space-y-[calc(var(--u)*26)] lg:pt-0">
            {player && <WinnersStrip />}
            <LobbyBanner />
            {unavailable}
            {browser}
          </div>
        ) : player ? (
          // The signed-in design packs the top of the page closer: winners,
          // the hero, the crash card and the browser 24px apart.
          <div className="space-y-4 pt-1 lg:space-y-[calc(var(--u)*24)] lg:pt-0">
            <WinnersStrip />
            <HomeHero />
            <CrashPreview />
            {unavailable}
            {browser}
          </div>
        ) : (
          <>
            {/* The signed-out hero carries the welcome offer itself, where
                the design puts it among the section shortcuts. */}
            <LandingHero />
            <CrashPreview />
            {unavailable}
            {browser}
          </>
        )}

        {/* Curated in the admin console's Providers screen; on /casino it
            sits among the shelves instead. */}
        {!casino && providerRow}
        {!player && !casino && <SportsRow />}
        {!casino && <StreamersRow />}
        <RecentWinners games={winnerGames} tabs={player || casino ? 'player' : 'landing'} />
        <FaqAccordion />
        <SiteFooter />
      </div>
    </PlayerLayout>
  );
};

export default Lobby;
