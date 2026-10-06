/**
 * Countries with a flag in src/assets/flags.
 *
 * Each code (ISO 3166-1 alpha-2) matches a file named `<code lowercase>.svg`
 * there, drawn on a square 512×512 canvas so it crops cleanly to a circle.
 * Adding a flag is two steps: drop the SVG into that folder, add its code here.
 */
export const FLAG_COUNTRIES = ['GB', 'SA', 'TR', 'IN', 'FR', 'RU', 'PT', 'ES', 'IT'] as const;

export type FlagCountry = (typeof FLAG_COUNTRIES)[number];

export const isFlagCountry = (code: string): code is FlagCountry =>
  (FLAG_COUNTRIES as readonly string[]).includes(code);
