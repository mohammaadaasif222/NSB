/**
 * Slug → native Originals component map.
 *
 * The /game/[slug] page uses this to decide whether a game is one of our
 * in-house Originals (and if so, which React component renders it). When
 * the slug is NOT in this map the game page falls back to the standard
 * marketing + external launcher flow for aggregator games.
 *
 * All entries are dynamic imports with `ssr: false` — every Originals
 * component pulls in @mui/material (emotion), socket.io-client, and
 * other browser-only deps that cannot be SSRed.
 */
import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';

const Loading = () => (
  <div className="min-h-[60vh] grid place-items-center text-sm text-white/70">
    Loading game…
  </div>
);

/**
 * The provider label the FE sees for any native Originals row.
 *
 * The backend stores `"Rolluck Originals"` in the DB but its player-facing
 * DTO (`gameService.toDto`) collapses that + Tequity's self-labels down to
 * the operator brand `"Rolluck"` before the row ever reaches a player.
 * So the FE must compare against the display value, not the DB value:
 *
 *   DB column   game.provider = "Rolluck Originals"
 *   API payload game.provider = "Rolluck"            ← this file matches on this
 *
 * The admin console sees the raw DB value (see toAdminDto on the backend).
 */
export const ORIGINALS_PROVIDER_NAME = 'Rolluck';

/**
 * Slug values the /game/[slug] page recognises as native Originals. Keep
 * in sync with the `games` table seed and with each dynamic import below —
 * each slug here needs a matching entry below OR a graceful fallback.
 */
export const ORIGINALS_SLUGS = [
  'mines',
  'dice',
  'blackjack',
  'plinko',
  'crash',
  'hilo',
  'keno',
  'roulette',
] as const;

export type OriginalsSlug = (typeof ORIGINALS_SLUGS)[number];

export const isOriginalsSlug = (slug: string): slug is OriginalsSlug =>
  (ORIGINALS_SLUGS as readonly string[]).includes(slug);

const Mines = dynamic(() => import('@/components/originals/MineGame'), {
  ssr: false,
  loading: Loading,
});

const DiceOriginals = dynamic(() => import('@/components/originals/DiceGame'), {
  ssr: false,
  loading: Loading,
});

const Blackjack = dynamic(() => import('@/components/originals/CardGame'), {
  ssr: false,
  loading: Loading,
});

/**
 * Returns the React component that renders the given slug's native game,
 * or null if the slug is in the catalogue but no component has been ported
 * yet (lobby-only placeholder). The caller falls back to the normal
 * marketing card in that case.
 */
export const getOriginalsComponent = (
  slug: string
): ComponentType | null => {
  switch (slug) {
    case 'mines':
      return Mines;
    case 'dice':
      return DiceOriginals;
    case 'blackjack':
      return Blackjack;
    // Other Originals games are catalogued in the DB and listed above,
    // but the component ports are not here yet. Returning null makes
    // /game/<slug> render the marketing card as a graceful placeholder
    // until the port lands.
    default:
      return null;
  }
};
