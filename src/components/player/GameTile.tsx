import { useState, type FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Game } from '@/types';
import { gameHref } from '@/constants/games';
import { useTranslation } from '@/context/I18nContext';
import { useGameImpression } from '@/hooks/useGameImpression';
import { trackGameOpen } from '@/utils/events';
import { HeartIcon, UserIcon } from '@/components/icons';

interface Props {
  game: Game;
  /**
   * `shelf` is a fixed-width tile for a horizontal row; `grid` fills its
   * column and keeps the artwork at a 3:4 ratio.
   */
  layout?: 'shelf' | 'grid';
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

/**
 * One game: artwork, the badges that sit over it, and a favourite toggle.
 *
 * The design drops the caption under the tile — the catalogue's artwork
 * already carries the game's name and studio — so the title rides on the
 * image's `alt` and the link's tooltip instead, which is also where the RTP
 * now lives.
 *
 * The heart is deliberately local-only. There is no favourites endpoint yet
 * (the rail's Favourites entry is a placeholder page for the same reason), so
 * it fills in for the session and says so on hover rather than pretending the
 * choice was saved.
 */
const GameTile: FC<Props> = ({ game, layout = 'grid', surface }) => {
  const { t } = useTranslation();
  const [liked, setLiked] = useState(false);
  const shelf = layout === 'shelf';

  const players = playersOn(game.id);

  const impressionRef = useGameImpression(game.slug, surface);

  return (
    <div ref={impressionRef} className={shelf ? 'w-[112px] flex-shrink-0 sm:w-[130px]' : 'w-full'}>
      <div className="group relative">
        <Link
          href={gameHref(game.slug)}
          // Recorded on click rather than on the game page's own mount: this is
          // the only point that knows WHICH shelf the player came from, and
          // that is half of what makes the impression figure readable.
          onClick={() => trackGameOpen(game.slug, surface)}
          title={`${game.title} — ${game.provider} · ${t('game.rtp')} ${game.rtp}`}
          className="block rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          <div
            className={`relative overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.03] transition-colors group-hover:border-white/20 ${
              shelf ? 'h-[148px] sm:h-[172px]' : 'aspect-[3/4]'
            }`}
          >
            {game.image_url ? (
              <Image
                src={game.image_url}
                alt={game.title}
                fill
                sizes={
                  shelf
                    ? '(max-width: 640px) 112px, 130px'
                    : '(max-width: 640px) 33vw, (max-width: 1280px) 20vw, 200px'
                }
                className="object-cover transition-transform duration-300 group-hover:scale-[1.06]"
              />
            ) : (
              // Synced games can arrive without artwork; show the title rather
              // than an empty grey box.
              <span className="absolute inset-0 flex items-end bg-gradient-to-br from-slate-700 to-slate-900 p-2 text-[11px] font-bold leading-tight text-slate-200">
                {game.title}
              </span>
            )}

            {/* A scrim so the badges stay legible over pale artwork. */}
            <span
              className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/60 to-transparent"
              aria-hidden="true"
            />
          </div>
        </Link>

        {/* Badges live outside the Link so the heart is its own control rather
            than a button nested in an anchor. */}
        <div className="pointer-events-none absolute inset-x-1.5 top-1.5 flex items-start justify-between gap-1">
          <span className="flex min-w-0 flex-wrap items-center gap-1">
            {game.is_new && (
              <span className="rounded-[5px] bg-white px-1.5 py-[3px] text-[8.5px] font-bold uppercase leading-none tracking-wide text-[#14161b]">
                {t('game.new')}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-[5px] bg-black/55 px-1.5 py-[3px] text-[8.5px] font-semibold leading-none tabular-nums text-white/85 backdrop-blur-sm">
              <UserIcon size={8} />
              {players.toLocaleString('en-US')}
            </span>
          </span>

          <button
            type="button"
            onClick={() => setLiked((v) => !v)}
            aria-pressed={liked}
            title={`${t('nav.favourites')} — ${t('common.soon')}`}
            aria-label={`${game.title} — ${t('nav.favourites')}`}
            className={`pointer-events-auto inline-flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-[6px] transition-colors ${
              liked ? 'text-[#ef4462]' : 'text-white/70 hover:text-white'
            }`}
          >
            <HeartIcon size={13} className={liked ? 'fill-current' : undefined} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameTile;
