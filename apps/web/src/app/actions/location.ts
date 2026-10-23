"use server";

import { cookies } from "next/headers";
import { cleanLocation, encodeLocation, LOCATION_COOKIE, LOCATION_MAX_AGE, type SiteLocation } from "@/lib/location";

/**
 * Saves the visitor's location (null clears it). Setting a cookie in a Server Function makes
 * Next.js re-render the current page and its layouts, so every list on it updates.
 */
export async function setSiteLocation(location: SiteLocation | null): Promise<void> {
  const store = await cookies();
  const clean = cleanLocation(location);
  if (!clean) {
    store.delete(LOCATION_COOKIE);
    return;
  }
  store.set(LOCATION_COOKIE, encodeLocation(clean), { path: "/", maxAge: LOCATION_MAX_AGE, sameSite: "lax" });
}
