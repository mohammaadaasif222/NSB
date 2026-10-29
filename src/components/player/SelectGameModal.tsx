import { useEffect, useState, type FC } from 'react';
import { useRouter } from 'next/router';
import GameTile from '@/components/player/GameTile';
import Button from '@/components/ui/Button';
import GlassDialog from '@/components/ui/GlassDialog';
import { playHref, shelfFor } from '@/constants/games';
import { useTranslation } from '@/context/I18nContext';
import { fetchShelfPage } from '@/services/games';
import { trackGameOpen } from '@/utils/events';
import type { ApiError, Game, GameMode } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  /**
   * When set, "Play Game" (bottom CTA), the tile's gold Play button, and
   * Play DEMO all call this with the chosen game and mode instead of
   * navigating to /play/[slug]. Used by the lobby's featured game card to
   * swap its own iframe in place rather than leaving the home page.
   */
  onPlay?: (game: Game, mode: GameMode) => void;
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
 *
 * A phone draws it as a sheet from the screen's foot to 140 under its top,
 * over the tab bar: 16 in, the 122px tiles 11 apart and 13 between rows, the
 * grid filling what Play Game (28 off the foot) leaves.
 */
const SelectGameModal: FC<Props> = ({ open, onClose, onPlay }) => {
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
    if (onPlay) {
      onPlay(chosen, 'REAL');
      return;
    }
    void router.push(playHref(chosen.slug));
  };

  // The tile's own Play / Play DEMO buttons on the picked card. These bubble
  // up the same way as the bottom CTA so the lobby's featured card can host
  // whichever mode the operator clicks — no navigation.
  const playInline = onPlay
    ? (game: Game, mode: GameMode): void => {
        onClose();
        onPlay(game, mode);
      }
    : undefined;

  return (
    <GlassDialog
      open={open}
      onClose={onClose}
      titleId={TITLE_ID}
      title={t('lobby.selectGame.title')}
      // Drawn straight over the page: nothing dims or blurs behind it.
      backdrop="none"
      phoneSheet
      titleClassName="max-sm:!text-[20px]"
      // The design's 20 / 26 insets, less the rim's pixel; and the heavier
      // rim this dialog is drawn with (see `rl-dialog-glass`).
      className="max-w-[654px] px-[15px] pb-[27px] pt-[19px] [--dialog-rim-width:1.5px] [--dialog-rim:rgba(255,255,255,0.38)] max-sm:rounded-t-[34px] sm:px-[19px] sm:pb-[25px] sm:pt-[19px]"
    >
      {/* Room round the grid for the chosen tile's glow, which the scroller
          would otherwise clip. The glow runs ~24px out, so the scroller reaches
          out to the card's rim at the sides and 24px past the grid above and
          below, with negative margins holding the grid and the button exactly
          where the design puts them. Too little room and the glow
          is cut off flat, which reads as a square halo round a notched card.
          On desktop exactly two rows (2 × 261 + 10) in view, the third a
          scroll away. */}
      <div className="no-scrollbar -mx-[15px] -mb-3 -mt-2 min-h-0 flex-1 overflow-y-auto px-[15px] py-6 sm:-mx-[19px] sm:-mt-[14px] sm:max-h-[568px] sm:flex-none sm:px-[19px]">
        {error ? (
          <p className="py-16 text-center text-[14px] text-[#9da2b4]">{error}</p>
        ) : (
          <div className="grid grid-cols-3 gap-x-[11px] gap-y-[13px] sm:gap-[10px]">
            {games
              ? games.map((game) => (
                  <GameTile
                    key={game.id}
                    game={game}
                    surface={SURFACE}
                    selected={game.id === picked}
                    onSelect={() => setPicked(game.id)}
                    onPlayInline={playInline}
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

      <Button
        fullWidth
        onClick={play}
        disabled={!chosen}
        className="mt-6 !font-semibold max-sm:!h-14"
      >
        {t('lobby.selectGame.play')}
      </Button>
    </GlassDialog>
  );
};

export default SelectGameModal;
