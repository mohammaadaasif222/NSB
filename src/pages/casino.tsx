import type { FC } from 'react';
import type { GetServerSideProps } from 'next';

import Lobby from '@/components/player/Lobby';
import { useTranslation } from '@/context/I18nContext';
import { getLobbyProps, type LobbyProps } from '@/services/lobby.server';

/**
 * The casino lobby: the catalogue page — banner, search and chips over every
 * casino shelf. Same server data as the home page; the layout is Lobby's
 * `casino` variant.
 */
const Casino: FC<LobbyProps> = (props) => {
  const { t } = useTranslation();

  return (
    <Lobby {...props} title={`${t('nav.casino')} — ROLLUCK`} basePath="/casino" variant="casino" />
  );
};

export const getServerSideProps: GetServerSideProps<LobbyProps> = getLobbyProps;

export default Casino;
