import { useCallback, useEffect, useRef, useState, type FC, type ReactNode } from 'react';
import { useRouter } from 'next/router';

import PlayerLayout from '@/layout/PlayerLayout';
import Seo from '@/components/seo/Seo';
import { useAuth } from '@/context/AuthContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { useTranslation } from '@/context/I18nContext';
import { useWallet } from '@/context/WalletContext';
import { launchSportsbook } from '@/services/sportsbook';
import { requestBalanceRefresh } from '@/utils/balanceEvents';
import type { ApiError } from '@/types';

/** How often the wallet chip re-reads the balance while bets may be moving it. */
const BALANCE_POLL_MS = 10_000;

const RETRY =
  'inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs sm:text-sm font-bold transition-colors';

type State =
  | { status: 'loading' }
  | { status: 'ready'; html: string }
  | { status: 'failed'; message: string; retryable: boolean }
  /** The backend has no sportsbook configured: the page stays as it is. */
  | { status: 'unconfigured' };

/** What the frame's handlers post to this page; see the backend's slotegrator-betby.ts. */
interface FrameMessage {
  source: 'sportsbook';
  event: 'login' | 'register' | 'session-refresh' | 'deposit';
}

const isFrameMessage = (data: unknown): data is FrameMessage =>
  typeof data === 'object' && data !== null && (data as FrameMessage).source === 'sportsbook';

/**
 * The sportsbook itself, in place of a page's own content.
 *
 * The launch answers with a document, rendered in a frame on our own domain.
 * Its buttons reach back here for what only the site has: the login modal, the
 * wallet. Every change of who is playing, or in what currency, launches afresh,
 * because a session is bound to both; so does the frame's own session refresh.
 *
 * Until the backend has a sportsbook configured, `children` render unchanged.
 * Any other failure is shown as one: a page of sample fixtures must never pass
 * for a live book that happens to be down.
 */
const SportsbookGate: FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const { token, hydrated } = useAuth();
  const { openLogin, openRegister } = useAuthModal();
  const { summary } = useWallet();
  const activeCurrency = token ? (summary?.preferences?.active_currency ?? null) : null;

  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const frame = useRef<HTMLIFrameElement>(null);
  // The launch last asked for: guards against a second one for the same request
  // (React's development double-render) and lets a slow, abandoned one be ignored.
  const requested = useRef<string | null>(null);

  const relaunch = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    const key = `${token ?? 'guest'}:${activeCurrency ?? ''}:${locale}:${attempt}`;
    if (requested.current === key) {
      return;
    }
    requested.current = key;
    setState({ status: 'loading' });

    launchSportsbook(locale)
      .then(({ html }) => {
        if (requested.current === key) {
          setState({ status: 'ready', html });
        }
      })
      .catch((error: ApiError) => {
        if (requested.current !== key) {
          return;
        }
        if (error.status === 503) {
          setState({ status: 'unconfigured' });
        } else if (error.status === 403) {
          setState({ status: 'failed', message: t('game.accountBlocked'), retryable: false });
        } else {
          setState({ status: 'failed', message: t('game.launchFailed'), retryable: true });
        }
      });
  }, [hydrated, token, activeCurrency, locale, attempt, t]);

  const ready = state.status === 'ready';

  useEffect(() => {
    if (!ready) {
      return;
    }
    const onMessage = (event: MessageEvent): void => {
      if (event.source !== frame.current?.contentWindow || !isFrameMessage(event.data)) {
        return;
      }
      switch (event.data.event) {
        case 'login':
          openLogin();
          break;
        case 'register':
          openRegister();
          break;
        case 'deposit':
          void router.push('/wallet');
          break;
        case 'session-refresh':
          relaunch();
          break;
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [ready, openLogin, openRegister, router, relaunch]);

  useEffect(() => {
    if (!ready || !token) {
      return;
    }
    const id = window.setInterval(requestBalanceRefresh, BALANCE_POLL_MS);
    return () => {
      window.clearInterval(id);
      requestBalanceRefresh();
    };
  }, [ready, token]);

  if (state.status === 'unconfigured') {
    return <>{children}</>;
  }

  return (
    <PlayerLayout>
      <Seo title={t('nav.sports')} />
      <div className="relative h-[calc(100dvh-5rem)] w-full">
        {state.status === 'ready' && (
          <iframe
            key={state.html}
            ref={frame}
            srcDoc={state.html}
            title={t('nav.sports')}
            allow="autoplay; fullscreen; clipboard-write"
            className="absolute inset-0 h-full w-full border-0"
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
            {state.retryable && (
              <button type="button" onClick={relaunch} className={RETRY}>
                {t('game.retry')}
              </button>
            )}
          </div>
        )}
      </div>
    </PlayerLayout>
  );
};

export default SportsbookGate;
