import { sql } from 'drizzle-orm';

/** Start of a calendar day (YYYY-MM-DD) in India, for "from"/"to" date filters. */
export const istDayStart = (isoDate: string) => sql`(${isoDate}::date)::timestamp at time zone 'Asia/Kolkata'`;

/** Today's date in India, for term ends and "days left" (the database's current_date is UTC). */
export const istToday = sql`(now() at time zone 'Asia/Kolkata')::date`;
