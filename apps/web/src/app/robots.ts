import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

/** /robots.txt: crawl the public site, keep the admin panel and the API out of search results. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
