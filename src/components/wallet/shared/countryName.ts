/**
 * The country a display currency belongs to, spelled in the player's language.
 *
 * The euro is the one currency whose `country_code` (DE) names a single member
 * while the flag beside it is the EU's, so it reads "European Union" rather
 * than "Germany" under that flag. Anything the runtime cannot name comes back
 * as the code itself, never as nothing.
 */
const REGION_OVERRIDES: Readonly<Record<string, string>> = { EUR: 'EU' };

export const countryNameFor = (
  currencyCode: string,
  countryCode: string | null | undefined,
  locale: string
): string => {
  const region = (REGION_OVERRIDES[currencyCode.toUpperCase()] ?? countryCode ?? '').toUpperCase();
  if (!/^[A-Z]{2}$/.test(region)) return '';

  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(region) ?? region;
  } catch {
    return region;
  }
};
