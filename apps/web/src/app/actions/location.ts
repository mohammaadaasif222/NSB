"use server";

import { cookies } from "next/headers";
import { cleanLocation, encodeLocation, LOCATION_COOKIE, LOCATION_PATH_COOKIE, type SiteLocation } from "@/lib/location";

/**
 * Saves the visitor's location for the page at `path` (null clears it). Browser-session cookies:
 * the location is for this page only. Setting a cookie in a Server Function makes Next.js
 * re-render the current page and its layouts, so every list on it updates.
 */
export async function setSiteLocation(location: SiteLocation | null, path: string): Promise<void> {
  const store = await cookies();
  const clean = cleanLocation(location);
  if (!clean || !path.startsWith("/")) {
    store.delete(LOCATION_COOKIE);
    store.delete(LOCATION_PATH_COOKIE);
    return;
  }
  store.set(LOCATION_COOKIE, encodeLocation(clean), { path: "/", sameSite: "lax" });
  // Next.js encodes cookie values itself.
  store.set(LOCATION_PATH_COOKIE, path.slice(0, 300), { path: "/", sameSite: "lax" });
}
