import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import {
  fetchHomeShelves,
  fetchLobbyProviders,
  fetchRegisteredTodayCount,
  parsePageParam,
} from '@/services/games.server';
import { fetchFaqsServer } from '@/services/faqs.server';
import type { FaqItem } from '@/services/faqs';
import { fetchLiveStreamsServer } from '@/services/liveStreams.server';
import type { LiveStream } from '@/services/liveStreams';
import type { GameShelf, GameShelfKey, LobbyProvider } from '@/types';

/** What every lobby-style page (home, casino, live casino) is rendered from. */
export interface LobbyProps {
  shelves: GameShelf[];
  /** The Providers row, curated in the admin console. Empty hides the row. */
  providers: LobbyProvider[];
  catalogueFailed: boolean;
  faqs: FaqItem[];
  streams: LiveStream[];
  registeredToday: number | null;
}

interface LobbyOptions {
  streams?: boolean;
}

/**
 * getServerSideProps for a lobby page that draws `keys`.
 *
 * Kept out of the page files so `/`, `/casino` and `/live-casino` share one
 * implementation; each fetches only its own shelves.
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
export const lobbyProps =
  (keys: readonly GameShelfKey[], options: LobbyOptions = {}): GetServerSideProps<LobbyProps> =>
  async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<LobbyProps>> => {
    const pages = Object.fromEntries(
      keys.map((key) => [key, parsePageParam(context.query[key])])
    ) as Record<GameShelfKey, number>;

    // In parallel: independent public reads, and the page waits on all of them.
    const [{ shelves, failed }, providers, faqs, streams, registeredToday] = await Promise.all([
      fetchHomeShelves(keys, pages),
      fetchLobbyProviders(),
      fetchFaqsServer(),
      options.streams ? fetchLiveStreamsServer() : Promise.resolve([]),
      fetchRegisteredTodayCount(),
    ]);

    return {
      props: {
        shelves,
        providers,
        catalogueFailed: failed,
        faqs,
        streams,
        registeredToday,
      },
    };
  };
