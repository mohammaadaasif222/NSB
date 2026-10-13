import type { GetServerSideProps } from 'next';
import { fetchShelfList } from '@/services/games.server';
import type { Game } from '@/types';

/** What the Recents and Favourites pages render from on the server. */
export interface MyGamesPageProps {
  /** Real games for the Recent Winners row — the newest releases. */
  winnerGames: Game[];
}

/** One card per sample win in the row. */
const WINNER_GAMES = 7;

/**
 * Real games for a Recent Winners row on a page that has no shelves of its
 * own to draw from: `seed` first (a page's own games, when it has some), then
 * the newest releases, then the rest of the catalogue.
 *
 * Topped up rather than taken from one list because the row hides itself when
 * it has no games to pair its wins with — a catalogue with no NEW_RELEASE
 * games would otherwise drop it from every page but the lobby, which draws on
 * all of its shelves.
 */
export const fetchWinnerGames = async (seed: Game[] = []): Promise<Game[]> => {
  const picked = [...seed];
  const add = (games: Game[]): void => {
    const seen = new Set(picked.map((g) => g.id));
    picked.push(...games.filter((g) => !seen.has(g.id)));
  };

  if (picked.length < WINNER_GAMES) {
    add((await fetchShelfList({ category: 'NEW_RELEASE' }, 1, WINNER_GAMES)).data);
  }
  if (picked.length < WINNER_GAMES) {
    add((await fetchShelfList({}, 1, WINNER_GAMES)).data);
  }
  return picked.slice(0, WINNER_GAMES);
};

/**
 * getServerSideProps for Recents and Favourites. The player's own list needs
 * their token, which lives in sessionStorage, so it loads in the browser;
 * only the public Recent Winners row is rendered here.
 */
export const getMyGamesProps: GetServerSideProps<MyGamesPageProps> = async () => ({
  props: { winnerGames: await fetchWinnerGames() },
});
