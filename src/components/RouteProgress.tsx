import { useEffect, useState, type FC } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from '@/context/I18nContext';

/**
 * A thin bar across the top of the viewport while a navigation is in flight.
 *
 * Moving between pages is client-side: Next swaps the route's component and
 * the shell around it stays mounted, so the page must not be covered while
 * that happens. The full-screen splash belongs to the first visit alone (see
 * AuthGate) — reusing it on every link made a route swap look like a full
 * reload, and hid a page the player could already have been reading.
 *
 * Nothing is drawn for the first DELAY_MS. A route resolved from the client
 * bundle — the placeholder pages, the auth screens — finishes well inside
 * that, and a bar that flashes on every click is noisier than no bar at all.
 * Only a navigation genuinely waiting on the server (a page with
 * getServerSideProps behind it: the lobby, a game, a category listing) lasts
 * long enough to show one.
 */
const DELAY_MS = 150;

const RouteProgress: FC = () => {
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    let timer: number | undefined;

    const start = (url: string): void => {
      // `shallow` pushes and in-page hash jumps raise the same events without
      // fetching anything, so treating them as navigation would show a bar for
      // a transition that never waits on the network.
      if (url.split('#')[0] === router.asPath.split('#')[0]) return;

      window.clearTimeout(timer);
      timer = window.setTimeout(() => setVisible(true), DELAY_MS);
    };

    const done = (): void => {
      window.clearTimeout(timer);
      setVisible(false);
    };

    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', done);
    // Without this, an aborted or failed navigation leaves the bar running
    // over a page that has in fact finished settling.
    router.events.on('routeChangeError', done);

    return () => {
      window.clearTimeout(timer);
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', done);
      router.events.off('routeChangeError', done);
    };
  }, [router.events, router.asPath]);

  if (!visible) return null;

  return (
    <div
      role="progressbar"
      aria-label={t('common.loading')}
      aria-busy="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden bg-slate-800/60"
    >
      <div className="rolluck-route-progress h-full w-1/3 rounded-full bg-blue-500" />
    </div>
  );
};

export default RouteProgress;
