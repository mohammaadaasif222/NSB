import type { StaticImageData } from 'next/image';
import lineFootball from '@/assets/lobby/player/sport-football.svg';
import lineBasketball from '@/assets/lobby/player/sport-basketball.svg';
import lineTennis from '@/assets/lobby/player/sport-tennis.svg';
import lineCricket from '@/assets/lobby/player/sport-cricket.svg';
import lineHorse from '@/assets/lobby/player/sport-horse.svg';
import lineBaseball from '@/assets/lobby/player/sport-baseball.svg';
import lineHockey from '@/assets/lobby/player/sport-hockey.svg';

/** A sport with its own page, `/sports/<key>`. */
export type SportKey =
  'football' | 'basketball' | 'tennis' | 'cricket' | 'horse-racing' | 'baseball' | 'hockey';

/** What a fixture can be: a sport with a page, or esports (a chip, no tile). */
export type FixtureSport = SportKey | 'esports';

export interface Sport {
  key: SportKey;
  /** The designs' English, like the rest of the sports chrome. */
  label: string;
  /** The sportsbook's line icon, with its colour accent. */
  icon: StaticImageData;
}

/** The sportsbook's sports, in the designs' order. */
export const SPORTS: Sport[] = [
  { key: 'football', label: 'Football', icon: lineFootball },
  { key: 'basketball', label: 'Basketball', icon: lineBasketball },
  { key: 'tennis', label: 'Tennis', icon: lineTennis },
  { key: 'cricket', label: 'Cricket', icon: lineCricket },
  { key: 'horse-racing', label: 'Horse Racing', icon: lineHorse },
  { key: 'baseball', label: 'Baseball', icon: lineBaseball },
  { key: 'hockey', label: 'Hockey', icon: lineHockey },
];

/** The Top Sports chips: every sport, then the four the design names. */
export const SPORT_CHIPS: { key: FixtureSport | 'all'; label?: string }[] = [
  { key: 'all' },
  { key: 'football', label: 'Soccer' },
  { key: 'basketball', label: 'Basketball' },
  { key: 'tennis', label: 'Tennis' },
  { key: 'esports', label: 'Esports' },
];

export const isSportKey = (value: unknown): value is SportKey =>
  SPORTS.some((sport) => sport.key === value);

/** Path of a sport's page. */
export const sportHref = (key: SportKey): string => `/sports/${key}`;
