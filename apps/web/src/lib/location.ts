import { LISTING_AREAS } from "@nsb/shared";

export type SiteArea = (typeof LISTING_AREAS)[number];

/**
 * The visitor's chosen location: Noida, Greater Noida or Greater Noida West. It lives in a cookie
 * so every page can filter on the server; null means "all locations". Safe to import from client components.
 */
export interface SiteLocation {
  area: SiteArea;
}

export const LOCATION_COOKIE = "nsb_location";
/** One year, in seconds. */
export const LOCATION_MAX_AGE = 60 * 60 * 24 * 365;

const areas: readonly string[] = LISTING_AREAS;

/** A location from untrusted input (cookie or form), or null when it is not one the site offers. */
export function cleanLocation(value: { area?: string | null } | null | undefined): SiteLocation | null {
  const area = value?.area?.trim();
  return area && areas.includes(area) ? { area: area as SiteArea } : null;
}

export const encodeLocation = (l: SiteLocation) => encodeURIComponent(l.area);

/** Older cookies were "area|locality"; the locality is dropped, so they keep their area. */
export function decodeLocation(raw: string | undefined): SiteLocation | null {
  if (!raw) return null;
  try {
    return cleanLocation({ area: decodeURIComponent(raw.split("|")[0]) });
  } catch {
    return null;
  }
}

/** "Greater Noida", or "All locations". */
export const locationLabel = (l: SiteLocation | null) => l?.area ?? "All locations";

/** The place name for headings: "Wedding Venues in Greater Noida". Without a location the site covers Noida. */
export const locationPlace = (l: SiteLocation | null) => l?.area ?? "Noida";

/** Adds the location filter (listings, projects, counts) to API query params. */
export function withLocation(params: URLSearchParams, l: SiteLocation | null): URLSearchParams {
  if (l) params.set("area", l.area);
  return params;
}

export const sameLocation = (a: SiteLocation | null, b: SiteLocation | null) => a?.area === b?.area;
