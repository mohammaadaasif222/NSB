import { LISTING_AREAS, type LocationFilter } from "@nsb/shared";

/**
 * The visitor's chosen location (e.g. Noida → Sector 18). It lives in a cookie so every page
 * can filter on the server; null means "all locations". Safe to import from client components.
 */
export interface SiteLocation {
  area: string;
  locality: string | null;
}

export const LOCATION_COOKIE = "nsb_location";
/** One year, in seconds. */
export const LOCATION_MAX_AGE = 60 * 60 * 24 * 365;

const areas: readonly string[] = LISTING_AREAS;

/** A location from untrusted input (cookie or form), or null when it is not one the site offers. */
export function cleanLocation(value: Partial<SiteLocation> | null | undefined): SiteLocation | null {
  const area = value?.area?.trim();
  if (!area || !areas.includes(area)) return null;
  const locality = value?.locality?.trim().slice(0, 120) || null;
  return { area, locality };
}

/** Cookie value: "area|locality", each part URL-encoded so a "|" in a name cannot split it. */
export const encodeLocation = (l: SiteLocation) => `${encodeURIComponent(l.area)}|${encodeURIComponent(l.locality ?? "")}`;

export function decodeLocation(raw: string | undefined): SiteLocation | null {
  if (!raw) return null;
  try {
    const [area, locality] = raw.split("|").map(decodeURIComponent);
    return cleanLocation({ area, locality });
  } catch {
    return null;
  }
}

/** "Sector 18, Noida", "Greater Noida", or "All locations". */
export const locationLabel = (l: SiteLocation | null) => (!l ? "All locations" : l.locality ? `${l.locality}, ${l.area}` : l.area);

/** The place name for headings: "Wedding Venues in Sector 18". Without a location the site covers Noida. */
export const locationPlace = (l: SiteLocation | null) => l?.locality ?? l?.area ?? "Noida";

/** The API's location filter (listings, counts) for a chosen location. */
export function locationFilter(l: SiteLocation | null): LocationFilter {
  return l ? { area: l.area as LocationFilter["area"], locality: l.locality ?? undefined } : {};
}

/** Adds the location filter to API query params. */
export function withLocation(params: URLSearchParams, l: SiteLocation | null): URLSearchParams {
  const { area, locality } = locationFilter(l);
  if (area) params.set("area", area);
  if (locality) params.set("locality", locality);
  return params;
}

export const sameLocation = (a: SiteLocation | null, b: SiteLocation | null) =>
  a?.area === b?.area && (a?.locality ?? null) === (b?.locality ?? null);
