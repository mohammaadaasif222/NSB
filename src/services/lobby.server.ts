import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { SHELF_KEYS } from '@/constants/games';
import { fetchHomeShelves, fetchLobbyProviders, parsePageParam } from '@/services/games.server';
import type { GameShelf, GameShelfKey, LobbyProvider } from '@/types';

/** What every lobby-style page (home, casino) is rendered from. */
export interface LobbyProps {
  shelves: GameShelf[];
  /** The Providers row, curated in the admin console. Empty hides the row. */
  providers: LobbyProvider[];
  /** The page's query, echoed back so pager links can preserve it. */
  query: Record<string, string>;
  catalogueFailed: boolean;
}

/**
 * getServerSideProps for the lobby pages.
 *
 * Kept out of the page files so `/` and `/casino` share one implementation.
 * Each page assigns it to its own `getServerSideProps` export; Next strips that
 * export from the client bundle, which leaves this import unused there and so
 * keeps the server-only fetching out of the browser.
 *
 * Runs on every request: no caching, because a shelf's page number lives in
 * the query string and the catalogue is edited from the admin console.
 *
 * The greeting and balance are NOT fetched here: the JWT lives in
 * sessionStorage, which the server cannot read. Account-specific UI hydrates
 * client-side, leaving this render identical for every visitor and therefore
 * safe to serve to signed-out ones.
 */
export const getLobbyProps = async (
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<LobbyProps>> => {
  const pages = Object.fromEntries(
    SHELF_KEYS.map((key) => [key, parsePageParam(context.query[key])])
  ) as Record<GameShelfKey, number>;

  // In parallel: two independent public reads, and the page waits on both.
  const [{ shelves, failed }, providers] = await Promise.all([
    fetchHomeShelves(pages),
    fetchLobbyProviders(),
  ]);

  // Normalised copy of the query for the pager links: single-valued strings,
  // and page-1 entries dropped so hrefs stay short.
  const query: Record<string, string> = {};
  for (const key of SHELF_KEYS) {
    if (pages[key] > 1) {
      query[key] = String(pages[key]);
    }
  }

  return {
    props: {
      shelves,
      providers,
      query,
      catalogueFailed: failed,
    },
  };
};
