import { useEffect, useState, type FC } from 'react';
import { useRouter } from 'next/router';
import SiteLoader from '@/components/SiteLoader';

/**
 * Covers a navigation that is actually waiting on the server.
 *
 * Most routes in the app are static — the placeholder pages, the auth screens —
 * and Next resolves them from the client bundle with no round-trip at all.
 * Covering those with an overlay made every link feel slower than it was, so
 * nothing is shown until a navigation has been running for DELAY_MS. A page
 * with getServerSideProps behind it (the lobby, a game, a category listing)
 * crosses that line when the API is slow, which is the only case worth a
 * full-screen loader; anything quicker resolves before the timer fires and the
 * overlay never mounts.
 *
 * There is deliberately no first-load splash. The server already sent the
 * page's HTML, so there is no data being waited on — an overlay there would
 * hide content that is sitting ready underneath it.
 */
const DELAY_MS = 400;

const RouteLoader: FC = () => {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let timer: number | undefined;

    const start = (): void => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setVisible(true), DELAY_MS);
    };

    const done = (): void => {
      window.clearTimeout(timer);
      setVisible(false);
    };

    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', done);
    // Without this, an aborted or failed navigation leaves the overlay stuck
    // over a page the user can no longer interact with.
    router.events.on('routeChangeError', done);

    return () => {
      window.clearTimeout(timer);
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', done);
      router.events.off('routeChangeError', done);
    };
  }, [router.events]);

  return visible ? <SiteLoader /> : null;
};

export default RouteLoader;
