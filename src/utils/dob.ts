/**
 * Date-of-birth arithmetic shared by the signup form and the Level 1 form.
 *
 * Both ask the same question and both feed the same server-side rule, so the
 * month list, the leap-year handling and the 18+ arithmetic live in one place
 * rather than being written twice and drifting.
 *
 * The server is still the authority — `evaluateRegistrationDob` and
 * `evaluateDob` on the backend decide. This exists so the player is told
 * before the round trip, not instead of it.
 */

export const MIN_AGE_YEARS = 18;

export const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
] as const;

/**
 * `MONTHS` with each label in the player's language, via Intl. Falls back to
 * the English labels above if the runtime cannot format the locale.
 */
export function localizedMonths(locale: string): { value: string; label: string }[] {
  try {
    const fmt = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' });
    return MONTHS.map((m) => ({
      value: m.value,
      label: fmt.format(new Date(Date.UTC(2000, Number(m.value) - 1, 1))),
    }));
  } catch {
    return MONTHS.map((m) => ({ value: m.value, label: m.label }));
  }
}

/**
 * Years a player could plausibly have been born in.
 *
 * Starts at "this year minus 18" so the picker cannot offer a year that is
 * certainly underage. That is presentation, not enforcement: someone born
 * later in an offered year may still be 17, which is what `isAdult` catches.
 */
export function birthYears(asOf: Date = new Date()): string[] {
  const latest = asOf.getFullYear() - MIN_AGE_YEARS;
  return Array.from({ length: 80 }, (_, i) => String(latest - i));
}

/**
 * Days available for the chosen month, so the picker cannot offer 31 February.
 * Falls back to 31 until a month is picked. A leap year needs the real year, so
 * an unset year is treated as a leap year rather than silently dropping Feb 29.
 */
export function daysInMonth(month: string, year: string): string[] {
  const m = Number(month);
  if (!m) return Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const y = Number(year) || 2000;
  const count = new Date(y, m, 0).getDate();
  return Array.from({ length: count }, (_, i) => String(i + 1).padStart(2, '0'));
}

/** The three selects as the `YYYY-MM-DD` the API takes, or null if incomplete. */
export function composeDob(day: string, month: string, year: string): string | null {
  if (!day || !month || !year) return null;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

const EMPTY_PARTS = { day: '', month: '', year: '' };

/**
 * Splits a stored `YYYY-MM-DD` back into the three selects.
 *
 * Shape-checked rather than merely split on the dash. "not-a-date" also has
 * three dash-separated parts, and returning `{ year: 'not', month: 'a' }`
 * seeds the picker with values no option matches — the selects then render
 * blank, which looks like the player never entered a date rather than like
 * something failed to parse.
 */
export function splitDob(dob: string | null | undefined): {
  day: string;
  month: string;
  year: string;
} {
  if (typeof dob !== 'string') return { ...EMPTY_PARTS };

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob.trim());
  if (!match) return { ...EMPTY_PARTS };

  return { year: match[1], month: match[2], day: match[3] };
}

/**
 * Completed years, in UTC — matching `calculateAge` on the backend so the two
 * never disagree about a birthday near a timezone boundary.
 */
export function ageOn(dob: string, asOf: Date = new Date()): number | null {
  const [y, m, d] = dob.split('-').map(Number);
  if (!y || !m || !d) return null;

  const birth = new Date(Date.UTC(y, m - 1, d));
  if (birth.getUTCFullYear() !== y || birth.getUTCMonth() !== m - 1 || birth.getUTCDate() !== d) {
    return null;
  }

  let age = asOf.getUTCFullYear() - y;
  const monthDelta = asOf.getUTCMonth() - (m - 1);
  if (monthDelta < 0 || (monthDelta === 0 && asOf.getUTCDate() < d)) age--;

  return age;
}

export function isAdult(dob: string, asOf: Date = new Date()): boolean {
  const age = ageOn(dob, asOf);
  return age !== null && age >= MIN_AGE_YEARS;
}
