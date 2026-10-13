import type { FC } from 'react';
import MyGamesPage from '@/components/player/MyGamesPage';
import { useFavourites } from '@/context/FavouritesContext';
import { getMyGamesProps, type MyGamesPageProps } from '@/services/myGames.server';

/**
 * What the player has hearted — their studios, then their games, newest
 * first. The same lists drive every heart on the site, so unhearting a tile
 * or a plate here takes it off the page at once.
 */
const Favourites: FC<MyGamesPageProps> = ({ winnerGames }) => {
  const { games, failed, providers } = useFavourites();

  return (
    <MyGamesPage
      titleKey="nav.favourites"
      emptyKey="favourites.empty"
      surface="favourites"
      games={games}
      failed={failed}
      providers={providers}
      winnerGames={winnerGames}
    />
  );
};

export const getServerSideProps = getMyGamesProps;

export default Favourites;
