/** The public site's address, once the admin runs on its own domain; relative while they share one. */
const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");

/** A link from the admin to a page of the public site. */
export const sitePath = (path: string) => `${SITE_ORIGIN}${path}`;
