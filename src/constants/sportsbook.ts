import type { StaticImageData } from 'next/image';
import lineFootball from '@/assets/lobby/player/sport-football.svg';
import lineBasketball from '@/assets/lobby/player/sport-basketball.svg';
import lineTennis from '@/assets/lobby/player/sport-tennis.svg';
import lineCricket from '@/assets/lobby/player/sport-cricket.svg';
import lineHorse from '@/assets/lobby/player/sport-horse.svg';
import lineBaseball from '@/assets/lobby/player/sport-baseball.svg';
import lineHockey from '@/assets/lobby/player/sport-hockey.svg';
import type { TranslationKey } from '@/i18n/locales';

/** A sport with its own page, `/sports/<key>`. */
export type SportKey =
  'football' | 'basketball' | 'tennis' | 'cricket' | 'horse-racing' | 'baseball' | 'hockey';

/** What a fixture can be: a sport with a page, or esports (a chip, no tile). */
export type FixtureSport = SportKey | 'esports';

export interface Sport {
  key: SportKey;
  /** Dictionary key of the sport's name. */
  label: TranslationKey;
  /** The sportsbook's line icon, with its colour accent. */
  icon: StaticImageData;
}

/** The sportsbook's sports, in the designs' order. */
export const SPORTS: Sport[] = [
  { key: 'football', label: 'lobby.sport.football', icon: lineFootball },
  { key: 'basketball', label: 'lobby.sport.basketball', icon: lineBasketball },
  { key: 'tennis', label: 'lobby.sport.tennis', icon: lineTennis },
  { key: 'cricket', label: 'lobby.sport.cricket', icon: lineCricket },
  { key: 'horse-racing', label: 'lobby.sport.horseRacing', icon: lineHorse },
  { key: 'baseball', label: 'lobby.sport.baseball', icon: lineBaseball },
  { key: 'hockey', label: 'lobby.sport.hockey', icon: lineHockey },
];

/** The Top Sports chips: every sport, then the four the design names. */
export const SPORT_CHIPS: { key: FixtureSport | 'all'; label?: TranslationKey }[] = [
  { key: 'all' },
  { key: 'football', label: 'lobby.sport.soccer' },
  { key: 'basketball', label: 'lobby.sport.basketball' },
  { key: 'tennis', label: 'lobby.sport.tennis' },
  { key: 'esports', label: 'lobby.sport.esports' },
];

export const isSportKey = (value: unknown): value is SportKey =>
  SPORTS.some((sport) => sport.key === value);

export const COUNTER_STRIKE = 'counter-strike';

export type SportPageKey = SportKey | typeof COUNTER_STRIKE;

export const isSportPageKey = (value: unknown): value is SportPageKey =>
  value === COUNTER_STRIKE || isSportKey(value);

export const fixtureSportOf = (key: SportPageKey): FixtureSport =>
  key === COUNTER_STRIKE ? 'esports' : key;

export const sportPageLabel = (key: SportPageKey): TranslationKey | undefined =>
  key === COUNTER_STRIKE
    ? 'lobby.sport.counterStrike'
    : SPORTS.find((sport) => sport.key === key)?.label;

/** Path of a sport's page. */
export const sportHref = (key: SportPageKey): string => `/sports/${key}`;
