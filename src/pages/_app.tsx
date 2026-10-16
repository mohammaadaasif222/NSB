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
import RouteLoader from '@/components/RouteLoader';
import AuthGate from '@/components/AuthGate';
import SeonAgentWarmup from '@/components/SeonAgentWarmup';
import Analytics from '@/components/analytics/Analytics';
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
    <Head>
      <title>ROLLUCK</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content={t('misc.meta.description')} />
      <link
        rel="icon"
        type="image/svg+xml"
        href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='14' fill='%232563eb'/><text x='32' y='44' font-family='system-ui,sans-serif' font-size='34' font-weight='800' fill='%23ffffff' text-anchor='middle'>R</text></svg>"
      />
    </Head>
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
                        <AuthModalProvider>
                          {/* Innermost, so the step-up prompt renders above every page
                          and any component can reach it through useSeonGuard(). */}
                          <SeonGuardProvider>
                            {/* Inside AuthModalProvider: hearting signed out opens login. */}
                            <FavouritesProvider>
                              {/* Above the pages, so sportsbook picks survive moving between them. */}
                              <BetslipProvider>
                                <EventListeners />
                                <Component {...pageProps} />
                              </BetslipProvider>
                            </FavouritesProvider>
                          </SeonGuardProvider>
                          <SeonAgentWarmup />
                          <RouteLoader />
                          {/* After RouteLoader so that on a first load, where
                          both could be showing, this one wins the overlap. */}
                          <AuthGate />
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
