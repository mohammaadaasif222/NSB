import type { FC } from 'react';
import MyGamesPage from '@/components/player/MyGamesPage';
import { useRecentGames } from '@/hooks/useRecentGames';
import { getMyGamesProps, type MyGamesPageProps } from '@/services/myGames.server';

/** The games the player launched most recently, newest first. */
const Recents: FC<MyGamesPageProps> = ({ winnerGames }) => {
  const { games, failed } = useRecentGames();

  return (
    <MyGamesPage
      titleKey="recents.title"
      emptyKey="recents.empty"
      surface="recents"
      games={games}
      failed={failed}
      winnerGames={winnerGames}
    />
  );
};

export const getServerSideProps = getMyGamesProps;

export default Recents;
