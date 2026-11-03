import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { type Category, type CategoryDetail, REAL_ESTATE_SLUG, type SitemapEntry, type SitemapListing } from "@nsb/shared";
import { BLOG_POSTS } from "@/components/site/blog-content";
import { api } from "@/lib/api";
import { listingPath, projectPath } from "@/lib/catalog";
import { CATEGORY_PAGES_ENABLED } from "@/lib/flags";
import { SITE_URL } from "@/lib/site-url";

/** Crawlers fetch this often and it changes rarely. */
const CACHE_SECONDS = 3600;

/** Pages published as code, so they are listed whatever the API or the category flag says. */
const STATIC_PATHS = ["/about", "/blog", "/how-it-works", "/partner-with-us", "/faqs", "/privacy", "/terms", "/disclaimer"];

/**
 * /sitemap.xml: the home page, the footer pages, the blog articles, every sub-category (/wedding/wedding-venues), Real Estate, and every
 * live listing and project. Verticals with sub-categories only redirect, and the others are "coming
 * soon" pages, so neither is listed. If the API is unreachable the sitemap still answers with the
 * pages published as code rather than a 500.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Built on request, not at `next build`, when the API may be unreachable.
  await connection();
  const base: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    ...STATIC_PATHS.map((path) => ({ url: `${SITE_URL}${path}`, changeFrequency: "monthly" as const, priority: 0.5 })),
    ...BLOG_POSTS.map(({ slug }) => ({ url: `${SITE_URL}/blog/${slug}`, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
  if (!CATEGORY_PAGES_ENABLED) return base;

  try {
    const verticals = await api.get<Category[]>("/categories", CACHE_SECONDS);
    const [details, listings, projects] = await Promise.all([
      Promise.all(verticals.map((v) => api.get<CategoryDetail>(`/categories/${encodeURIComponent(v.slug)}`, CACHE_SECONDS))),
      api.get<SitemapListing[]>("/listings/sitemap", CACHE_SECONDS),
      api.get<SitemapEntry[]>("/projects/sitemap", CACHE_SECONDS),
    ]);

    const categoryUrls = details.flatMap((vertical): MetadataRoute.Sitemap => [
      ...(vertical.slug === REAL_ESTATE_SLUG ? [{ url: `${SITE_URL}/${vertical.slug}`, changeFrequency: "daily" as const, priority: 0.8 }] : []),
      ...vertical.children.map((child) => ({ url: `${SITE_URL}/${vertical.slug}/${child.slug}`, changeFrequency: "daily" as const, priority: 0.8 })),
    ]);
    const listingUrls = listings.map((l): MetadataRoute.Sitemap[number] => ({
      url: `${SITE_URL}${listingPath(l.vertical, l.category, l.slug)}`,
      lastModified: l.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
    const projectUrls = projects.map((p): MetadataRoute.Sitemap[number] => ({
      url: `${SITE_URL}${projectPath(p.slug)}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...base, ...categoryUrls, ...listingUrls, ...projectUrls];
  } catch (err) {
    console.error("sitemap: could not load categories or listings", err);
    return base;
  }
}
