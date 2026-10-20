import type { MetadataRoute } from "next";
import type { Category, CategoryDetail, ListingSummary, Paginated } from "@nsb/shared";
import { api } from "@/lib/api";
import { listingPath } from "@/lib/catalog";
import { CATEGORY_PAGES_ENABLED } from "@/lib/flags";
import { SITE_URL } from "@/lib/site-url";

// Built per request from live data. Without this, `next build` tries to prerender it while the
// API is unreachable and Next's dynamic-usage signal ends up in the catch below.
export const dynamic = "force-dynamic";

/**
 * /sitemap.xml: the home page, every vertical (/wedding), every sub-category
 * (/wedding/wedding-venues) and every live listing. Built from the public API on each request,
 * so it follows what admins publish. Only categories the API exposes (active ones) are included.
 * If the API is unreachable the sitemap still answers with the home page rather than a 500.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const home: MetadataRoute.Sitemap = [{ url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 }];
  if (!CATEGORY_PAGES_ENABLED) return home;

  try {
    const verticals = await api.get<Category[]>("/categories");
    const details = await Promise.all(
      verticals.map((v) => api.get<CategoryDetail>(`/categories/${encodeURIComponent(v.slug)}`)),
    );

    // Sub-category slug → its vertical's slug, to build listing URLs.
    const verticalOf = new Map<string, string>();
    const categoryUrls: MetadataRoute.Sitemap = [];
    for (const vertical of details) {
      categoryUrls.push({ url: `${SITE_URL}/${vertical.slug}`, changeFrequency: "weekly", priority: 0.8 });
      for (const child of vertical.children) {
        verticalOf.set(child.slug, vertical.slug);
        categoryUrls.push({ url: `${SITE_URL}/${vertical.slug}/${child.slug}`, changeFrequency: "daily", priority: 0.8 });
      }
    }

    const listingUrls: MetadataRoute.Sitemap = [];
    for (let page = 1, total = Infinity; (page - 1) * 100 < total; page++) {
      const batch = await api.get<Paginated<ListingSummary>>(`/listings?page=${page}&pageSize=100`);
      total = batch.total;
      if (batch.items.length === 0) break;
      for (const listing of batch.items) {
        const vertical = verticalOf.get(listing.category.slug);
        if (!vertical) continue; // not under a vertical's sub-category, so it has no public URL
        listingUrls.push({
          url: `${SITE_URL}${listingPath(vertical, listing.category.slug, listing.slug)}`,
          lastModified: listing.createdAt,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }

    return [...home, ...categoryUrls, ...listingUrls];
  } catch (err) {
    console.error("sitemap: could not load categories or listings", err);
    return home;
  }
}
