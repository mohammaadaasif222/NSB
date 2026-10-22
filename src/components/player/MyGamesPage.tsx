import { useEffect, useMemo, useRef, useState, type FC, type ReactNode } from 'react';
import PlayerLayout from '@/layout/PlayerLayout';
import GameTile from '@/components/player/GameTile';
import GoldGlow from '@/components/player/GoldGlow';
import PageNumbers from '@/components/player/PageNumbers';
import ProviderRow from '@/components/player/ProviderRow';
import RecentWinners from '@/components/player/RecentWinners';
import SiteFooter from '@/components/player/SiteFooter';
import {
  BROWSE_DEFAULTS,
  BrowseToolbar,
  browseGames,
  type BrowseState,
} from '@/components/player/BrowseControls';
import { useAuth } from '@/context/AuthContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { useTranslation } from '@/context/I18nContext';
import { DESKTOP_QUERY, useMediaQuery } from '@/hooks/useMediaQuery';
import { providersOf } from '@/services/catalogue';
import type { TranslationKey } from '@/i18n/locales';
import type { Game, LobbyProvider } from '@/types';
import Seo from '@/components/seo/Seo';

interface Props {
  titleKey: TranslationKey;
  /** What to say when the player has none yet. */
  emptyKey: TranslationKey;
  /** Where tiles here are, for game-open tracking. */
  surface: string;
  /** The player's games, in the list's own order. Null while loading. */
  games: Game[] | null;
  failed: boolean;
  /**
   * Studios the player has hearted, shown as their own row above the games.
   * Favourites has them; Recents has no equivalent.
   */
  providers?: LobbyProvider[] | null;
  /** Real games for the Recent Winners row, rendered server-side. */
  winnerGames: Game[];
}

/** Tiles per page: two rows of seven on desktop, five rows of three on a phone. */
const PAGE_SIZE = { desktop: 14, phone: 15 };

/** The grid: the shelves' tile sizes, wrapped into rows. */
const GRID =
  'grid grid-cols-3 gap-x-[11px] gap-y-5 lg:grid-cols-7 lg:gap-x-[calc(var(--u)*27)] lg:gap-y-[calc(var(--u)*27)]';

/** A message in the grid's place — signed out, empty, or failed. */
const Notice: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="rl-liquid flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-[24px] px-6 py-10 text-center text-[14px] leading-5 text-[#9da2b4] lg:min-h-[calc(var(--u)*261)] lg:rounded-[calc(var(--u)*34)] lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]">
    {children}
  </div>
);

/**
 * A page of the player's own games — Recents and Favourites, as the design
 * draws both: the title, the catalogue toolbar, the games two rows at a time
 * with a numbered pager, then Recent Winners and the footer.
 *
 * The list arrives whole and is searched, sorted and paged here, so every
 * control answers instantly. Its own order (newest first) holds until the
 * player picks a sort.
 */
const MyGamesPage: FC<Props> = ({
  titleKey,
  emptyKey,
  surface,
  games,
  failed,
  providers: favouriteProviders,
  winnerGames,
}) => {
  const { t } = useTranslation();
  const { token, hydrated } = useAuth();
  const { openLogin } = useAuthModal();
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const perPage = desktop ? PAGE_SIZE.desktop : PAGE_SIZE.phone;

  const [browse, setBrowse] = useState<BrowseState>(BROWSE_DEFAULTS);
  const [page, setPage] = useState(1);
  const gridRef = useRef<HTMLElement>(null);

  const results = useMemo(() => browseGames(games ?? [], browse, true), [games, browse]);
  const providers = useMemo(() => providersOf(games ?? []), [games]);
  const totalPages = Math.max(1, Math.ceil(results.length / perPage));
  const shown = results.slice((page - 1) * perPage, page * perPage);

  // A narrower list (a search, a game unhearted) can leave the page past the end.
  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const goTo = (next: number): void => {
    setPage(next);
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const title = t(titleKey);
  const signedOut = hydrated && !token;
  const loading = !signedOut && !failed && games === null;

  let body: ReactNode;
  if (signedOut) {
    body = (
      <Notice>
        {t('myGames.signedOut')}
        <button
          type="button"
          onClick={() => openLogin()}
          className="inline-flex h-10 items-center rounded-full bg-[#f9d028] px-6 text-[14px] font-medium text-[#07080a] transition-[filter] hover:brightness-110"
        >
          {t('account.login')}
        </button>
      </Notice>
    );
  } else if (failed) {
    body = <Notice>{t('myGames.failed')}</Notice>;
  } else if (loading) {
    body = (
      <div className={GRID} aria-busy="true">
        {Array.from({ length: perPage }, (_, i) => (
          <div key={i} className="rl-card-shape aspect-[198/261] animate-pulse bg-white/[0.06]" />
        ))}
      </div>
    );
  } else if (games?.length === 0) {
    body = <Notice>{t(emptyKey)}</Notice>;
  } else if (results.length === 0) {
    body = (
      <Notice>
        {browse.search.trim() ? t('search.empty', { query: browse.search }) : t('games.empty')}
      </Notice>
    );
  } else {
    body = (
      <div className={GRID}>
        {shown.map((game) => (
          <GameTile key={game.id} game={game} surface={surface} />
        ))}
      </div>
    );
  }

  return (
    <PlayerLayout backdrop={<GoldGlow />}>
      <Seo title={title} />

      <div className="mx-auto max-w-[1548px] px-1 lg:max-w-[calc(var(--u)*1548)] lg:px-0">
        <h1 className="mt-1 text-[32px] font-semibold leading-10 text-[#f0f1f5] lg:mt-[calc(var(--u)*24)] lg:text-[length:max(min(11px,44px),calc(var(--u)*44))] lg:leading-[calc(var(--u)*52)]">
          {title}
        </h1>

        <div className="mt-5 lg:mt-[calc(var(--u)*20)]">
          <BrowseToolbar
            state={browse}
            onChange={(patch) => {
              setBrowse((current) => ({ ...current, ...patch }));
              setPage(1);
            }}
            providers={providers}
          />
        </div>

        <section
          ref={gridRef}
          aria-label={title}
          className="mt-9 scroll-mt-28 lg:mt-[calc(var(--u)*26)]"
        >
          {body}
        </section>

        {results.length > 0 && !signedOut && !failed && (
          <div className="mt-9 lg:mt-[calc(var(--u)*50)]">
            <PageNumbers page={page} totalPages={totalPages} onChange={goTo} />
          </div>
        )}

        <div className="mt-10 space-y-10 lg:mt-[calc(var(--u)*80)] lg:space-y-[calc(var(--u)*80)]">
          {/* Below the grid, so the toolbar above reads as the games' own. */}
          {!!favouriteProviders?.length && (
            <ProviderRow
              providers={favouriteProviders}
              titleKey="favourites.providers"
              viewAll={false}
            />
          )}
          <RecentWinners games={winnerGames} tabs="player" />
          <SiteFooter />
        </div>
      </div>
    </PlayerLayout>
  );
};

export default MyGamesPage;
