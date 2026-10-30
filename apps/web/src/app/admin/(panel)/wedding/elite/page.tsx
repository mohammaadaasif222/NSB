import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { AdminCategory, AdminSettings, ListingSummary } from "@nsb/shared";
import { editorsOnly } from "@/components/admin/editors-only";
import { adminApi, isUuid } from "@/lib/admin-api";
import { EliteBannerForm } from "./elite-banner-form";
import { EliteManager } from "./elite-manager";

export const metadata: Metadata = { title: "Elite 10" };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";

/** Per sub-category: which listings hold the top 10 places, which of them are Elite, and the black banner. */
export default async function ElitePage({ searchParams }: PageProps<"/admin/wedding/elite">) {
  const notice = await editorsOnly("Elite 10");
  if (notice) return notice;

  const query = await searchParams;
  const [categories, settings] = await Promise.all([adminApi.get<AdminCategory[]>("/admin/categories"), adminApi.get<AdminSettings>("/admin/settings")]);
  const wedding = categories.find((c) => !c.parentId && c.slug === "wedding");
  const subs = wedding ? categories.filter((c) => c.parentId === wedding.id) : [];
  const sub = (isUuid(one(query.sub)) ? subs.find((c) => c.id === one(query.sub)) : undefined) ?? subs[0];

  if (!sub) {
    return (
      <div className="a-card">
        <h3>Elite 10</h3>
        <p className="text-zinc-500">There are no Wedding sub-categories yet.</p>
      </div>
    );
  }

  const top = await adminApi.get<ListingSummary[]>(`/admin/listings/top?categoryId=${sub.id}`);

  return (
    <>
      <div className="a-hd">
        <div>
          <h2>Elite 10</h2>
          <p>Choose who shows first in each sub-category, make them Elite for the blue card, and edit the black banner.</p>
        </div>
        <Link href={`/admin/wedding?sub=${sub.id}`} className="a-btn g">
          <ArrowLeft size={16} aria-hidden /> Wedding
        </Link>
      </div>

      <nav className="a-tl mb-4" aria-label="Sub-categories">
        {subs.map((c) => (
          <Link key={c.id} href={`/admin/wedding/elite?sub=${c.id}`} className="a-chp" aria-current={sub.id === c.id ? "true" : undefined}>
            {c.name}
          </Link>
        ))}
      </nav>

      <div className="flex flex-col gap-4">
        <EliteManager key={sub.id} categoryId={sub.id} categoryName={sub.name} top={top} />
        <EliteBannerForm key={`banner-${sub.id}`} category={sub} banners={settings.eliteBanners} />
      </div>
    </>
  );
}
