import type { DiceCondition } from '@/types';

/**
 * Dice arithmetic for the board. Display only — the server rolls, prices and
 * settles every bet. These mirror its rules so the figures on screen are the
 * figures it pays.
 */

/** Tolerance for binary floating point: 94 ÷ 50 × 10000 comes out as 18799.999…. */
const EPSILON = 1e-7;

export const round2 = (value: number): number => Math.round(value * 100) / 100;

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/** The width, in percent, of the side of the track a bet wins on. */
export const winChanceFor = (target: number, condition: DiceCondition): number =>
  round2(condition === 'OVER' ? 100 - target : target);

export const targetFor = (winChance: number, condition: DiceCondition): number =>
  round2(condition === 'OVER' ? 100 - winChance : winChance);

/** RTP ÷ win chance, rounded down to 4 places, as the server prices it. */
export const multiplierFor = (rtp: number, winChance: number): number =>
  winChance > 0 ? Math.floor((rtp / winChance) * 10_000 + EPSILON) / 10_000 : 0;

/** What a win adds on top of the stake, with the payout rounded down to cents. */
export const profitFor = (bet: number, multiplier: number): number =>
  round2(Math.floor(bet * multiplier * 100 + EPSILON) / 100 - bet);

/** Keep digits and one decimal point, with at most `places` after it. */
export const sanitizeDecimal = (text: string, places: number): string => {
  const [whole, ...rest] = text.replace(/[^0-9.]/g, '').split('.');
  return rest.length > 0 ? `${whole}.${rest.join('').slice(0, places)}` : whole;
};
