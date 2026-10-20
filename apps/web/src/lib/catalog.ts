import { notFound } from "next/navigation";
import { cache } from "react";
import type { CategoryDetail, ListingDetail } from "@nsb/shared";
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
