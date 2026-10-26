import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FC,
  type HTMLAttributeReferrerPolicy,
} from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

import PlayerLayout from '@/layout/PlayerLayout';
import { MinimizeIcon, PopoutIcon } from '@/components/icons';
import GameActionBar from '@/components/play/GameActionBar';
import LiveStatsPanel from '@/components/play/LiveStatsPanel';
import { useAuth } from '@/context/AuthContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { useFavourites } from '@/context/FavouritesContext';
import { useTranslation } from '@/context/I18nContext';
import { useWallet } from '@/context/WalletContext';
import { gameHref, playHref } from '@/constants/games';
import { fetchGameBySlug } from '@/services/games.server';
import { markUnavailable } from '@/utils/unavailable.server';
import { displayProvider } from '@/utils/branding';
import { currentGameDevice, launchGame } from '@/services/games';
import { BALANCE_REFRESH_EVENT, requestBalanceRefresh } from '@/utils/balanceEvents';
import { useGameFullscreen } from '@/hooks/useGameFullscreen';
import { useLiveStats } from '@/hooks/useLiveStats';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { POPOUT_PARAM, usePopoutGame } from '@/hooks/usePopoutGame';
import { trackGameLaunch } from '@/utils/events';
import type { ApiError, Game, GameLaunch, GameMode } from '@/types';
import Seo from '@/components/seo/Seo';
import { gameDescription } from '@/components/seo/gameMeta';

interface Props {
  game: Game | null;
  /** True when the API was unreachable (as opposed to the game not existing). */
  failed: boolean;
}

/** How often the wallet chip re-reads the balance while real money is in play. */
const BALANCE_POLL_MS = 10_000;

/** Frame shape when the catalogue has no ratio for the game: 16:9. */
const DEFAULT_RATIO = 56.25;

type LaunchState =
  | { status: 'loading' }
  | { status: 'ready'; launch: GameLaunch }
  | { status: 'failed'; message: string; retryable: boolean }
  /** The game is running in a pop-out window instead; nothing launches here. */
  | { status: 'popped-out' };

/** Phones get the mobile build and no pop-out. */
const PHONE_QUERY = '(max-width: 767px)';

/**
 * Tells the page that opened this pop-out that the balance moved, so its
 * wallet chip and Live Stats catch up. Same origin, so a plain event will do.
 */
const notifyOpener = (): void => {
  try {
    window.opener?.dispatchEvent(new Event(BALANCE_REFRESH_EVENT));
  } catch {
    // The opener navigated away or is gone; nothing to tell.
  }
};

const PRIMARY =
  'inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs sm:text-sm font-bold transition-colors';
const SECONDARY =
  'inline-flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-50 transition-colors';

/**
 * Runs a game inside the site.
 *
 * The aggregator's launch URL is loaded in an iframe on our own domain — the
 * approach Alea Play recommends over sending the player to their domain, and
 * the only one that works: the launch URL checks the Referer, so the iframe
 * carries the referrer policy the API returns. Every visit launches afresh,
 * because a launch URL is a single session.
 *
 * `?mode=demo` plays with play money and needs no account; anything else is
 * real money and sends a signed-out visitor to log in.
 *
 * `?popout=1` is the same page opened in a window of its own by the action
 * bar's pop-out button: the game alone, filling the window, with no shell.
 */
const PlayPage: FC<Props> = ({ game, failed }) => {
  const router = useRouter();
  const { token, hydrated } = useAuth();
  const { openLogin } = useAuthModal();
  const { isFavourite, toggle: toggleFavourite } = useFavourites();
  const { t, locale } = useTranslation();
  const mode: GameMode = router.query.mode === 'demo' ? 'DEMO' : 'REAL';
  const isPopout = router.query[POPOUT_PARAM] === '1';
  const phone = useMediaQuery(PHONE_QUERY);

  const [state, setState] = useState<LaunchState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [statsOpen, setStatsOpen] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // The launch this page last asked for. Guards against a second launch for
  // the same request (React's development double-render would otherwise open
  // two sessions) and lets a slow response for an abandoned request be ignored.
  const requested = useRef<string | null>(null);

  // The player's display currency drives the game-session currency on the
  // server; a session is bound to the currency it was launched in. If the
  // player switches currency mid-session we must relaunch — otherwise the
  // iframe keeps showing the old currency's balance, bets and free bets.
  const { summary } = useWallet();
  const activeCurrency = summary?.preferences?.active_currency ?? null;
  const prevCurrencyRef = useRef<string | null>(null);

  const failure = useCallback(
    (error: ApiError): LaunchState => {
      switch (error.status) {
        case 403:
          return { status: 'failed', message: t('game.accountBlocked'), retryable: false };
        case 404:
        case 409:
          return { status: 'failed', message: t('game.unavailable'), retryable: false };
        case 422:
          return {
            status: 'failed',
            message: mode === 'DEMO' ? t('game.noDemo') : t('game.launchFailed'),
            retryable: false,
          };
        case 503:
          return { status: 'failed', message: t('game.notConfigured'), retryable: true };
        default:
          return { status: 'failed', message: t('game.launchFailed'), retryable: true };
      }
    },
    [mode, t]
  );

  const fullscreen = useGameFullscreen(frameRef);
  // While the pop-out runs the game this page plays nothing — one real-money
  // session at a time. Closing the window brings the game back here, through
  // the launch effect below.
  const popout = usePopoutGame(game?.slug ?? '', mode, !isPopout && !phone);

  const liveStats = useLiveStats(statsOpen && mode === 'REAL' && Boolean(token), game?.slug ?? '');

  useEffect(() => {
    if (!game || !router.isReady || !hydrated) {
      return;
    }
    if (popout.active) {
      requested.current = null;
      setState({ status: 'popped-out' });
      return;
    }
    if (mode === 'REAL' && !token) {
      void router.replace('/auth/login');
      return;
    }

    const key = `${game.slug}:${mode}:${attempt}`;
    if (requested.current === key) {
      return;
    }
    requested.current = key;
    setState({ status: 'loading' });

    launchGame(game.slug, mode, locale, currentGameDevice())
      .then((launch) => {
        if (requested.current === key) {
          setState({ status: 'ready', launch });
        }
      })
      .catch((error: ApiError) => {
        if (requested.current !== key) {
          return;
        }
        if (error.status === 401) {
          void router.replace('/auth/login');
          return;
        }
        setState(failure(error));
      });
  }, [game, mode, attempt, token, hydrated, router, locale, failure, popout.active]);

  const launch = state.status === 'ready' ? state.launch : null;

  // Switching display currency mid-game: relaunch so the new session is in
  // the new currency. Skipped in DEMO mode (no real wallet or session bound
  // to a currency) and skipped the first time active_currency becomes known
  // (initial hydration, not a change the player made).
  useEffect(() => {
    if (mode !== 'REAL' || !activeCurrency) {
      prevCurrencyRef.current = activeCurrency;
      return;
    }
    const previous = prevCurrencyRef.current;
    prevCurrencyRef.current = activeCurrency;
    if (previous === null || previous === activeCurrency) {
      return;
    }
    toast.info(t('game.currencyChangedReloading'));
    setAttempt((n) => n + 1);
  }, [activeCurrency, mode, t]);

  // Events the game posts to this page through Alea Play's unified JS events.
  // Only messages from our own iframe are trusted.
  useEffect(() => {
    if (!launch || !game) {
      return;
    }
    const onMessage = (event: MessageEvent): void => {
      if (event.source !== iframeRef.current?.contentWindow) {
        return;
      }
      const action = (event.data as { action?: unknown } | null)?.action;
      switch (action) {
        case 'aleaplay.exit':
          if (isPopout) {
            window.close();
          } else {
            void router.push(gameHref(game.slug));
          }
          break;
        case 'aleaplay.reload':
          setAttempt((n) => n + 1);
          break;
        case 'aleaplay.roundEnd':
          requestBalanceRefresh();
          notifyOpener();
          break;
        case 'aleaplay.insufficientFunds':
          toast.warn(t('game.insufficientFunds'));
          requestBalanceRefresh();
          break;
        default:
          break;
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [launch, game, router, t, isPopout]);

  // Bets and wins reach the wallet server-to-server, and only some providers
  // announce round ends, so real-money play also polls the balance.
  // A popped-out game still moves this page's balance, so the poll keeps
  // running while the window plays it.
  const playing = Boolean(launch) || popout.active;
  useEffect(() => {
    if (mode !== 'REAL' || !playing) {
      return;
    }
    const id = window.setInterval(requestBalanceRefresh, BALANCE_POLL_MS);
    return () => {
      window.clearInterval(id);
      requestBalanceRefresh();
    };
  }, [mode, playing]);

  // The pop-out is the game and nothing else: no page to scroll behind it,
  // and no scrollbar gutter (index.css reserves one site-wide) beside it.
  useEffect(() => {
    if (!isPopout) {
      return;
    }
    const root = document.documentElement;
    const { overflow, scrollbarGutter } = root.style;
    root.style.overflow = 'hidden';
    root.style.scrollbarGutter = 'auto';
    return () => {
      root.style.overflow = overflow;
      root.style.scrollbarGutter = scrollbarGutter;
    };
  }, [isPopout]);

  const switchMode = (next: GameMode): void => {
    if (!game) {
      return;
    }
    if (next === 'REAL' && !token) {
      openLogin();
      return;
    }
    void router.push(playHref(game.slug, next));
  };

  const openPopout = (): void => {
    fullscreen.exit();
    if (!popout.open()) {
      toast.error(t('game.popoutBlocked'));
    }
  };

  if (!game) {
    return (
      <PlayerLayout>
        <Seo title="ROLLUCK" bareTitle noindex />
        <div className="p-6 max-w-lg mx-auto text-center space-y-4">
          <p className="text-sm text-slate-400">
            {failed ? t('dash.catalogueUnavailable') : t('game.notFound')}
          </p>
          <Link href="/" className={SECONDARY}>
            {t('game.backToLobby')}
          </Link>
        </div>
      </PlayerLayout>
    );
  }

  const explicitRatio = launch?.display_ratio ?? game.display_ratio;
  const ratio = explicitRatio ?? DEFAULT_RATIO;
  // Tequity games render in a fluid layout and have no catalogue-published
  // aspect ratio. For those we drop the width constraint entirely (the
  // frame then fills the content column from close-button to fullscreen
  // button) and only hint height via aspectRatio. Scoped STRICTLY to the
  // The backend tells us the layout flavour explicitly ("FLUID" fills the
  // content column, "STANDARD" bounds width by viewport). The field is a
  // behaviour hint — not the aggregator's name — so a user never sees which
  // integration served the game.
  const fluidFrame = launch?.frame_layout === 'FLUID';
  // Desktop: the game's own shape, as large as the viewport allows. Mobile
  // builds fill the screen whatever shape the desktop build has. The offsets
  // cover the sticky top bar (with its winners ticker), the action bar under
  // the frame and padding, so frame and controls fit without scrolling.
  const frameStyle: CSSProperties = fullscreen.active
    ? { width: '100%', height: '100%' }
    : launch?.device === 'MOBILE'
      ? // Leaves room for the two-row action bar and the floating tab bar.
        { width: '100%', height: 'calc(100dvh - 18rem)' }
      : fluidFrame
        ? // No width — fill the content column — aspectRatio only.
          { aspectRatio: `100 / ${ratio}` }
        : {
            width: `min(100%, calc((100vh - 15.75rem) * ${100 / ratio}))`,
            aspectRatio: `100 / ${ratio}`,
          };

  // Not while the game is full screen: that view is the game alone.
  const statsPanel = statsOpen && !fullscreen.active && (
    <LiveStatsPanel
      state={liveStats.state}
      scope={liveStats.scope}
      onScope={liveStats.setScope}
      onReset={liveStats.reset}
      onRetry={liveStats.retry}
      onClose={() => setStatsOpen(false)}
      unavailable={mode === 'DEMO' || !token ? 'demo' : null}
      onPlayReal={mode === 'DEMO' ? () => switchMode('REAL') : null}
    />
  );

  const frame = (
    <div
      ref={frameRef}
      data-game-frame=""
      className={
        isPopout
          ? 'fixed inset-0 bg-black'
          : fullscreen.emulated
            ? 'fixed inset-0 z-100 overflow-hidden bg-black'
            : 'relative mx-auto overflow-hidden rounded-2xl border border-slate-800 bg-black'
      }
      style={isPopout ? undefined : frameStyle}
    >
      {launch && (
        <iframe
          key={launch.url}
          ref={iframeRef}
          src={launch.url}
          title={game.title}
          referrerPolicy={launch.referrer_policy as HTMLAttributeReferrerPolicy}
          allow="autoplay; fullscreen; encrypted-media; clipboard-write"
          className="absolute inset-0 h-full w-full border-0"
          /*
            `game_launch` fires here rather than on the tile click, which is
            what `game_open` already records. The difference is the measure
            everyone actually wants: a player who taps a game and backs out
            before the provider returns a URL, or whose launch fails, has
            opened it and not played it. onLoad is the first moment the
            game frame genuinely exists.
          */
          onLoad={() => trackGameLaunch(game.slug, mode)}
        />
      )}

      {state.status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400">
          <span
            className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500"
            aria-hidden="true"
          />
          <p className="text-sm">{t('game.loading')}</p>
        </div>
      )}

      {state.status === 'popped-out' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <PopoutIcon size={28} className="text-white/40" />
          <p className="max-w-sm text-sm text-slate-300">{t('game.popoutActive')}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => popout.open()} className={SECONDARY}>
              {t('game.popoutFocus')}
            </button>
            <button type="button" onClick={popout.close} className={PRIMARY}>
              {t('game.popoutReturn')}
            </button>
          </div>
        </div>
      )}

      {state.status === 'failed' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="max-w-sm text-sm text-slate-300">{state.message}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {state.retryable && (
              <button type="button" onClick={() => setAttempt((n) => n + 1)} className={PRIMARY}>
                {t('game.retry')}
              </button>
            )}
            {isPopout ? (
              <button type="button" onClick={() => window.close()} className={SECONDARY}>
                {t('game.closeWindow')}
              </button>
            ) : (
              <Link href={gameHref(game.slug)} className={SECONDARY}>
                {t('game.backToLobby')}
              </Link>
            )}
          </div>
        </div>
      )}

      {fullscreen.emulated && (
        // The browser's own full screen has its own way out; the fallback
        // needs one drawn.
        <button
          type="button"
          onClick={fullscreen.exit}
          aria-label={t('game.exitFullscreen')}
          title={t('game.exitFullscreen')}
          className="rl-glass-btn absolute bottom-3 right-3 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full text-white"
        >
          <MinimizeIcon size={16} />
        </button>
      )}
    </div>
  );

  if (isPopout) {
    return (
      <>
        <Seo title={game.title} path={gameHref(game.slug)} noindex />
        {frame}
      </>
    );
  }

  return (
    <PlayerLayout>
      <Seo
        title={game.title}
        description={gameDescription(t, game)}
        path={gameHref(game.slug)}
        image={game.image_url}
        imageAlt={game.title}
        card={game.image_url ? 'summary' : 'summary_large_image'}
      />

      <div className="p-2 sm:p-4 lg:p-6 max-w-[1600px] mx-auto space-y-3">
        {mode === 'REAL' && launch?.currency_fallback && (
          // The game cannot play in the player's display currency; say so
          // before they wonder why the balance in the game looks different.
          <p
            role="status"
            className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200"
          >
            {t(
              launch.currency_fallback === 'NO_RATE'
                ? 'game.currencyNoRate'
                : 'game.currencyUnsupported',
              { currency: launch.currency, display: launch.display_currency }
            )}
          </p>
        )}

        {frame}

        <div className="mx-auto" style={{ maxWidth: frameStyle.width ?? undefined }}>
          <GameActionBar
            title={game.title}
            provider={displayProvider(game.provider)}
            backHref={gameHref(game.slug)}
            currencyNote={
              mode === 'REAL' && launch ? t('game.playsIn', { currency: launch.currency }) : null
            }
            mode={mode}
            onSwitchMode={game.demo_available ? switchMode : null}
            favourite={isFavourite(game.id)}
            onFavourite={() => toggleFavourite(game)}
            statsOpen={statsOpen}
            onStats={() => setStatsOpen((open) => !open)}
            fullscreen={fullscreen.active}
            onFullscreen={launch ? fullscreen.toggle : null}
            onPopout={popout.supported ? openPopout : null}
            popoutActive={popout.active}
          />
        </div>

        {statsPanel}
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
    return { props: { game: null, failed: true } };
  }

  return { props: { game: lookup.game, failed: false } };
};

export default PlayPage;
