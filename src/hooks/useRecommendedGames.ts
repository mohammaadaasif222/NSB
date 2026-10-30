import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchRecommendedGames } from '@/services/games';
import type { Game } from '@/types';

/**
 * The games recommended to the signed-in player. `games` is null while
 * loading and while signed out.
 */
export const useRecommendedGames = (): { games: Game[] | null; failed: boolean } => {
  const { token } = useAuth();
  const [games, setGames] = useState<Game[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setGames(null);
    setFailed(false);
    if (!token) {
      return;
    }
    let active = true;
    fetchRecommendedGames()
      .then((list) => active && setGames(list))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [token]);

  return { games, failed };
};
