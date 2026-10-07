import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { useTranslation } from '@/context/I18nContext';
import { fetchFavourites, setFavourite } from '@/services/games';
import type { Game } from '@/types';

interface FavouritesValue {
  /** The player's favourites, newest-hearted first. Null while loading or signed out. */
  games: Game[] | null;
  /** The list could not be loaded. */
  failed: boolean;
  isFavourite: (gameId: string) => boolean;
  /** Hearts or unhearts a game; signed out, it asks the visitor to log in. */
  toggle: (game: Game) => void;
}

const FavouritesContext = createContext<FavouritesValue | null>(null);

/**
 * The signed-in player's favourite games, shared by every heart on every tile
 * and by the Favourites page, so a game hearted in the lobby is already there
 * when the page opens.
 *
 * Loaded once per session. A toggle updates the list at once and saves in the
 * background; if the save fails the change is undone and the player told.
 */
export const FavouritesProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const { openLogin } = useAuthModal();
  const { t } = useTranslation();
  const [games, setGames] = useState<Game[] | null>(null);
  const [failed, setFailed] = useState(false);

  // The latest list, for the toggle's undo — read at failure time rather than
  // captured when the toggle started, so two quick toggles do not clobber.
  const latest = useRef<Game[] | null>(null);
  latest.current = games;

  useEffect(() => {
    setGames(null);
    setFailed(false);
    if (!token) {
      return;
    }
    let active = true;
    fetchFavourites()
      .then((list) => active && setGames(list))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [token]);

  const ids = useMemo(() => new Set(games?.map((game) => game.id)), [games]);

  const isFavourite = useCallback((gameId: string) => ids.has(gameId), [ids]);

  const toggle = useCallback(
    (game: Game) => {
      if (!token) {
        openLogin();
        return;
      }
      const on = !ids.has(game.id);
      const apply = (list: Game[] | null, add: boolean): Game[] => {
        const rest = (list ?? []).filter((g) => g.id !== game.id);
        return add ? [game, ...rest] : rest;
      };

      setGames((list) => apply(list, on));
      setFavourite(game.slug, on).catch(() => {
        setGames(apply(latest.current, !on));
        toast.error(t('favourites.failed'));
      });
    },
    [token, ids, openLogin, t]
  );

  const value = useMemo(
    () => ({ games, failed, isFavourite, toggle }),
    [games, failed, isFavourite, toggle]
  );

  return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>;
};

export const useFavourites = (): FavouritesValue => {
  const context = useContext(FavouritesContext);
  if (!context) {
    throw new Error('useFavourites must be used inside FavouritesProvider');
  }
  return context;
};
