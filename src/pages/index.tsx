import type { FC } from 'react';
import type { GetServerSideProps } from 'next';

import Lobby from '@/components/player/Lobby';
import { getLobbyProps, type LobbyProps } from '@/services/lobby.server';

/**
 * The lobby: the dashboard for signed-in players and the landing page for
 * everyone else. Casino and sportsbook together — /casino and /sports each
 * carry one half.
 */
const Home: FC<LobbyProps> = (props) => (
  <Lobby {...props} title="ROLLUCK" basePath="/" withSports />
);

export const getServerSideProps: GetServerSideProps<LobbyProps> = getLobbyProps;

export default Home;
