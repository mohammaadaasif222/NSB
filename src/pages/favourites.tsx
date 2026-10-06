import type { FC } from 'react';
import MyGamesPage from '@/components/player/MyGamesPage';
import { useFavourites } from '@/context/FavouritesContext';
import { getMyGamesProps, type MyGamesPageProps } from '@/services/myGames.server';

/**
 * The player's favourite games, newest-hearted first. The same list drives
 * every heart, so unhearting a tile here takes it off the page at once.
 */
const Favourites: FC<MyGamesPageProps> = ({ winnerGames }) => {
  const { games, failed } = useFavourites();

  return (
    <MyGamesPage
      titleKey="nav.favourites"
      emptyKey="favourites.empty"
      surface="favourites"
      games={games}
      failed={failed}
      winnerGames={winnerGames}
    />
  );
};

export const getServerSideProps = getMyGamesProps;

export default Favourites;
