import type { FC } from 'react';
import { useAuth } from '@/context/AuthContext';
import SiteLoader from '@/components/SiteLoader';

/**
 * Hides the page until the session has been restored from sessionStorage.
 *
 * The token is only readable in an effect after mount, so the server HTML and
 * the first client render are both necessarily signed-out: the header paints
 * Login/Register and swaps to the wallet a moment later, which reads as the
 * site logging you out and back in on every refresh.
 *
 * This is an overlay rather than a replacement for the page. The page has to
 * render underneath so its <Head> tags and markup still reach the server
 * output — a splash in place of the content would strip every page's title,
 * description and copy out of the HTML crawlers see.
 */
const AuthGate: FC = () => {
  const { hydrated } = useAuth();

  return hydrated ? null : <SiteLoader />;
};

export default AuthGate;
