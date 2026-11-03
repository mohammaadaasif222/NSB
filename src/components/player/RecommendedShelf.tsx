import type { FC } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { useRecommendedGames } from '@/hooks/useRecommendedGames';
import ScrollShelf from '@/components/player/ScrollShelf';
import GameRow from '@/components/player/GameRow';
import GameTile from '@/components/player/GameTile';
import type { GameShelf } from '@/types';

interface Props {
  /** The Featured shelf, server-rendered: what a visitor, or a player still loading, sees. */
  featured?: GameShelf;
  title?: string;
}

/**
 * "Recommended for you" on the casino page. A signed-in player gets their own
 * list; everyone else, and a player whose list has not arrived or failed,
 * gets the Featured shelf the server rendered, so the row never jumps in or
 * out.
 */
const RecommendedShelf: FC<Props> = ({ featured, title: customTitle }) => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const { games } = useRecommendedGames();
  const title = customTitle ?? t('lobby.casino.recommended');

  if (token && games && games.length > 0) {
    return (
      <ScrollShelf id="shelf-recommended" title={title}>
        {games.map((game) => (
          <GameTile key={game.id} game={game} surface="recommended" />
        ))}
      </ScrollShelf>
    );
  }

  if (!featured || featured.games.length === 0) return null;

  return (
    <GameRow
      title={title}
      games={featured.games}
      shelfKey="featured"
      page={featured.pagination.page}
      totalPages={featured.pagination.totalPages}
      limit={featured.pagination.limit}
    />
  );
};

export default RecommendedShelf;
