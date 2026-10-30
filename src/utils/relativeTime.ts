const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

/** "3 hours ago", in the reader's language, in the largest unit that fits. */
export const ago = (iso: string, locale: string): string => {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'always' });
  const [unit, size] = UNITS.find(([, s]) => seconds >= s) ?? ['second', 1];
  return formatter.format(-Math.floor(seconds / size), unit);
};
