import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchRecentGames } from '@/services/games';
import type { Game } from '@/types';

/**
 * The signed-in player's recently played games, newest first. `games` is
 * null while loading and while signed out.
 */
export const useRecentGames = (): { games: Game[] | null; failed: boolean } => {
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
    fetchRecentGames()
      .then((list) => active && setGames(list))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [token]);

  return { games, failed };
};
