import apiService from '@/services/api';
import { translate } from '@/i18n/translate';
import type { Game, GameListResponse } from '@/types';

/**
 * The whole catalogue, pulled client-side.
 *
 * The public list endpoint takes `page`, `limit` and `category` but no search
 * term — matching lives on the admin route, which a player has no permission to
 * call. Anything that needs to search, sort or filter across the catalogue
 * therefore has to hold it in memory and do the work in the browser. That is
 * fine at this catalogue's size and makes typing instant; once it outgrows
 * PAGE_CAP the fix is a public search endpoint, not a bigger cap here.
 */
const PAGE_SIZE = 50; // the API's own ceiling for `limit`
const PAGE_CAP = 6; // at most 300 games held in memory

export async function fetchCatalogue(): Promise<Game[]> {
  const first = await apiService.get<GameListResponse>('/games', { page: 1, limit: PAGE_SIZE });

  if (!first?.success || !first.data?.data) {
    throw new Error(translate('dash.catalogueUnavailable'));
  }

  const totalPages = Math.min(first.data.pagination?.totalPages ?? 1, PAGE_CAP);
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) =>
      apiService.get<GameListResponse>('/games', { page: i + 2, limit: PAGE_SIZE })
    )
  );

  return [
    ...first.data.data,
    ...rest.flatMap((page) => (page?.success ? (page.data?.data ?? []) : [])),
  ];
}

/** Case-insensitive match on the two fields a player would type. */
export const gameMatches = (game: Game, query: string): boolean =>
  game.title.toLowerCase().includes(query) || game.provider.toLowerCase().includes(query);

/** Every provider present in the catalogue, alphabetical, de-duplicated. */
export const providersOf = (games: Game[]): string[] =>
  [...new Set(games.map((game) => game.provider).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
