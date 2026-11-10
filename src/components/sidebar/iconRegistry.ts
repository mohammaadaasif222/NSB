import type { FC } from 'react';
import type { StaticImageData } from 'next/image';
import { CoinIcon, GiftIcon, HandshakeIcon, type IconProps } from '@/components/icons';
import oathIcon from '@/assets/lobby/rail/nav-oath.svg';
import recentIcon from '@/assets/lobby/rail/nav-recent.svg';
import favouritesIcon from '@/assets/lobby/rail/nav-favourites.svg';
import originalsIcon from '@/assets/lobby/rail/nav-originals.svg';
import vipIcon from '@/assets/lobby/rail/nav-vip.svg';
import tournamentsIcon from '@/assets/lobby/rail/nav-tournaments.svg';
import promotionIcon from '@/assets/lobby/rail/nav-promotion.svg';
import bonusesIcon from '@/assets/lobby/rail/nav-bonuses.svg';
import themeIcon from '@/assets/lobby/rail/nav-theme.svg';
import betsIcon from '@/assets/lobby/rail/nav-bets.svg';
import casinoIcon from '@/assets/lobby/rail/tab-casino.svg';
import sportsIcon from '@/assets/lobby/rail/tab-sports.svg';
import supportIcon from '@/assets/lobby/rail/tab-chat.svg';
import suggestionIcon from '@/assets/lobby/rail/rail-suggestion.svg';
import liveIcon from '@/assets/lobby/player/chip-live.svg';
import plinkoIcon from '@/assets/lobby/rail/rail-originals-plinko.svg';
import originalsBlackjackIcon from '@/assets/lobby/rail/rail-originals-blackjack.svg';
import kenoIcon from '@/assets/lobby/rail/rail-originals-keno.svg';
import minesIcon from '@/assets/lobby/rail/rail-originals-mines.svg';
import limboIcon from '@/assets/lobby/rail/rail-originals-limbo.svg';
import diceIcon from '@/assets/lobby/rail/rail-originals-dice.svg';
import crashIcon from '@/assets/lobby/rail/rail-originals-crash.svg';
import hiloIcon from '@/assets/lobby/rail/rail-originals-hilo.svg';
import originalsBaccaratIcon from '@/assets/lobby/rail/rail-originals-baccarat.svg';
import wheelIcon from '@/assets/lobby/rail/rail-originals-wheel.svg';
import allOriginalsIcon from '@/assets/lobby/rail/rail-originals-all.svg';
import dropsWinsIcon from '@/assets/lobby/rail/rail-casino-drops-wins.svg';
import popularIcon from '@/assets/lobby/rail/rail-casino-popular.svg';
import slotsIcon from '@/assets/lobby/rail/rail-casino-slots.svg';
import latestIcon from '@/assets/lobby/rail/rail-casino-latest.svg';
import highRtpIcon from '@/assets/lobby/rail/rail-casino-high-rtp.svg';
import bonusBuysIcon from '@/assets/lobby/rail/rail-casino-bonus-buys.svg';
import holdWinIcon from '@/assets/lobby/rail/rail-casino-hold-win.svg';
import liveLobbyIcon from '@/assets/lobby/rail/rail-live-lobby.svg';
import liveBlackjackIcon from '@/assets/lobby/rail/rail-live-blackjack.svg';
import rouletteIcon from '@/assets/lobby/rail/rail-live-roulette.svg';
import liveBaccaratIcon from '@/assets/lobby/rail/rail-live-baccarat.svg';
import gameShowsIcon from '@/assets/lobby/rail/rail-live-game-shows.svg';
import chipLobbyIcon from '@/assets/lobby/player/chip-lobby.svg';
import chipOriginalsIcon from '@/assets/lobby/player/chip-originals.svg';
import chipSlotsIcon from '@/assets/lobby/player/chip-slots.svg';
import chipRouletteIcon from '@/assets/lobby/player/chip-roulette.svg';
import chipBaccaratIcon from '@/assets/lobby/player/chip-baccarat.svg';
import chipGameShowsIcon from '@/assets/lobby/player/chip-gameshows.svg';
import chipNewArrivalsIcon from '@/assets/lobby/player/chip-newarrivals.svg';
import chipBonusBuysIcon from '@/assets/lobby/player/chip-bonusbuys.svg';

/**
 * How a side menu icon is drawn.
 *  - `glyph`: one of the design's single-colour SVGs, masked so it takes the
 *    row's text colour (see Glyph) — the rail has no separate hover asset.
 *  - `line`: a stroke icon component, for rows the design never drew a glyph for.
 *  - `image`: an operator's uploaded icon, drawn as-is in its own colours.
 */
export type SidebarIcon =
  | { kind: 'glyph'; src: string }
  | { kind: 'line'; Icon: FC<IconProps> }
  | { kind: 'image'; src: string };

const glyph = (asset: StaticImageData): SidebarIcon => ({ kind: 'glyph', src: asset.src });

/**
 * The preset icons an operator can pick in CRM -> Sidebar menus. The keys must
 * match SIDEBAR_ICON_KEYS in rlk-admin/src/services/sidebarMenus.api.ts.
 */
export const SIDEBAR_ICONS: Record<string, SidebarIcon> = {
  oath: glyph(oathIcon),
  recent: glyph(recentIcon),
  favourites: glyph(favouritesIcon),
  originals: glyph(originalsIcon),
  casino: glyph(casinoIcon),
  live: glyph(liveIcon),
  sports: glyph(sportsIcon),
  vip: glyph(vipIcon),
  tournaments: glyph(tournamentsIcon),
  promotion: glyph(promotionIcon),
  bonuses: glyph(bonusesIcon),
  rewards: { kind: 'line', Icon: CoinIcon },
  referral: { kind: 'line', Icon: HandshakeIcon },
  gift: { kind: 'line', Icon: GiftIcon },
  support: glyph(supportIcon),
  suggestion: glyph(suggestionIcon),
  theme: glyph(themeIcon),
  bets: glyph(betsIcon),
  'originals-plinko': glyph(plinkoIcon),
  'originals-blackjack': glyph(originalsBlackjackIcon),
  'originals-keno': glyph(kenoIcon),
  'originals-mines': glyph(minesIcon),
  'originals-limbo': glyph(limboIcon),
  'originals-dice': glyph(diceIcon),
  'originals-crash': glyph(crashIcon),
  'originals-hilo': glyph(hiloIcon),
  'originals-baccarat': glyph(originalsBaccaratIcon),
  'originals-wheel': glyph(wheelIcon),
  'originals-all': glyph(allOriginalsIcon),
  'casino-popular': glyph(popularIcon),
  'casino-drops-wins': glyph(dropsWinsIcon),
  'casino-slots': glyph(slotsIcon),
  'casino-latest': glyph(latestIcon),
  'casino-high-rtp': glyph(highRtpIcon),
  'casino-bonus-buys': glyph(bonusBuysIcon),
  'casino-hold-win': glyph(holdWinIcon),
  'live-lobby': glyph(liveLobbyIcon),
  'live-blackjack': glyph(liveBlackjackIcon),
  'live-roulette': glyph(rouletteIcon),
  'live-baccarat': glyph(liveBaccaratIcon),
  'live-game-shows': glyph(gameShowsIcon),
  // The lobby chip bar's own glyphs (its Live chip is `live` above).
  'chip-lobby': glyph(chipLobbyIcon),
  'chip-originals': glyph(chipOriginalsIcon),
  'chip-slots': glyph(chipSlotsIcon),
  'chip-roulette': glyph(chipRouletteIcon),
  'chip-baccarat': glyph(chipBaccaratIcon),
  'chip-gameshows': glyph(chipGameShowsIcon),
  'chip-newarrivals': glyph(chipNewArrivalsIcon),
  'chip-bonusbuys': glyph(chipBonusBuysIcon),
};

/** Drawn for a top-level row whose key is unknown (e.g. retired since it was picked). */
export const DEFAULT_SIDEBAR_ICON_KEY = 'casino';

/**
 * The icon for a menu entry: an uploaded image wins over the preset; no key
 * means no icon (a group's rows keep an empty column); an unknown key falls
 * back to the default.
 */
export const resolveSidebarIcon = (
  key: string | null | undefined,
  url?: string | null
): SidebarIcon | undefined => {
  if (url) return { kind: 'image', src: url };
  if (!key) return undefined;
  return SIDEBAR_ICONS[key] ?? SIDEBAR_ICONS[DEFAULT_SIDEBAR_ICON_KEY];
};
