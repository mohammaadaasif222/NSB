import { redirect } from "next/navigation";
import type { AdminProjectRow, ListingSummary, Paginated } from "@nsb/shared";
import { adminApi } from "@/lib/admin-api";
import { oneTrimmed } from "@/lib/search-params";

/**
 * The top bar's search: opens Wedding filtered by the words when a vendor matches (or nothing
 * does), otherwise Real Estate, as in the demo.
 */
export default async function AdminSearchPage({ searchParams }: PageProps<"/admin/search">) {
  const q = oneTrimmed((await searchParams).q).slice(0, 100);
  if (!q) redirect("/admin");
  const query = new URLSearchParams({ q, pageSize: "1" });
  const [listings, projects] = await Promise.all([
    adminApi.get<Paginated<ListingSummary>>(`/admin/listings?${query}`),
    adminApi.get<Paginated<AdminProjectRow>>(`/admin/projects?${query}`),
  ]);
  const section = listings.total > 0 || projects.total === 0 ? "wedding" : "real-estate";
  redirect(`/admin/${section}?${new URLSearchParams({ q })}`);
}
