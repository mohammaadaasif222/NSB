import { notFound } from "next/navigation";
import { cache } from "react";
import type { Category, CategoryDetail, ListingDetail, ProjectDetail } from "@nsb/shared";
import type { SearchCategory } from "@/components/site/search-hit";
import { api, ApiError } from "./api";

/** GET that turns an API 404 into the Next.js not-found page. */
async function getOr404<T>(path: string): Promise<T> {
  try {
    return await api.get<T>(path);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}

// cache(): generateMetadata and the page share one request per render.
export const getCategory = cache((slug: string) => getOr404<CategoryDetail>(`/categories/${encodeURIComponent(slug)}`));

export const getListing = cache((slug: string) => getOr404<ListingDetail>(`/listings/${encodeURIComponent(slug)}`));

export const listingPath = (vertical: string, category: string, listing: string) =>
  `/${vertical}/${category}/${listing}`;

export const getProject = cache((slug: string) => getOr404<ProjectDetail>(`/projects/${encodeURIComponent(slug)}`));

/** A real estate project page. */
export const projectPath = (slug: string) => `/real-estate/${slug}`;

/** Every live category and sub-category, for site search. A failure leaves search to vendors and projects. */
export const getSearchCategories = cache(async (): Promise<SearchCategory[]> => {
  const tops = await api.get<Category[]>("/categories").catch((): Category[] => []);
  const subs = await Promise.all(
    tops.map((top) => api.get<Category[]>(`/categories?parent=${encodeURIComponent(top.slug)}`).catch((): Category[] => [])),
  );
  return tops.flatMap((top, i) => [
    { name: top.name, href: `/${top.slug}`, parent: null },
    ...subs[i].map((sub) => ({ name: sub.name, href: `/${top.slug}/${sub.slug}`, parent: top.name })),
  ]);
});
