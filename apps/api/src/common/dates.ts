import { sql } from 'drizzle-orm';

/** Start of a calendar day (YYYY-MM-DD) in India, for "from"/"to" date filters. */
export const istDayStart = (isoDate: string) => sql`(${isoDate}::date)::timestamp at time zone 'Asia/Kolkata'`;
