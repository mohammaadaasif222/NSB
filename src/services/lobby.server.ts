import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { DEFAULT_SECTIONS, sectionShelfKey } from '@/constants/games';
import {
  fetchHomeSections,
  fetchHomeShelves,
  fetchLobbyProviders,
  fetchRegisteredTodayCount,
  parsePageParam,
} from '@/services/games.server';
import { fetchFaqsServer } from '@/services/faqs.server';
import type { FaqItem } from '@/services/faqs';
import { fetchLiveStreamsServer } from '@/services/liveStreams.server';
import type { LiveStream } from '@/services/liveStreams';
import type {
  GameShelf,
  HomeSection,
  LobbyProvider,
  LobbyShelfKey,
  SectionPageKey,
} from '@/types';

/** What every lobby-style page (home, casino, live casino) is rendered from. */
export interface LobbyProps {
  shelves: GameShelf[];
  pageShelves: Partial<Record<SectionPageKey, GameShelf[]>>;
  sections: Partial<Record<SectionPageKey, HomeSection[]>>;
  /** The Providers row, curated in the admin console. Empty hides the row. */
  providers: LobbyProvider[];
  catalogueFailed: boolean;
  faqs: FaqItem[];
  streams: LiveStream[];
  registeredToday: number | null;
}

interface LobbyOptions {
  streams?: boolean;
  pages: readonly [SectionPageKey, ...SectionPageKey[]];
}

const shelfKeysOf = (sections: readonly HomeSection[]): LobbyShelfKey[] =>
  sections.flatMap((section) => sectionShelfKey(section) ?? []);

const ownShelfKeysOf = (sections: readonly HomeSection[]): Set<LobbyShelfKey> =>
  new Set(shelfKeysOf(sections.filter((section) => section.own_games)));

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
  (extraKeys: readonly LobbyShelfKey[], options: LobbyOptions): GetServerSideProps<LobbyProps> =>
  async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<LobbyProps>> => {
    const [mainPage, ...otherPages] = options.pages;
    const saved = await Promise.all(options.pages.map((page) => fetchHomeSections(page)));
    const sections = Object.fromEntries(
      options.pages.map((page, index) => [page, saved[index] ?? [...DEFAULT_SECTIONS[page]]])
    ) as Record<SectionPageKey, HomeSection[]>;

    const mainKeys = [...new Set([...shelfKeysOf(sections[mainPage]), ...extraKeys])];
    const mainOwnKeys = ownShelfKeysOf(sections[mainPage]);
    const keysToFetchFor = (page: SectionPageKey): LobbyShelfKey[] => {
      const own = ownShelfKeysOf(sections[page]);
      return shelfKeysOf(sections[page]).filter(
        (key) => own.has(key) || mainOwnKeys.has(key) || !mainKeys.includes(key)
      );
    };
    const pages = Object.fromEntries(
      [...mainKeys, ...otherPages.flatMap(keysToFetchFor)].map((key) => [
        key,
        parsePageParam(context.query[key]),
      ])
    ) as Record<LobbyShelfKey, number>;

    // In parallel: independent public reads, and the page waits on all of them.
    const [main, others, providers, faqs, streams, registeredToday] = await Promise.all([
      fetchHomeShelves(mainKeys, pages, mainPage),
      Promise.all(otherPages.map((page) => fetchHomeShelves(keysToFetchFor(page), pages, page))),
      fetchLobbyProviders(),
      fetchFaqsServer(),
      options.streams ? fetchLiveStreamsServer() : Promise.resolve([]),
      fetchRegisteredTodayCount(),
    ]);

    return {
      props: {
        shelves: main.shelves,
        pageShelves: Object.fromEntries(
          otherPages.map((page, index) => [page, others[index].shelves])
        ),
        sections,
        providers,
        catalogueFailed: main.failed || others.some((result) => result.failed),
        faqs,
        streams,
        registeredToday,
      },
    };
  };
