/** A case-insensitive "contains" pattern for ILIKE, with LIKE wildcards escaped so "50%" matches literally. */
export const likeTerm = (q: string) => `%${q.replace(/[\%_]/g, (c) => `\${c}`)}%`;
