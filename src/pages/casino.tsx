import type { FC } from 'react';
import type { GetServerSideProps } from 'next';

import Lobby from '@/components/player/Lobby';
import { useTranslation } from '@/context/I18nContext';
import { getLobbyProps, type LobbyProps } from '@/services/lobby.server';

/**
 * The casino lobby: the home page without the sportsbook teasers, which live
 * on /sports. Same hero, same shelves, same server data — only the route and
 * the pager links built against it differ.
 */
const Casino: FC<LobbyProps> = (props) => {
  const { t } = useTranslation();

  return (
    <Lobby
      {...props}
      title={`${t('nav.casino')} — ROLLUCK`}
      basePath="/casino"
      withSports={false}
    />
  );
};

export const getServerSideProps: GetServerSideProps<LobbyProps> = getLobbyProps;

export default Casino;
