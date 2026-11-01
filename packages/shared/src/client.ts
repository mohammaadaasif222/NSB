/**
 * What public pages run in the browser. Keep this file free of Zod schemas: anything imported from
 * '@nsb/shared' pulls every schema, and Zod's locales, into the page's JavaScript.
 */
export { youTubeId } from './youtube.js';

/** The only areas NSB covers: the site's location picker offers these, and listings and projects must be in one. */
export const LISTING_AREAS = ['Noida', 'Greater Noida', 'Greater Noida West'] as const;

/** "Planning to buy in?" on the View Number form. */
export const BUY_WITHIN = ['3 months', '6 months', '6+ months'] as const;

/** Today's date in India as YYYY-MM-DD, the earliest site visit date. */
export const todayInIndia = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

const trimZeros = (s: string) => s.replace(/\.?0+$/, '');

/** ₹ amount in crore or lakh, as Indian property sites write it: 12500000 → "1.25 Cr", 8500000 → "85 L". */
export const formatPrice = (rupees: number) =>
  rupees >= 1e7 ? `${trimZeros((rupees / 1e7).toFixed(2))} Cr` : `${trimZeros((rupees / 1e5).toFixed(2))} L`;
