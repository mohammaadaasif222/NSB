import { useEffect, type FC } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';

import { useAuth } from '@/context/AuthContext';
import {
  CLARITY_ENABLED,
  CLARITY_PROJECT_ID,
  GA_ENABLED,
  GA_MEASUREMENT_ID,
  identify,
  pageView,
  resetIdentity,
} from '@/services/analytics';

/**
 * Loads GA4 and Clarity, and keeps both in step with the app.
 *
 * There is no inline snippet: both queues are created in TypeScript, on the
 * first call, so events fired before either library has downloaded are held and
 * replayed rather than dropped. All this component adds is the two downloads —
 * and neither is allowed to cost the player anything:
 *
 *   • gtag.js is `afterInteractive`: injected async once the page is
 *     interactive, so it never competes with rendering. It is not deferred
 *     further because a player who leaves within a few seconds is exactly the
 *     acquisition data a casino cannot afford to lose.
 *   • Clarity is `lazyOnload` — it waits for the browser to be idle after
 *     everything else has loaded. It is the heavier of the two (it watches DOM
 *     mutations for the whole session), and a recording that starts a moment
 *     late still answers what recordings are for.
 *
 * Rendered inside AuthProvider, which is where the account id comes from.
 */
const Analytics: FC = () => {
  const router = useRouter();
  const { user, role, hydrated } = useAuth();

  // One pageview per screen. A single-page app changes route without loading a
  // document, so gtag.js would otherwise count one view for a whole session.
  useEffect(() => {
    const send = (url: string): void => {
      // next/head writes the new <title> in an effect of its own, which has not
      // run when routeChangeComplete fires. A turn of the event loop later it
      // has, and the pageview carries the title the player actually saw.
      window.setTimeout(() => pageView(url), 0);
    };

    send(`${window.location.pathname}${window.location.search}`);

    router.events.on('routeChangeComplete', send);
    router.events.on('hashChangeComplete', send);

    return () => {
      router.events.off('routeChangeComplete', send);
      router.events.off('hashChangeComplete', send);
    };
  }, [router.events]);

  // Tie the session to the account, so a funnel can be followed across devices
  // and a recording can be found by role. The id is the internal account id and
  // nothing else — never the email, mobile or username the token also carries.
  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (user?.id) {
      identify(user.id, role || undefined);
    } else {
      resetIdentity();
    }
  }, [hydrated, user?.id, role]);

  return (
    <>
      {GA_ENABLED && (
        <Script
          id="ga4-tag"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
      )}

      {CLARITY_ENABLED && (
        <Script
          id="clarity-tag"
          strategy="lazyOnload"
          src={`https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`}
        />
      )}
    </>
  );
};

export default Analytics;
