import {
  useEffect,
  useState,
  type FC,
  type HTMLAttributeReferrerPolicy,
} from 'react';
import { useRouter } from 'next/router';
import { playHref } from '@/constants/games';
import SelectGameModal from '@/components/player/SelectGameModal';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import {
  currentGameDevice,
  fetchGame,
  fetchLastGame,
  launchGame,
  saveLastGame,
} from '@/services/games';
import { trackGameLaunch } from '@/utils/events';
import type { ApiError, Game, GameLaunch, GameMode } from '@/types';
import chevronSmall from '@/assets/lobby/chevron-small.svg';
import clearIcon from '@/assets/lobby/clear-x.svg';

/**
 * The aggregator game slug auto-launched in the lobby card. Launched via
 * /games/<slug>/launch so the card iframes the real provider UI — not a
 * native Originals component.
 */
const DEFAULT_LOBBY_SLUG = 'crash-tequity';

type ActiveGameState =
  | { status: 'idle' }
  | { status: 'loading'; game: Game; mode: GameMode }
  | { status: 'ready'; game: Game; mode: GameMode; launch: GameLaunch }
  | { status: 'failed'; game: Game; mode: GameMode; message: string };

const CrashPreview: FC = () => {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { user, hydrated } = useAuth();
  const [picking, setPicking] = useState(false);
  const [active, setActive] = useState<ActiveGameState>({ status: 'idle' });

  // Pick → launch inline. REAL mode needs the player's session; a failure
  // (not signed in, blocked territory, provider unavailable) surfaces as a
  // small error with a "Open in full page" fallback so the user is never
  // stuck looking at a dead iframe spinner. DEMO mode works signed-out.
  //
  // Signed-in players: the (slug, mode) is persisted server-side (fire-and-
  // forget) so this exact card restores on their next device.
  const openGame = (game: Game, mode: GameMode = 'REAL'): void => {
    setActive({ status: 'loading', game, mode });
    void launchGame(game.slug, mode, locale, currentGameDevice())
      .then((launch) => {
        setActive({ status: 'ready', game, mode, launch });
        if (user) {
          void saveLastGame(game.slug, mode);
        }
      })
      .catch((err: ApiError) =>
        setActive({
          status: 'failed',
          game,
          mode,
          message: err?.message || t('game.launchFailed'),
        })
      );
  };

  const closeGame = (): void => setActive({ status: 'idle' });

  // Rehydrate the lobby card with whatever game the player last opened on
  // it, on any device. Runs once auth is hydrated.
  //   Signed-in  → fetchLastGame() first; if none/stale, fall back to the
  //                default Tequity iframe in REAL mode.
  //   Signed-out → default Tequity iframe in DEMO so the card is never empty.
  // If the default slug is missing from the catalogue we surface a 'failed'
  // state with a clear message + "pick another game" button — the user is
  // never stuck watching a silent spinner.
  useEffect(() => {
    if (!hydrated) return;
    // Only restore when the player has not already picked something this
    // session — otherwise refetching would clobber their current game.
    if (active.status !== 'idle') return;
    let cancelled = false;
    void (async () => {
      const fallbackMode: GameMode = user ? 'REAL' : 'DEMO';
      if (user) {
        const pref = await fetchLastGame();
        if (cancelled) return;
        if (pref?.slug) {
          const game = await fetchGame(pref.slug);
          if (cancelled) return;
          if (game) {
            openGame(game, pref.mode);
            return;
          }
        }
      }
      const fallback = await fetchGame(DEFAULT_LOBBY_SLUG);
      if (cancelled) return;
      if (!fallback) {
        setActive({
          status: 'failed',
          game: {
            slug: DEFAULT_LOBBY_SLUG,
            title: DEFAULT_LOBBY_SLUG,
          } as Game,
          mode: fallbackMode,
          message: `Default game "${DEFAULT_LOBBY_SLUG}" not found in catalogue. Pick another game to play.`,
        });
        return;
      }
      openGame(fallback, fallbackMode);
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally keyed only to the player's identity: we restore once
    // per sign-in (or on first landing), not on every state change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, user?.id]);

  const activeGame = active.status === 'idle' ? null : active.game;
  const headerLabel = activeGame?.title ?? 'Loading…';

  // Single card layout for every state. The static "Crash preview" fallback
  // was removed so an unresolved auto-launch never flashes a mock chart and
  // bet slip. Idle renders the same shell as loading — just a spinner —
  // until the useEffect above resolves the default game.
  return (
    <>
      <section className="rl-glass-deep overflow-hidden rounded-[calc(var(--u)*34)] flex h-[min(80vh,860px)] min-h-[560px] lg:min-h-[640px] flex-col">
        <div className="flex items-center justify-between gap-3 px-[calc(var(--u)*16)] pt-[calc(var(--u)*20)] lg:px-[calc(var(--u)*30)] lg:pt-[calc(var(--u)*27)]">
          <div className="flex items-center gap-[calc(var(--u)*10)]">
            <button
              type="button"
              onClick={() => setPicking(true)}
              aria-haspopup="dialog"
              aria-expanded={picking}
              className="flex h-[calc(var(--u)*50)] items-center gap-[calc(var(--u)*10)] rounded-[calc(var(--u)*12.5)] border border-white/[0.07] bg-[#1b1d28] px-[calc(var(--u)*15)] text-[length:max(min(var(--tf,11px),18px),calc(var(--u)*18))] font-medium leading-[calc(var(--u)*28)] text-[#f5f6f9] transition-colors hover:bg-[#232634]"
            >
              {headerLabel}
              <img
                src={chevronSmall.src}
                alt=""
                className="h-[calc(var(--u)*18)] w-[calc(var(--u)*18)]"
              />
            </button>
            {active.status !== 'idle' && active.mode === 'DEMO' && (
              <span
                className="inline-flex h-[calc(var(--u)*26)] items-center rounded-full border border-[#f9d028]/40 bg-[#f9d028]/15 px-[calc(var(--u)*10)] text-[length:max(min(var(--tf,11px),12px),calc(var(--u)*12))] font-semibold uppercase leading-none tracking-wide text-[#f9d028]"
                aria-label="Demo mode — fun play, no real money"
              >
                Demo
              </span>
            )}
          </div>
          {activeGame && (
            <button
              type="button"
              onClick={closeGame}
              aria-label={t('common.close')}
              title={t('common.close')}
              className="flex h-[calc(var(--u)*50)] w-[calc(var(--u)*50)] items-center justify-center rounded-[calc(var(--u)*12.5)] border border-white/[0.07] bg-[#1b1d28] text-[#9da2b4] transition-colors hover:bg-[#232634] hover:text-white"
            >
              <img src={clearIcon.src} alt="" className="h-[calc(var(--u)*12)] w-[calc(var(--u)*12)]" />
            </button>
          )}
        </div>

        <div className="relative mt-[calc(var(--u)*20)] flex-1 overflow-hidden bg-black">
          {active.status === 'ready' && (
            <iframe
              key={active.launch.url}
              src={active.launch.url}
              title={active.game.title}
              referrerPolicy={active.launch.referrer_policy as HTMLAttributeReferrerPolicy}
              allow="autoplay; fullscreen; encrypted-media; clipboard-write"
              className="absolute inset-0 h-full w-full border-0"
              onLoad={() => trackGameLaunch(active.game.slug, active.mode)}
            />
          )}
          {(active.status === 'idle' || active.status === 'loading') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#9da2b4]">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-[#f9d028]" />
              <span className="text-[14px]">
                {active.status === 'loading' ? `Loading ${active.game.title}…` : 'Loading game…'}
              </span>
            </div>
          )}
          {active.status === 'failed' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-[14px] text-red-400">{active.message}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openGame(active.game, active.mode)}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-[13px] text-white hover:bg-white/15"
                >
                  Retry
                </button>
                <button
                  type="button"
                  onClick={() => setPicking(true)}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-[13px] text-white hover:bg-white/15"
                >
                  Pick a game
                </button>
                <button
                  type="button"
                  onClick={() => void router.push(playHref(active.game.slug))}
                  className="rounded-lg bg-[#f9d028] px-3 py-1.5 text-[13px] font-medium text-[#07080a] hover:brightness-110"
                >
                  Open in full page
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <SelectGameModal
        open={picking}
        onClose={() => setPicking(false)}
        onPlay={openGame}
      />
    </>
  );
};

export default CrashPreview;
