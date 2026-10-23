import apiService from '@/services/api';
import { translate } from '@/i18n/translate';
import type { Game, GameListResponse } from '@/types';

const PAGE_SIZE = 50; // the API's own ceiling for `limit`

export const MIN_SEARCH_LENGTH = 2;

export interface CataloguePage {
  games: Game[];
  total: number;
}

export async function searchCatalogue(term: string, signal?: AbortSignal): Promise<CataloguePage> {
  const params =
    term.length >= MIN_SEARCH_LENGTH
      ? { search: term, limit: PAGE_SIZE }
      : { sort: 'popular', limit: PAGE_SIZE };
  const res = await apiService.get<GameListResponse>('/games', params, { signal });

  if (!res?.success || !res.data?.data) {
    throw new Error(translate('dash.catalogueUnavailable'));
  }

  return { games: res.data.data, total: res.data.pagination?.total ?? res.data.data.length };
}

/** Case-insensitive match on the two fields a player would type. */
export const gameMatches = (game: Game, query: string): boolean =>
  game.title.toLowerCase().includes(query) || game.provider.toLowerCase().includes(query);

/** Every provider present in the catalogue, alphabetical, de-duplicated. */
export const providersOf = (games: Game[]): string[] =>
  [...new Set(games.map((game) => game.provider).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
