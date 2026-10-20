/**
 * Public origin of the site, for absolute URLs in robots.txt and the sitemap. Comes from the
 * SITE_URL env (deploy/.env → compose → web container); the production domain is the fallback.
 */
export const SITE_URL = (process.env.SITE_URL || "https://noidasuperbazaar.com").replace(/\/+$/, "");
