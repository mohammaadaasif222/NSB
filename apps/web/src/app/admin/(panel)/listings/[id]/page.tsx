import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { AdminCategory, AdminListing, AdminSettings } from "@nsb/shared";
import { PageHeader } from "@/components/admin/ui";
import { adminApi, isUuid } from "@/lib/admin-api";
import { ApiError } from "@/lib/api";
import { DeleteListingButton } from "../delete-listing-button";
import { ListingForm } from "../listing-form";
import { editorsOnly } from "@/components/admin/editors-only";

export const metadata: Metadata = { title: "Edit listing" };

async function getListing(id: string) {
  if (!isUuid(id)) notFound();
  try {
    return await adminApi.get<AdminListing>(`/admin/listings/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}

export default async function EditListingPage({ params }: PageProps<"/admin/listings/[id]">) {
  const notice = await editorsOnly("Listings");
  if (notice) return notice;
  const { id } = await params;
  const [listing, categories, settings] = await Promise.all([
    getListing(id),
    adminApi.get<AdminCategory[]>("/admin/categories"),
    adminApi.get<AdminSettings>("/admin/settings"),
  ]);
  return (
    <>
      <PageHeader title={listing.name} description="Edit listing" actions={<DeleteListingButton id={listing.id} name={listing.name} redirectTo="/admin/wedding" />} />
      <ListingForm key={listing.updatedAt} listing={listing} categories={categories} maxUploadBytes={settings.maxUploadBytes} />
    </>
  );
}
