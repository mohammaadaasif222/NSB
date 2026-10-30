import type { FC } from 'react';
import type { GetServerSideProps } from 'next';

import Lobby from '@/components/player/Lobby';
import type { JsonLd } from '@/components/seo/Seo';
import { useTranslation } from '@/context/I18nContext';
import { SUPPORT_EMAIL } from '@/constants/auth';
import { SITE_LOGO, SITE_NAME, SITE_URL, absoluteUrl } from '@/constants/site';
import { lobbyProps, type LobbyProps } from '@/services/lobby.server';
import { HOME_SHELF_KEYS } from '@/constants/games';

const HOME_JSON_LD: JsonLd[] = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: absoluteUrl(SITE_LOGO),
    email: SUPPORT_EMAIL,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: SUPPORT_EMAIL,
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    publisher: { '@id': `${SITE_URL}/#organization` },
  },
];

/**
 * The lobby: the dashboard for signed-in players and the landing page for
 * everyone else. Casino and sportsbook together — /casino and /sports each
 * carry one half.
 */
const Home: FC<LobbyProps> = (props) => {
  const { t } = useTranslation();

  return (
    <Lobby
      {...props}
      seo={{
        title: t('misc.meta.homeTitle'),
        bareTitle: true,
        description: t('misc.meta.description'),
        path: '/',
        jsonLd: HOME_JSON_LD,
      }}
      basePath="/"
      variant="home"
    />
  );
};

export const getServerSideProps: GetServerSideProps<LobbyProps> = lobbyProps(HOME_SHELF_KEYS, {
  streams: true,
});

export default Home;
