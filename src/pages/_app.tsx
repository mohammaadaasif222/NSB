import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { SoundProvider } from '@/context/SoundContext';
import { I18nProvider, useTranslation } from '@/context/I18nContext';
import { PlatformFeaturesProvider } from '@/context/PlatformFeaturesContext';
import { UserProvider } from '@/context/UserContext';
import { WalletProvider } from '@/context/WalletContext';
import { SeonGuardProvider } from '@/context/SeonGuardContext';
import { SupportChatProvider } from '@/context/SupportChatContext';
import { CurrencyConversionProvider } from '@/context/CurrencyConversionContext';
import { AuthModalProvider } from '@/context/AuthModalContext';
import { FavouritesProvider } from '@/context/FavouritesContext';
import { BetslipProvider } from '@/context/BetslipContext';
import RouteProgress from '@/components/RouteProgress';
import AuthGate from '@/components/AuthGate';
import AccountReviewNotice from '@/components/risk/AccountReviewNotice';
import LoginPopup from '@/components/player/LoginPopup';
import SeonAgentWarmup from '@/components/SeonAgentWarmup';
import RegionRestrictedModal from '@/components/modals/RegionRestrictedModal';
import EmailVerifyPromptModal from '@/components/modals/EmailVerifyPromptModal';
import PhoneVerifyPromptModal from '@/components/modals/PhoneVerifyPromptModal';
import Analytics from '@/components/analytics/Analytics';
import Seo from '@/components/seo/Seo';
import { SITE_NAME } from '@/constants/site';
import IntercomLauncher from '@/components/support/IntercomLauncher';
import { EventListeners } from '@/components/listeners/EventListeners';
import { useTracking } from '@/hooks/useTracking';

import '@/index.css';
import 'react-toastify/dist/ReactToastify.css';

/**
 * The shell's default <head>. Rendered inside I18nProvider so the description
 * follows the player's language; pages override both with their own <Head>.
 */
function AppHead() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#05070d" />
        <meta property="og:site_name" content={SITE_NAME} />
      </Head>
      <Seo
        title={t('misc.meta.homeTitle')}
        bareTitle
        description={t('misc.meta.description')}
        hreflang={false}
      />
    </>
  );
}

/** App shell: the provider tree and toast host wrapping every page. */
export default function App({ Component, pageProps }: AppProps) {
  // Page views and page timing. Called at the shell so it survives every
  // client-side route change; see useTracking for why mounting alone is not
  // enough in a single-page app.
  useTracking();

  return (
    <>
      {/* Outermost of the data providers, and unauthenticated: which features
          are switched on decides what the nav and the signed-out pages even
          render, so it must not wait on a session. */}
      <PlatformFeaturesProvider>
        <I18nProvider>
          <AppHead />
          <AuthProvider>
            {/* Inside AuthProvider: it reads the account id to tie the session to. */}
            <Analytics />

            <ThemeProvider>
              <SoundProvider>
                <UserProvider>
                  <WalletProvider>
                    {/* Inside WalletProvider: it reads the summary's snapshot
                    rates to convert crypto amounts for display. */}
                    <CurrencyConversionProvider>
                      {/* Outside AuthModalProvider so the auth modals' "Need help?"
                      can open the support messenger. */}
                      <SupportChatProvider>
                        {/* Outside AuthModalProvider so the login and sign-up modals can
                        reach the step-up prompt through useSeonGuard() too. */}
                        <SeonGuardProvider>
                          <AuthModalProvider>
                            {/* Inside AuthModalProvider: hearting signed out opens login. */}
                            <FavouritesProvider>
                              {/* Above the pages, so sportsbook picks survive moving between them. */}
                              <BetslipProvider>
                                <EventListeners />
                                <Component {...pageProps} />
                              </BetslipProvider>
                            </FavouritesProvider>
                            <SeonAgentWarmup />
                            <RegionRestrictedModal />
                            {/* A bar at the top edge, not an overlay: a link
                          swaps the route in place and must not blank the page
                          the player is on. */}
                            <RouteProgress />
                            {/* The one full-screen splash, and only on arrival:
                          after RouteProgress so that on a first load, where
                          both could be showing, this one wins the overlap. */}
                            <AuthGate />
                            <AccountReviewNotice />
                            <EmailVerifyPromptModal />
                            <PhoneVerifyPromptModal />
                            <LoginPopup />
                            {/* Outside the page so the bubble survives route changes,
                          and inside SupportChatProvider so an operator switching
                          Intercom off removes it without a deploy. */}
                            <IntercomLauncher />
                            <ToastContainer
                              position="top-right"
                              autoClose={3000}
                              newestOnTop
                              closeOnClick
                              pauseOnHover
                              draggable
                              theme="dark"
                            />
                          </AuthModalProvider>
                        </SeonGuardProvider>
                      </SupportChatProvider>
                    </CurrencyConversionProvider>
                  </WalletProvider>
                </UserProvider>
              </SoundProvider>
            </ThemeProvider>
          </AuthProvider>
        </I18nProvider>
      </PlatformFeaturesProvider>
    </>
  );
}
