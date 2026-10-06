import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { flush, startTracking, trackPageView } from '@/utils/tracker';
import { resetGameImpressions } from '@/hooks/useGameImpression';

/**
 * Wires the INTERNAL tracker to Next.js routing.
 *
 * A page view has to be reported on `routeChangeComplete`, not just on mount:
 * this is a single-page app after the first load, so navigating from the lobby
 * to a game never remounts the shell and would otherwise be invisible.
 *
 * GA4's own page view is NOT sent from here. `components/analytics/Analytics`
 * owns that, on the same router events, and sends it a tick later so the new
 * <title> has been written. Both used to fire, from two separate gtag
 * installations, which double-counted every page view in GA4; there is now one
 * GA4 implementation (services/analytics/gtag) and one caller.
 *
 * Mounted once, in _app.tsx.
 */
export const useTracking = (): void => {
  const router = useRouter();

  useEffect(() => {
    startTracking();

    // The first page view — the route-change handler below cannot see it,
    // because the first route never "changes".
    trackPageView(window.location.pathname);

    const onRouteChange = (url: string): void => {
      // `url` carries the query string; the path alone is what groups usefully
      // in a report, and the query is often a one-off game or affiliate id.
      const path = url.split('?')[0];
      // Sends the impressions collected on the page being left, and lets the
      // next page count the same games again — see the note on `counted`.
      resetGameImpressions();
      trackPageView(path);
    };

    router.events.on('routeChangeComplete', onRouteChange);

    return () => {
      router.events.off('routeChangeComplete', onRouteChange);
      // Send what is queued before this tears down. Not stopTracking(): the
      // listeners are process-wide and the shell only unmounts on a full
      // navigation away, which is exactly when the last batch matters most.
      flush();
    };
  }, [router.events]);
};
