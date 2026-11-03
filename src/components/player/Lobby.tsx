import type { FC, ReactNode } from 'react';

import PlayerLayout from '@/layout/PlayerLayout';
import HomeHero from '@/components/player/HomeHero';
import LandingHero, { LandingBackdrop } from '@/components/player/LandingHero';
import GameBrowser, { type ShelfInsert } from '@/components/player/GameBrowser';
import LobbyBanner from '@/components/player/LobbyBanner';
import CrashPreview from '@/components/player/CrashPreview';
import ProviderRow from '@/components/player/ProviderRow';
import { SportsShelf } from '@/components/player/SportsRow';
import FavouritesShelf from '@/components/player/FavouritesShelf';
import RecentShelf from '@/components/player/RecentShelf';
import ComingSoonShelf from '@/components/player/ComingSoonShelf';
import JackpotShelf from '@/components/player/JackpotShelf';
import { WinnersStrip } from '@/components/player/TopWinnersTicker';
import { DEFAULT_SECTIONS, sectionShelfKey } from '@/constants/games';
import RecommendedShelf from '@/components/player/RecommendedShelf';
import type { GameShelf, HomeSection, LobbyShelfKey, SectionPageKey } from '@/types';
import StreamersRow from '@/components/player/StreamersRow';
import RecentWinners from '@/components/player/RecentWinners';
import FaqAccordion from '@/components/player/FaqAccordion';
import SiteFooter from '@/components/player/SiteFooter';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import type { LobbyProps } from '@/services/lobby.server';
import Seo, { type JsonLd, type SeoProps } from '@/components/seo/Seo';
import type { FaqItem } from '@/services/faqs';

interface Props extends LobbyProps {
  seo: SeoProps;
  /**
   * The route this lobby lives at. Shelf pager links are built against it, so
   * paging a shelf on /casino stays on /casino rather than jumping home.
   */
  basePath: string;
  /**
   * `home` — the landing page signed out, the player's dashboard signed in.
   * `casino` — the catalogue: banner, browser and every casino shelf, with
   * the providers and tournaments among them; the sportsbook is left to /sports.
   * `live` — the Live Casino lobby: banner, its own chips and the live rows.
   */
  variant: 'home' | 'casino' | 'live';
}

/**
 * Desktop: the signed-in first screen — the player's panel and banner, then
 * the live game — ends inside the window, so a short window draws those two a
 * little smaller than the rest of the page. The bar, the winners and
 * everything below keep the page's own scale.
 *
 * - `--uw`: the page's unit (PlayerLayout's `--u`, by width).
 * - `--fold-top`: where the panel starts — the bar and the winners above it,
 *   measured: 182px at 1920 wide, 147 at 1536, 136 at 1323.
 * - `--u`: what the panel, the banner and the live game are drawn in. They
 *   are 415 + 24 + 498 design px at their shortest (the live game gives up
 *   chart height first — `--crash-h`), so that has to end 8px above the
 *   window's foot. Never more than the page's unit, never below 65% of it.
 * - `--tf`: the type scale's text floor, down to 9px with it, so the labels
 *   stay inside the boxes drawn for them.
 */
const FIRST_SCREEN_FIT =
  'lg:[--uw:min(1px,calc(100vw/1920))] lg:[--fold-top:max(calc(66px+var(--uw)*102),calc(10px+var(--uw)*172))] lg:[--u:min(var(--uw),max(calc((100vh-8px-var(--fold-top))/937),calc(var(--uw)*0.65)))] lg:[--tf:clamp(9px,calc(var(--u)*11),11px)] lg:[--crash-h:clamp(calc(var(--u)*498),calc(100vh-8px-var(--fold-top)-var(--u)*439),calc(var(--u)*586))]';

const faqJsonLd = (faqs: FaqItem[]): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
});

const sectionInserts = (
  sections: readonly HomeSection[],
  widgetOf: (section: HomeSection) => ReactNode
): ShelfInsert[] => {
  const inserts: ShelfInsert[] = [];
  let after: LobbyShelfKey | null = null;
  for (const section of sections) {
    const shelfKey = sectionShelfKey(section);
    if (shelfKey) {
      after = shelfKey;
    } else if (section.kind === 'WIDGET') {
      inserts.push({ id: section.key, after, node: widgetOf(section) });
    }
  }
  return inserts;
};

const shelfHeadings = (
  entries: readonly { key: string; title: string | null }[]
): Partial<Record<LobbyShelfKey, string>> =>
  Object.fromEntries(entries.flatMap(({ key, title }) => (title ? [[key, title]] : [])));

const withPageShelves = (shelves: GameShelf[], overrides: GameShelf[] = []): GameShelf[] => [
  ...overrides,
  ...shelves.filter((shelf) => !overrides.some((override) => override.key === shelf.key)),
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
  shelves: mainShelves,
  pageShelves,
  sections,
  providers,
  catalogueFailed,
  faqs,
  streams,
  totalRegistrations,
  seo,
  basePath,
  variant,
}) => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const player = !!token;
  const page: SectionPageKey = variant === 'home' ? (player ? 'home_player' : 'home') : variant;
  const shelves = withPageShelves(mainShelves, pageShelves[page]);
  const pageSections = sections[page] ?? DEFAULT_SECTIONS[page];
  // The winners row pairs its sample wins with real games, newest first.
  const winnerGames = [
    ...(shelves.find((s) => s.key === 'new')?.games ?? []),
    ...shelves.filter((s) => s.key !== 'new').flatMap((s) => s.games),
  ];
  const live = variant === 'live';
  // The live lobby is laid out as the casino page is, with its own rows.
  const casino = variant === 'casino' || live;
  const jsonLd =
    !casino && faqs.length > 0 ? [...[seo.jsonLd ?? []].flat(), faqJsonLd(faqs)] : seo.jsonLd;

  const unavailable = catalogueFailed && (
    <p role="status" className="rl-glass rounded-2xl px-4 py-3 text-sm text-white/55">
      {t('dash.catalogueUnavailable')}
    </p>
  );

  const widget = (section: HomeSection): ReactNode => {
    const title = section.title ?? undefined;
    switch (section.key) {
      case 'favourites':
        return <FavouritesShelf title={title} />;
      case 'recommended':
        return (
          <RecommendedShelf featured={shelves.find((s) => s.key === 'featured')} title={title} />
        );
      case 'recents':
        return <RecentShelf title={title} />;
      case 'drops-wins':
        return <ComingSoonShelf title={title ?? t('lobby.rail.dropsWins')} />;
      case 'hot':
        return <ComingSoonShelf title={title ?? t('lobby.casino.hot')} />;
      case 'sports':
        return <SportsShelf viewAll="/sports" paged={false} title={title} />;
      case 'providers':
        return <ProviderRow providers={providers} title={title} />;
      case 'jackpots':
        return <JackpotShelf title={title} />;
      case 'streamers':
        return <StreamersRow streams={streams} title={title} />;
      case 'recent-winners':
        return (
          <RecentWinners games={winnerGames} tabs={player ? 'player' : 'landing'} title={title} />
        );
      default:
        return null;
    }
  };

  const browser = (
    <GameBrowser
      shelves={shelves}
      basePath={basePath}
      providers={providers.map((p) => p.name).sort((a, b) => a.localeCompare(b))}
      sectionPage={page}
      shelfKeys={pageSections.flatMap((section) => sectionShelfKey(section) ?? [])}
      titles={live ? {} : { originals: 'nav.originals' }}
      headings={shelfHeadings(pageSections)}
      inserts={sectionInserts(pageSections, widget)}
      chipsOnPhone
      live={live}
    />
  );

  return (
    <PlayerLayout backdrop={player ? undefined : <LandingBackdrop />}>
      <Seo {...seo} jsonLd={jsonLd} />

      {/* The design's 1548px content column, centred in the space beside the
          rail; `--u` (set by PlayerLayout) scales it on a narrower desktop. */}
      <div className="mx-auto max-w-[1548px] space-y-10 px-1 lg:max-w-[calc(var(--u)*1548)] lg:space-y-[calc(var(--u)*80)] lg:px-0">
        {casino ? (
          // Winners (signed in), banner and browser, 30px apart on a phone
          // and 26px on desktop — the browser's own rhythm.
          <div className="space-y-[30px] pt-1 lg:space-y-[calc(var(--u)*26)] lg:pt-0">
            <h1 className="sr-only">{t('dash.casinoHeading')}</h1>
            {player && <WinnersStrip />}
            <LobbyBanner placement={live ? 'live_casino' : 'casino'} />
            {unavailable}
            {browser}
          </div>
        ) : player ? (
          // The signed-in design packs the top of the page closer: winners,
          // the hero, the crash card and the browser 24px apart.
          <div className="space-y-4 pt-2 lg:space-y-[calc(var(--u)*24)] lg:pt-0">
            <WinnersStrip />
            <div className={`space-y-4 ${FIRST_SCREEN_FIT} lg:space-y-[calc(var(--u)*24)]`}>
              <HomeHero />
              <CrashPreview />
            </div>
            {unavailable}
            {browser}
          </div>
        ) : (
          <>
            {/* The signed-out hero carries the welcome offer itself, where
                the design puts it among the section shortcuts. */}
            <LandingHero totalRegistrations={totalRegistrations} />
            <CrashPreview />
            {unavailable}
            {browser}
          </>
        )}

        {casino && <RecentWinners games={winnerGames} tabs="player" />}
        <FaqAccordion items={faqs} />
        <SiteFooter glow={variant === 'home'} />
      </div>
    </PlayerLayout>
  );
};

export default Lobby;
