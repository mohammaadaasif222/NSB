import type { FC, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Game } from '@/types';
import { gameHref } from '@/constants/games';
import { useTranslation } from '@/context/I18nContext';
import { useGameImpression } from '@/hooks/useGameImpression';
import { trackGameOpen } from '@/utils/events';
import FavouriteHeart from '@/components/player/FavouriteHeart';
import { useFavourites } from '@/context/FavouritesContext';
import personIcon from '@/assets/lobby/person.svg';

interface Props {
  game: Game;
  /**
   * Fixed-width tile for a horizontally scrolling shelf. When false the tile
   * fills its parent (grid cell).
   */
  shelf?: boolean;
  /**
   * Which shelf or page this tile was rendered in, recorded alongside the
   * impression and the open.
   *
   * Without it "this game was shown 4,000 times" cannot be read: a game on
   * every shelf and a game on one busy shelf produce the same number. Optional
   * so a tile rendered outside a known surface still tracks, just unattributed.
   */
  surface?: string;
}

/**
 * The "N playing" figure on a tile.
 *
 * There is no concurrency feed, so this is derived from the game's own id
 * rather than fetched — illustrative chrome, like the winners strip and the
 * hero's totals. It is a pure function of the id on purpose: a random number
 * would differ between the server render and hydration and trip React's
 * mismatch warning, and would jitter on every navigation.
 */
const playersOn = (id: string): number => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return 120 + (hash % 3200);
};

/*
 * Every measurement below is the design's 198px-wide card expressed in `cqw`
 * (1cqw = 1.98px at that width), so the whole tile — badge, pills, heart —
 * scales as one piece from the phone shelf to the desktop's 198px. Text sizes
 * keep a floor so they stay legible on the smallest tiles.
 *
 * `cqw` resolves against the nearest ancestor with a `container-type`, which
 * is the `group` div below.
 */

/** A frosted pill along the tile's foot: 19px tall, 10px text at 198px. */
const FootPill: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="inline-flex h-[9.6cqw] items-center gap-[1.52cqw] rounded-full border border-white/30 bg-white/20 px-[4.55cqw] text-[max(7px,5.05cqw)] leading-none tabular-nums text-[#f0f1f5] shadow-[0_0_15px_rgba(0,0,0,0.36)]">
    {children}
  </span>
);

/**
 * One game: the artwork in the design's notched card (`rl-card-shape` — 23px
 * corners and the step bitten out of the top-right), a "New" badge, the
 * players and RTP pills along its foot, and a favourite heart sitting in the
 * notch. Without the notch the heart lands on the artwork and is lost in it,
 * which is why the shape is not a plain rounded rectangle.
 *
 * The tile fills whatever width its parent gives it — a shelf track or a grid
 * cell — and keeps the design's 198:261 shape.
 *
 * The catalogue's artwork already carries the game's name and studio, so
 * neither is drawn again; the title rides on the image's `alt` and the link's
 * tooltip.
 */
const GameTile: FC<Props> = ({ game, shelf = false, surface }) => {
  const { t } = useTranslation();
  const { isFavourite, toggle } = useFavourites();

  const impressionRef = useGameImpression(game.slug, surface);

  return (
    <div ref={impressionRef} className={shelf ? 'w-[112px] flex-shrink-0 sm:w-[130px]' : 'w-full'}>
      <div className="group relative [container-type:inline-size]">
        <Link
          href={gameHref(game.slug)}
          // Recorded on click rather than on the game page's own mount: this is
          // the only point that knows WHICH shelf the player came from, and
          // that is half of what makes the impression figure readable.
          onClick={() => trackGameOpen(game.slug, surface)}
          title={`${game.title} — ${game.provider} · ${t('game.rtp')} ${game.rtp}`}
          className="rl-card-shape block text-left focus:outline-none focus-visible:brightness-110"
        >
          <div className="relative aspect-[198/261] overflow-hidden bg-[#333333]">
            <Image
              src={game.image_url || '/images/placeholder.png'}
              alt={game.title}
              fill
              sizes={
                shelf
                  ? '(max-width: 640px) 112px, 130px'
                  : '(max-width: 640px) 33vw, (max-width: 1280px) 20vw, 200px'
              }
              className="object-cover transition-transform duration-300 group-hover:scale-[1.06]"
            />

            {/* The design's foot shade: clear to 66% black over the last 92px. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[35.25%] bg-gradient-to-b from-transparent to-black/[0.66]"
            />

            {game.is_new && (
              <span className="absolute left-[5.05cqw] top-[5.05cqw] flex h-[12.12cqw] items-center rounded-full bg-[#f9d028] px-[5.05cqw] text-[max(8px,6.06cqw)] font-medium leading-none text-[#07080a]">
                {t('game.new')}
              </span>
            )}

            <span className="absolute inset-x-[5.05cqw] bottom-[5.05cqw] flex items-center justify-between gap-1">
              <FootPill>
                <img src={personIcon.src} alt="" className="h-[6.06cqw] w-[6.06cqw]" />
                {playersOn(game.id)}
              </FootPill>
              <FootPill>
                {t('game.rtp')}: {game.rtp}
              </FootPill>
            </span>
          </div>
        </Link>

        {/* Outside the Link so it is its own control rather than a button
            nested in an anchor. The design's 32px heart box, in the notch, hung
            a pixel past the card's right edge. */}
        <FavouriteHeart
          liked={isFavourite(game.id)}
          onToggle={() => toggle(game)}
          label={game.title}
          className="-right-[0.5cqw] top-0 h-[16.16cqw] w-[16.16cqw]"
        />
      </div>
    </div>
  );
};

export default GameTile;
