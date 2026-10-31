/**
 * Thin shim so ported Win-Win Originals code can call `toggleFavoriteService`
 * without crashing. rlk-frontend has a dedicated FavouritesContext — once the
 * originals wire into that, this stub can be deleted.
 */
export interface ToggleFavoriteResult {
  favorites: string[];
}

export const toggleFavoriteService = async (
  _gameId: string,
  _state: boolean
): Promise<ToggleFavoriteResult> => {
  /* TODO: wire to FavouritesContext / backend favorites endpoint */
  return { favorites: [] };
};
