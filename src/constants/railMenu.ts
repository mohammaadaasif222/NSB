import type { StaticImageData } from 'next/image';
import type { TranslationKey } from '@/i18n/locales';
import {
  ALL_GAMES_PATH,
  DROPS_WINS_PATH,
  LIVE_CASINO_HREF,
  categoryHref,
  gameHref,
} from '@/constants/games';
import { sportHref } from '@/constants/sportsbook';
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

/** A row inside an expandable rail group. No `href`: drawn as "Soon". */
export interface RailSubItem {
  labelKey: TranslationKey;
  href?: string;
  /** The design's 24px line icon; rows the design gave none keep the column empty. */
  icon?: StaticImageData;
}

export type RailGroupId = 'originals' | 'casino' | 'live' | 'sports';

export interface RailGroup {
  id: RailGroupId;
  labelKey: TranslationKey;
  /** Where the icon goes on the collapsed rail, which has no room for the list. */
  href: string;
  items: RailSubItem[];
}

/** The side menu's expandable groups, from the Casino Manager sheet's "Final" column. */
export const RAIL_GROUPS: Record<RailGroupId, RailGroup> = {
  originals: {
    id: 'originals',
    labelKey: 'nav.originals',
    href: categoryHref('originals'),
    items: [
      { labelKey: 'lobby.rail.shootOut' },
      // Tequity's originals, by their catalogue slugs.
      { labelKey: 'lobby.rail.plinko', href: gameHref('plinko-tequity'), icon: plinkoIcon },
      {
        labelKey: 'lobby.chips.blackjack',
        href: gameHref('blackjack-tequity'),
        icon: originalsBlackjackIcon,
      },
      { labelKey: 'lobby.rail.keno', href: gameHref('keno-tequity'), icon: kenoIcon },
      { labelKey: 'lobby.rail.mines', href: gameHref('mines-tequity'), icon: minesIcon },
      { labelKey: 'lobby.rail.limbo', href: gameHref('limbo-tequity'), icon: limboIcon },
      { labelKey: 'lobby.rail.dice', href: gameHref('dice-tequity'), icon: diceIcon },
      { labelKey: 'lobby.rail.crash', href: gameHref('crash-tequity'), icon: crashIcon },
      { labelKey: 'lobby.rail.hilo', href: gameHref('hilo-tequity'), icon: hiloIcon },
      {
        labelKey: 'lobby.chips.baccarat',
        href: gameHref('baccarat-tequity'),
        icon: originalsBaccaratIcon,
      },
      { labelKey: 'lobby.rail.wheel', href: gameHref('wheel-tequity'), icon: wheelIcon },
      {
        labelKey: 'lobby.rail.allOriginals',
        href: categoryHref('originals'),
        icon: allOriginalsIcon,
      },
    ],
  },
  casino: {
    id: 'casino',
    labelKey: 'nav.casino',
    href: '/casino',
    items: [
      { labelKey: 'lobby.rail.popularGames', href: categoryHref('popular'), icon: popularIcon },
      { labelKey: 'lobby.rail.dropsWins', href: DROPS_WINS_PATH, icon: dropsWinsIcon },
      { labelKey: 'dash.slots', href: categoryHref('slots'), icon: slotsIcon },
      { labelKey: 'lobby.rail.latestReleases', href: categoryHref('new'), icon: latestIcon },
      { labelKey: 'lobby.rail.highRtp', href: `${ALL_GAMES_PATH}?sort=rtp`, icon: highRtpIcon },
      { labelKey: 'dash.bonusBuys', href: categoryHref('bonus-buys'), icon: bonusBuysIcon },
      { labelKey: 'lobby.rail.holdWin', href: categoryHref('hold-and-win'), icon: holdWinIcon },
    ],
  },
  live: {
    id: 'live',
    labelKey: 'dash.liveCasino',
    href: LIVE_CASINO_HREF,
    items: [
      { labelKey: 'lobby.rail.liveLobby', href: LIVE_CASINO_HREF, icon: liveLobbyIcon },
      {
        labelKey: 'lobby.chips.blackjack',
        href: categoryHref('live-blackjack'),
        icon: liveBlackjackIcon,
      },
      { labelKey: 'lobby.chips.roulette', href: categoryHref('live-roulette'), icon: rouletteIcon },
      {
        labelKey: 'lobby.chips.baccarat',
        href: categoryHref('live-baccarat'),
        icon: liveBaccaratIcon,
      },
      {
        labelKey: 'lobby.chips.gameShows',
        href: categoryHref('live-game-shows'),
        icon: gameShowsIcon,
      },
    ],
  },
  sports: {
    id: 'sports',
    labelKey: 'lobby.sport.sportsbook',
    href: '/sports',
    items: [
      { labelKey: 'lobby.sport.soccer', href: sportHref('football') },
      { labelKey: 'lobby.sport.basketball', href: sportHref('basketball') },
      { labelKey: 'lobby.rail.americanFootball' },
      { labelKey: 'lobby.sport.tennis', href: sportHref('tennis') },
      { labelKey: 'lobby.sport.counterStrike' },
      { labelKey: 'lobby.sport.cricket', href: sportHref('cricket') },
      { labelKey: 'lobby.sport.fifa' },
      { labelKey: 'lobby.sport.baseball', href: sportHref('baseball') },
      { labelKey: 'lobby.sport.iceHockey', href: sportHref('hockey') },
      { labelKey: 'lobby.sport.mma' },
      { labelKey: 'lobby.sport.tableTennis' },
      { labelKey: 'lobby.sport.horseRacing', href: sportHref('horse-racing') },
    ],
  },
};

/** Remembers which groups the player left open. */
export const RAIL_OPEN_KEY = 'rl_rail_open';
