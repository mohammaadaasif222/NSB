import type { FC } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { useRecentGames } from '@/hooks/useRecentGames';
import ScrollShelf from '@/components/player/ScrollShelf';
import GameTile from '@/components/player/GameTile';

/**
 * The games the player launched last, newest first, as a casino shelf; "View
 * All" opens the Recent page. Like the favourites shelf, nothing renders for a
 * visitor, while loading, or when the player has not played yet.
 */
const RecentShelf: FC = () => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const { games } = useRecentGames();

  if (!token || !games || games.length === 0) return null;

  return (
    <ScrollShelf title={t('lobby.casino.lastPlayed')} href="/recents">
      {games.map((game) => (
        <GameTile key={game.id} game={game} surface="recents" />
      ))}
    </ScrollShelf>
  );
};

export default RecentShelf;
