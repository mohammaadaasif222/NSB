import type { Metadata } from "next";
import type { AdminCategory, AdminSettings } from "@nsb/shared";
import { PageHeader } from "@/components/admin/ui";
import { adminApi } from "@/lib/api";
import { ListingForm } from "../listing-form";
import { editorsOnly } from "@/components/admin/editors-only";

export const metadata: Metadata = { title: "Add listing" };

export default async function NewListingPage() {
  const notice = await editorsOnly("Listings");
  if (notice) return notice;
  const [categories, settings] = await Promise.all([
    adminApi.get<AdminCategory[]>("/admin/categories"),
    adminApi.get<AdminSettings>("/admin/settings"),
  ]);
  return (
    <>
      <PageHeader title="Add listing" />
      <ListingForm categories={categories} maxUploadBytes={settings.maxUploadBytes} />
    </>
  );
}
