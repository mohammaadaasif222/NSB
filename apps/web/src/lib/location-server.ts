import { cookies } from "next/headers";
import { cache } from "react";
import type { ListingCounts, LocationOption } from "@nsb/shared";
import { api } from "./api";
import { decodeLocation, LOCATION_COOKIE, type SiteLocation, withLocation } from "./location";

/** The visitor's chosen location, from the cookie. Server components only. */
export const getSiteLocation = cache(async (): Promise<SiteLocation | null> => decodeLocation((await cookies()).get(LOCATION_COOKIE)?.value));

/** Areas and localities for the location picker; read once per request (header and page share it). */
export const getLocationOptions = cache(() => api.get<LocationOption[]>("/locations"));

/** Live listings per category in the chosen location: top-level categories, or one parent's sub-categories. */
export const getListingCounts = cache((location: SiteLocation | null, parent?: string) => {
  const params = withLocation(new URLSearchParams(), location);
  if (parent) params.set("parent", parent);
  return api.get<ListingCounts>(`/locations/counts${params.size ? `?${params}` : ""}`);
});
