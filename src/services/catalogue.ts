import apiService from '@/services/api';
import { translate } from '@/i18n/translate';
import type { ShelfListQuery } from '@/constants/games';
import type { Game, GameListResponse } from '@/types';

const PAGE_SIZE = 50; // the API's own ceiling for `limit`

export const MIN_SEARCH_LENGTH = 2;

export interface CataloguePage {
  games: Game[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * The search box: games matching `term`, best matches first, or the most
 * played while the term is too short. `list` narrows it to a shelf (the
 * search modal's Instant Wins tab), `page` pages through it.
 */
export async function searchCatalogue(
  term: string,
  signal?: AbortSignal,
  { list = {}, page = 1 }: { list?: ShelfListQuery; page?: number } = {}
): Promise<CataloguePage> {
  const params =
    term.length >= MIN_SEARCH_LENGTH
      ? { ...list, search: term, page, limit: PAGE_SIZE }
      : { ...list, sort: 'popular', page, limit: PAGE_SIZE };
  const res = await apiService.get<GameListResponse>('/games', params, { signal });

  if (!res?.success || !res.data?.data) {
    throw new Error(translate('dash.catalogueUnavailable'));
  }

  const pagination = res.data.pagination;
  return {
    games: res.data.data,
    total: pagination?.total ?? res.data.data.length,
    page: pagination?.page ?? page,
    totalPages: pagination?.totalPages ?? 1,
  };
}

/** Case-insensitive match on the two fields a player would type. */
export const gameMatches = (game: Game, query: string): boolean =>
  game.title.toLowerCase().includes(query) || game.provider.toLowerCase().includes(query);

/** Every provider present in the catalogue, alphabetical, de-duplicated. */
export const providersOf = (games: Game[]): string[] =>
  [...new Set(games.map((game) => game.provider).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
