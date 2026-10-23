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
import { CloseIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { gameHref, playHref } from '@/constants/games';
import { fetchGameBySlug } from '@/services/games.server';
import { markUnavailable } from '@/utils/unavailable.server';
import { currentGameDevice, launchGame } from '@/services/games';
import { requestBalanceRefresh } from '@/utils/balanceEvents';
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
  | { status: 'failed'; message: string; retryable: boolean };

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
 */
const PlayPage: FC<Props> = ({ game, failed }) => {
  const router = useRouter();
  const { token, hydrated } = useAuth();
  const { t, locale } = useTranslation();
  const mode: GameMode = router.query.mode === 'demo' ? 'DEMO' : 'REAL';

  const [state, setState] = useState<LaunchState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // The launch this page last asked for. Guards against a second launch for
  // the same request (React's development double-render would otherwise open
  // two sessions) and lets a slow response for an abandoned request be ignored.
  const requested = useRef<string | null>(null);

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

  useEffect(() => {
    if (!game || !router.isReady || !hydrated) {
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
  }, [game, mode, attempt, token, hydrated, router, locale, failure]);

  const launch = state.status === 'ready' ? state.launch : null;

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
          void router.push(gameHref(game.slug));
          break;
        case 'aleaplay.reload':
          setAttempt((n) => n + 1);
          break;
        case 'aleaplay.roundEnd':
          requestBalanceRefresh();
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
  }, [launch, game, router, t]);

  // Bets and wins reach the wallet server-to-server, and only some providers
  // announce round ends, so real-money play also polls the balance.
  useEffect(() => {
    if (mode !== 'REAL' || !launch) {
      return;
    }
    const id = window.setInterval(requestBalanceRefresh, BALANCE_POLL_MS);
    return () => {
      window.clearInterval(id);
      requestBalanceRefresh();
    };
  }, [mode, launch]);

  useEffect(() => {
    const onChange = (): void => setFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = (): void => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void frameRef.current?.requestFullscreen?.().catch(() => undefined);
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
  // TEQUITY aggregator — not just "any game with null ratio" — so an
  // Alea Play / Pragmatic Play game that happens to miss a ratio stays
  // on the original width-constrained sizing it was designed for.
  const isTequity = launch?.aggregator_code === 'TEQUITY';
  // Desktop: the game's own shape, as large as the viewport allows. Mobile
  // builds fill the screen whatever shape the desktop build has. The offsets
  // cover the sticky top bar (with its winners ticker), this page's header row
  // and padding, so the frame fits without scrolling under the bar.
  const frameStyle: CSSProperties = fullscreen
    ? { width: '100%', height: '100%' }
    : launch?.device === 'MOBILE'
      ? { width: '100%', height: 'calc(100dvh - 12.5rem)' }
      : isTequity
        ? // No width — fill the content column — aspectRatio only.
          { aspectRatio: `100 / ${ratio}` }
        : {
            width: `min(100%, calc((100vh - 14.5rem) * ${100 / ratio}))`,
            aspectRatio: `100 / ${ratio}`,
          };

  const otherMode: GameMode | null =
    mode === 'REAL' ? (game.demo_available ? 'DEMO' : null) : 'REAL';

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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={gameHref(game.slug)}
              aria-label={t('game.backToLobby')}
              title={t('game.backToLobby')}
              className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <CloseIcon size={16} />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-base sm:text-lg font-bold text-white">{game.title}</h1>
              <p className="truncate text-xs text-slate-400">{game.provider}</p>
            </div>
            <span
              className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                mode === 'DEMO'
                  ? 'bg-slate-700 text-slate-200'
                  : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              }`}
            >
              {mode === 'DEMO' ? t('game.demo') : t('game.realMoney')}
            </span>
            {mode === 'REAL' && launch && (
              <span className="flex-shrink-0 rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-300">
                {t('game.playsIn', { currency: launch.currency })}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {otherMode && (
              <Link href={playHref(game.slug, otherMode)} className={SECONDARY}>
                {otherMode === 'DEMO' ? t('game.playDemo') : t('game.playReal')}
              </Link>
            )}
            <button
              type="button"
              onClick={toggleFullscreen}
              disabled={!launch}
              className={SECONDARY}
            >
              {t('game.fullscreen')}
            </button>
          </div>
        </div>

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

        <div
          ref={frameRef}
          className="relative mx-auto overflow-hidden rounded-2xl border border-slate-800 bg-black"
          style={frameStyle}
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

          {state.status === 'failed' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <p className="max-w-sm text-sm text-slate-300">{state.message}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {state.retryable && (
                  <button
                    type="button"
                    onClick={() => setAttempt((n) => n + 1)}
                    className={PRIMARY}
                  >
                    {t('game.retry')}
                  </button>
                )}
                <Link href={gameHref(game.slug)} className={SECONDARY}>
                  {t('game.backToLobby')}
                </Link>
              </div>
            </div>
          )}
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
    return { props: { game: null, failed: true } };
  }

  return { props: { game: lookup.game, failed: false } };
};

export default PlayPage;
