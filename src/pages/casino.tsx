import type { FC } from 'react';
import type { GetServerSideProps } from 'next';

import Lobby from '@/components/player/Lobby';
import { useTranslation } from '@/context/I18nContext';
import { lobbyProps, type LobbyProps } from '@/services/lobby.server';
import { CASINO_SHELF_KEYS } from '@/constants/games';

/**
 * The casino lobby: the catalogue page — banner, search and chips over every
 * casino shelf. Same server data as the home page; the layout is Lobby's
 * `casino` variant.
 */
const Casino: FC<LobbyProps> = (props) => {
  const { t } = useTranslation();

  return (
    <Lobby
      {...props}
      seo={{ title: t('nav.casino'), description: t('misc.meta.casino'), path: '/casino' }}
      basePath="/casino"
      variant="casino"
    />
  );
};

export const getServerSideProps: GetServerSideProps<LobbyProps> = lobbyProps(CASINO_SHELF_KEYS);

export default Casino;
