import { type AnyColumn, type SQL, sql } from 'drizzle-orm';

/** A case-insensitive "contains" pattern for ILIKE, with LIKE wildcards escaped so "50%" matches literally. */
export const likeTerm = (q: string) => `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

/**
 * "Text contains q" over the search_text() of some columns and tags, so any part of a word
 * matches ("TS H" finds "ATS Homekraft"). Keep the columns in the order of the table's GIN index
 * in schema.ts, or the index stops being used.
 */
export const searchMatch = (columns: AnyColumn[], tags: AnyColumn, q: string): SQL =>
  sql`search_text(array[${sql.join(columns, sql`, `)}], ${tags}) ilike ${likeTerm(q)}`;
