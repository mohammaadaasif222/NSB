import type { GetServerSideProps } from 'next';
import { fetchShelfList } from '@/services/games.server';
import type { Game } from '@/types';

/** What the Recents and Favourites pages render from on the server. */
export interface MyGamesPageProps {
  /** Real games for the Recent Winners row — the newest releases. */
  winnerGames: Game[];
}

/**
 * getServerSideProps for Recents and Favourites. The player's own list needs
 * their token, which lives in sessionStorage, so it loads in the browser;
 * only the public Recent Winners row is rendered here.
 */
export const getMyGamesProps: GetServerSideProps<MyGamesPageProps> = async () => {
  const { data } = await fetchShelfList({ category: 'NEW_RELEASE' }, 1, 7);
  return { props: { winnerGames: data } };
};
