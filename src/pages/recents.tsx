import type { FC } from 'react';
import MyGamesPage from '@/components/player/MyGamesPage';
import { useRecentGames } from '@/hooks/useRecentGames';

/** The games the player launched most recently, newest first. */
const Recents: FC = () => {
  const { games, failed } = useRecentGames();

  return (
    <MyGamesPage
      titleKey="recents.title"
      emptyKey="recents.empty"
      surface="recents"
      games={games}
      failed={failed}
    />
  );
};

export default Recents;
