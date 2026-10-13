import { useEffect, useState, type FC } from 'react';
import { useRouter } from 'next/router';
import GameTile from '@/components/player/GameTile';
import Button from '@/components/ui/Button';
import GlassDialog from '@/components/ui/GlassDialog';
import { playHref, shelfFor } from '@/constants/games';
import { useTranslation } from '@/context/I18nContext';
import { fetchShelfPage } from '@/services/games';
import { trackGameOpen } from '@/utils/events';
import type { ApiError, Game } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

/** How many originals the picker loads — the whole shelf, in practice. */
const LIMIT = 30;
const SURFACE = 'select-game';
const TITLE_ID = 'select-game-title';

/**
 * Select Game — opened from the live game's picker on the signed-in lobby. The
 * design's 654px glass dialog: the Rolluck Originals as tiles three across,
 * two rows in view and the rest a scroll away, the chosen one glowing with
 * Play and Play DEMO on it, and Play Game under them.
 *
 * The first game starts chosen, as drawn; Play Game opens the chosen one for
 * real money.
 */
const SelectGameModal: FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [games, setGames] = useState<Game[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    if (!open || games) return undefined;
    let live = true;
    fetchShelfPage(shelfFor('originals').list, 1, LIMIT)
      .then((page) => {
        if (!live) return;
        setGames(page.data);
        setPicked((id) => id ?? page.data[0]?.id ?? null);
      })
      .catch((err: ApiError) => live && setError(err.message));
    return () => {
      live = false;
    };
  }, [open, games]);

  const chosen = games?.find((g) => g.id === picked);

  const play = (): void => {
    if (!chosen) return;
    trackGameOpen(chosen.slug, SURFACE);
    onClose();
    void router.push(playHref(chosen.slug));
  };

  return (
    <GlassDialog
      open={open}
      onClose={onClose}
      titleId={TITLE_ID}
      title={t('lobby.selectGame.title')}
      // Drawn straight over the page: nothing dims or blurs behind it.
      backdrop="none"
      // The design's 20 / 26 insets, less the rim's pixel.
      className="max-w-[654px] px-3 pb-4 pt-3 sm:px-[19px] sm:pb-[25px] sm:pt-[19px]"
    >
      {/* Room beside and above the grid for the chosen tile's glow, which
          the scroller would otherwise clip; on desktop exactly two rows
          (2 × 261 + 10) in view, the third a scroll away. */}
      <div className="no-scrollbar -mx-3 mt-[10px] max-h-[62vh] overflow-y-auto p-3 sm:-mt-[2px] sm:max-h-[544px]">
        {error ? (
          <p className="py-16 text-center text-[14px] text-[#9da2b4]">{error}</p>
        ) : (
          <div className="grid grid-cols-3 gap-[10px]">
            {games
              ? games.map((game) => (
                  <GameTile
                    key={game.id}
                    game={game}
                    surface={SURFACE}
                    selected={game.id === picked}
                    onSelect={() => setPicked(game.id)}
                  />
                ))
              : Array.from({ length: 6 }, (_, i) => (
                  <div
                    key={i}
                    className="rl-card-shape aspect-[198/261] animate-pulse bg-white/[0.06]"
                  />
                ))}
          </div>
        )}
      </div>

      <Button fullWidth onClick={play} disabled={!chosen} className="mt-6 !font-semibold">
        {t('lobby.selectGame.play')}
      </Button>
    </GlassDialog>
  );
};

export default SelectGameModal;
