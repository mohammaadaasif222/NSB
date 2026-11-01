/** A table's columns without some, for lists that have no use for long text or private fields. */
export const without = <T extends Record<string, unknown>, K extends keyof T>(columns: T, keys: readonly K[]) =>
  Object.fromEntries(Object.entries(columns).filter(([key]) => !keys.includes(key as K))) as Omit<T, K>;
