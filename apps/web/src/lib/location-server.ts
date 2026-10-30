import { cookies, headers } from "next/headers";
import { cache } from "react";
import type { ListingCounts } from "@nsb/shared";
import { api } from "./api";
import { decodeLocation, LOCATION_COOKIE, LOCATION_PATH_COOKIE, PATH_HEADER, type SiteLocation, withLocation } from "./location";

/**
 * The visitor's chosen location, from the cookie, when it was chosen on the page being rendered;
 * any other page (and a prefetch of one) gets the default. Server components only.
 */
export const getSiteLocation = cache(async (): Promise<SiteLocation | null> => {
  const [store, head] = await Promise.all([cookies(), headers()]);
  const chosenOn = store.get(LOCATION_PATH_COOKIE)?.value;
  const sent = head.get(PATH_HEADER);
  const current = sent === null ? null : safeDecode(sent);
  // Cookies from before locations were per page have no path; they reset too.
  if (!chosenOn || (current !== null && safeDecode(chosenOn) !== current)) return null;
  return decodeLocation(store.get(LOCATION_COOKIE)?.value);
});

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return "";
  }
}

/** Live listings per category in the chosen location: top-level categories, or one parent's sub-categories. */
export const getListingCounts = cache((location: SiteLocation | null, parent?: string) => {
  const params = withLocation(new URLSearchParams(), location);
  if (parent) params.set("parent", parent);
  return api.get<ListingCounts>(`/locations/counts${params.size ? `?${params}` : ""}`);
});
