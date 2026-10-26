import type { FC } from 'react';
import type { GetServerSideProps } from 'next';

import Lobby from '@/components/player/Lobby';
import { useTranslation } from '@/context/I18nContext';
import { LIVE_CASINO_HREF, LIVE_SHELF_KEYS } from '@/constants/games';
import { lobbyProps, type LobbyProps } from '@/services/lobby.server';

/**
 * The Live Casino lobby: banner, the live menu (pinned while scrolling) and
 * the live rows from the Casino Manager sheet — popular, new, blackjack,
 * roulette, game shows, baccarat and lightning tables.
 */
const LiveCasino: FC<LobbyProps> = (props) => {
  const { t } = useTranslation();

  return (
    <Lobby
      {...props}
      seo={{
        title: t('dash.liveCasino'),
        description: t('misc.meta.liveCasino'),
        path: LIVE_CASINO_HREF,
      }}
      basePath={LIVE_CASINO_HREF}
      variant="live"
    />
  );
};

export const getServerSideProps: GetServerSideProps<LobbyProps> = lobbyProps(LIVE_SHELF_KEYS);

export default LiveCasino;
