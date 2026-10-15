import type { FC } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { useFavourites } from '@/context/FavouritesContext';
import ScrollShelf from '@/components/player/ScrollShelf';
import GameTile from '@/components/player/GameTile';

/**
 * The player's favourite games as a shelf, in the casino page's rhythm — the
 * same slider and tiles as the catalogue's shelves, "View All" opening the
 * Favourites page.
 *
 * The list is the player's own (FavouritesContext, already loaded for the
 * hearts), newest-hearted first. Nothing renders for a visitor, while the list
 * is loading, or when it is empty: an empty shelf on a catalogue page is noise,
 * and hearting a game anywhere puts the shelf straight back.
 */
const FavouritesShelf: FC = () => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const { games } = useFavourites();

  if (!token || !games || games.length === 0) return null;

  return (
    <ScrollShelf title={t('nav.favourites')} href="/favourites">
      {games.map((game) => (
        <GameTile key={game.id} game={game} surface="favourites" />
      ))}
    </ScrollShelf>
  );
};

export default FavouritesShelf;
