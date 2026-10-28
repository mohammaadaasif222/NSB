import type { TranslationKey } from '@/i18n/locales';
import { ALL_GAMES_PATH, LIVE_CASINO_HREF, categoryHref, gameHref } from '@/constants/games';
import { sportHref } from '@/constants/sportsbook';

/** A row inside an expandable rail group. No `href`: drawn as "Soon". */
export interface RailSubItem {
  labelKey: TranslationKey;
  href?: string;
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
      { labelKey: 'lobby.rail.plinko', href: gameHref('plinko-tequity') },
      { labelKey: 'lobby.chips.blackjack', href: gameHref('blackjack-tequity') },
      { labelKey: 'lobby.rail.keno', href: gameHref('keno-tequity') },
      { labelKey: 'lobby.rail.mines', href: gameHref('mines-tequity') },
      { labelKey: 'lobby.rail.limbo', href: gameHref('limbo-tequity') },
      { labelKey: 'lobby.rail.dice', href: gameHref('dice-tequity') },
      { labelKey: 'lobby.rail.crash', href: gameHref('crash-tequity') },
      { labelKey: 'lobby.rail.hilo', href: gameHref('hilo-tequity') },
      { labelKey: 'lobby.chips.baccarat', href: gameHref('baccarat-tequity') },
      { labelKey: 'lobby.rail.wheel', href: gameHref('wheel') },
      { labelKey: 'lobby.rail.allOriginals', href: categoryHref('originals') },
    ],
  },
  casino: {
    id: 'casino',
    labelKey: 'nav.casino',
    href: '/casino',
    items: [
      { labelKey: 'lobby.rail.popularGames', href: categoryHref('popular') },
      { labelKey: 'lobby.rail.dropsWins' },
      { labelKey: 'dash.slots', href: categoryHref('slots') },
      { labelKey: 'lobby.rail.latestReleases', href: categoryHref('new') },
      { labelKey: 'lobby.rail.highRtp', href: `${ALL_GAMES_PATH}?sort=rtp` },
      { labelKey: 'dash.bonusBuys', href: categoryHref('bonus-buys') },
      { labelKey: 'lobby.rail.holdWin' },
      { labelKey: 'allGames.title', href: ALL_GAMES_PATH },
    ],
  },
  live: {
    id: 'live',
    labelKey: 'dash.liveCasino',
    href: LIVE_CASINO_HREF,
    items: [
      { labelKey: 'lobby.rail.liveLobby', href: LIVE_CASINO_HREF },
      { labelKey: 'lobby.chips.blackjack', href: categoryHref('live-blackjack') },
      { labelKey: 'lobby.chips.roulette', href: categoryHref('live-roulette') },
      { labelKey: 'lobby.chips.baccarat', href: categoryHref('live-baccarat') },
      { labelKey: 'lobby.chips.gameShows', href: categoryHref('live-game-shows') },
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
