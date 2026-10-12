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
import {
  fetchFavouriteProviders,
  fetchFavourites,
  setFavourite,
  setProviderFavourite,
} from '@/services/games';
import type { Game, LobbyProvider } from '@/types';

interface FavouritesValue {
  /** The player's favourites, newest-hearted first. Null while loading or signed out. */
  games: Game[] | null;
  /** The list could not be loaded. */
  failed: boolean;
  isFavourite: (gameId: string) => boolean;
  /** Hearts or unhearts a game; signed out, it asks the visitor to log in. */
  toggle: (game: Game) => void;
  /** The player's favourite studios, newest-hearted first. */
  providers: LobbyProvider[] | null;
  isFavouriteProvider: (providerId: string) => boolean;
  toggleProvider: (provider: LobbyProvider) => void;
}

const FavouritesContext = createContext<FavouritesValue | null>(null);

/** Anything hearted: identified by `id`, saved by `slug`. */
interface Favouritable {
  id: string;
  slug: string;
}

interface FavouriteList<T> {
  items: T[] | null;
  failed: boolean;
  has: (id: string) => boolean;
  toggle: (item: T) => void;
}

/**
 * One hearted list. Loaded once per session; a toggle updates it at once and
 * saves in the background, and if the save fails the change is undone and the
 * player told.
 *
 * `load` and `save` must be stable — module-level service functions, not
 * closures made during render, or the list reloads on every one.
 */
const useFavouriteList = <T extends Favouritable>(
  load: () => Promise<T[]>,
  save: (slug: string, favourite: boolean) => Promise<void>
): FavouriteList<T> => {
  const { token } = useAuth();
  const { openLogin } = useAuthModal();
  const { t } = useTranslation();
  const [items, setItems] = useState<T[] | null>(null);
  const [failed, setFailed] = useState(false);

  // The latest list, for the toggle's undo — read at failure time rather than
  // captured when the toggle started, so two quick toggles do not clobber.
  const latest = useRef<T[] | null>(null);
  latest.current = items;

  useEffect(() => {
    setItems(null);
    setFailed(false);
    if (!token) {
      return;
    }
    let active = true;
    load()
      .then((list) => active && setItems(list))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [token, load]);

  const ids = useMemo(() => new Set(items?.map((item) => item.id)), [items]);

  const has = useCallback((id: string) => ids.has(id), [ids]);

  const toggle = useCallback(
    (item: T) => {
      if (!token) {
        openLogin();
        return;
      }
      const on = !ids.has(item.id);
      const apply = (list: T[] | null, add: boolean): T[] => {
        const rest = (list ?? []).filter((entry) => entry.id !== item.id);
        return add ? [item, ...rest] : rest;
      };

      setItems((list) => apply(list, on));
      save(item.slug, on).catch(() => {
        setItems(apply(latest.current, !on));
        toast.error(t('favourites.failed'));
      });
    },
    [token, ids, openLogin, save, t]
  );

  return useMemo(() => ({ items, failed, has, toggle }), [items, failed, has, toggle]);
};

/**
 * The signed-in player's favourites — games and studios — shared by every
 * heart in the lobby and by the Favourites page, so a game hearted on a shelf
 * is already there when the page opens.
 */
export const FavouritesProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const games = useFavouriteList<Game>(fetchFavourites, setFavourite);
  const providers = useFavouriteList<LobbyProvider>(fetchFavouriteProviders, setProviderFavourite);

  const value = useMemo(
    () => ({
      games: games.items,
      failed: games.failed,
      isFavourite: games.has,
      toggle: games.toggle,
      providers: providers.items,
      isFavouriteProvider: providers.has,
      toggleProvider: providers.toggle,
    }),
    [games, providers]
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
