/** One `searchParams` entry: absent, given once, or repeated. */
export type SearchParam = string | string[] | undefined;

/** The first value exactly as written; undefined when absent. */
export const one = (v: SearchParam) => (Array.isArray(v) ? v[0] : v);

/** The first value exactly as written; "" when absent. */
export const oneOrEmpty = (v: SearchParam) => one(v) ?? "";

/** The first value without surrounding spaces; "" when absent. */
export const oneTrimmed = (v: SearchParam) => one(v)?.trim() ?? "";

/** A real calendar date written as YYYY-MM-DD. */
export const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

/** `value` when the list allows it, otherwise "". */
export const pick = <T extends string>(list: readonly T[], value: string): T | "" => ((list as readonly string[]).includes(value) ? (value as T) : "");

/** Pages needed for `total` rows, never fewer than one. */
export const pageCountOf = (total: number, size: number) => Math.max(1, Math.ceil(total / size));
