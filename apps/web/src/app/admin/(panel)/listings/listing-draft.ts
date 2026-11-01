import {
  type AdminCategory,
  type AdminListing,
  LISTING_AREAS,
  listingDetailsToQuickInfo,
  type ListingField,
  type ListingStatus,
  type ListingSummary,
  type ListingUpdate,
  type ListingVideo,
  mobileSchema,
  type QuickInfoItem,
} from "@nsb/shared";
import { type DetailsDraft, detailsFromDraft } from "@/components/admin/listing-fields";
import { groupsFromDraft, type ServiceGroupDraft } from "@/components/admin/service-groups-editor";

/** The form's steps, as in the NSB Live Demo admin. */
export const STEPS = ["Basics", "Media", "Details", "Slot & Term", "SEO"] as const;

const BASICS_FIELDS = new Set(["categoryId", "subId", "name", "area", "locality", "address", "phone", "email", "notifyVendor"]);

/** The step holding the field an error belongs to. Unknown keys are the category's own fields, under Details. */
export function stepOfError(path: string): number {
  const key = path.split(".")[0]!;
  if (BASICS_FIELDS.has(key)) return 0;
  if (key === "coverImageUrl" || key === "gallery" || key === "videos") return 1;
  if (key === "status" || key === "isFeatured") return 3;
  if (key === "slug") return 4;
  return 2;
}

/** The errors in list rows, which have no one field to show them beside. */
export const nestedErrors = (errors: Record<string, string>) => Object.entries(errors).filter(([path]) => /^(services|serviceGroups|quickInfo|gallery|videos)\./.test(path));

/** A cleared optional text: "" removes a saved value; a value that was never set stays unset. */
const optional = (value: string, saved: string | null | undefined) => value.trim() || (saved ? "" : undefined);

/** An older listing may have a free-text area ("Sector 18, Noida"); this is that area, if it has one. */
export const oldAreaOf = (listing?: AdminListing) => (listing && !(LISTING_AREAS as readonly string[]).includes(listing.area) ? listing.area : null);

/** The form's text and toggle fields, as the inputs hold them. */
export function valuesOf(listing?: AdminListing) {
  return {
    name: listing?.name ?? "",
    slug: listing?.slug ?? "",
    // A free-text area stays on the site, but saving the listing needs one of the areas NSB covers.
    area: oldAreaOf(listing) ? "" : (listing?.area ?? ""),
    locality: listing?.locality ?? "",
    address: listing?.address ?? "",
    shortDescription: listing?.shortDescription ?? "",
    about: listing?.about ?? "",
    services: listing?.services.join("\n") ?? "",
    email: listing?.email ?? "",
    phone: listing?.phone ?? "",
    notifyVendor: listing?.notifyVendor ?? true,
    coverImageUrl: listing?.coverImageUrl ?? null,
    isFeatured: listing?.isFeatured ?? false,
    status: listing?.status ?? ("live" as ListingStatus),
    googleRating: listing?.googleRating?.toString() ?? "",
    googleReviewCount: listing?.googleReviewCount?.toString() ?? "",
    googleMapsUrl: listing?.googleMapsUrl ?? "",
  };
}
export type ListingValues = ReturnType<typeof valuesOf>;

/** What the form holds apart from where the listing is filed. */
export interface ListingDraft {
  values: ListingValues;
  groups: ServiceGroupDraft[];
  details: DetailsDraft;
  quickInfo: QuickInfoItem[];
  gallery: string[];
  videos: ListingVideo[];
  tags: string[];
}

/** What every step gets. `values` is the part of the form state the step reads (see sameStepProps). */
export interface ListingStepProps<K extends keyof ListingValues> {
  values: Pick<ListingValues, K>;
  hidden: boolean;
  errors: Record<string, string>;
  set: <F extends keyof ListingValues>(key: F, value: ListingValues[F]) => void;
}

const serviceLines = (services: string) =>
  services
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

/** The checks made before saving. `fields` is the listing form in use; null for free-form key information. */
export function listingProblems({
  values,
  topId,
  subId,
  hasSubs,
  fields,
}: {
  values: ListingValues;
  topId: string;
  subId: string;
  hasSubs: boolean;
  fields: readonly ListingField[] | null;
}) {
  const problems: Record<string, string> = {};
  if (!(subId || topId)) problems.categoryId = "Choose a category";
  else if (fields && hasSubs && !subId) problems.subId = "Choose a sub-category";
  if (!values.area) problems.area = "Choose the area";
  if (fields && !mobileSchema.safeParse(values.phone).success) problems.phone = "Enter the 10-digit mobile number";
  return problems;
}

/** What the API gets. Call it once listingProblems finds nothing. */
export function listingBody(
  { values, groups, details, quickInfo, gallery, videos, tags }: ListingDraft,
  { listing, categoryId, fields }: { listing?: AdminListing; categoryId: string; fields: readonly ListingField[] | null },
): ListingUpdate {
  return {
    ...values,
    // The select offers only LISTING_AREAS, and a blank one is caught by listingProblems.
    area: values.area as (typeof LISTING_AREAS)[number],
    categoryId,
    phone: fields ? (mobileSchema.safeParse(values.phone).data ?? values.phone) : values.phone,
    locality: optional(values.locality, listing?.locality),
    address: optional(values.address, listing?.address),
    services: serviceLines(values.services),
    tags,
    serviceGroups: groupsFromDraft(groups),
    googleRating: values.googleRating.trim() ? Number(values.googleRating) : null,
    googleReviewCount: values.googleReviewCount.trim() ? Number(values.googleReviewCount) : null,
    googleMapsUrl: values.googleMapsUrl.trim() || null,
    gallery,
    videos: videos.map((v) => ({ ...v, url: v.url.trim() })).filter((v) => v.url),
    // A form listing saves its answers; its saved quick info is left as it was.
    ...(fields ? { details: detailsFromDraft(fields, details) } : { quickInfo: quickInfo.filter((r) => r.label.trim() || r.value.trim()) }),
  };
}

/** The card the site would show, from the form as it stands. `category` is the sub-category, or else the category. */
export function listingPreview(
  { values, groups, details, quickInfo, gallery }: Omit<ListingDraft, "videos" | "tags">,
  { listing, category, fields }: { listing?: AdminListing; category?: AdminCategory; fields: readonly ListingField[] | null },
): ListingSummary {
  const shownInfo = fields ? listingDetailsToQuickInfo(fields, detailsFromDraft(fields, details)) : quickInfo.filter((r) => r.label.trim() && r.value.trim());
  return {
    id: listing?.id ?? "preview",
    name: values.name.trim() || "Business name",
    slug: values.slug,
    area: values.area || "Area",
    locality: values.locality.trim() || null,
    shortDescription: values.shortDescription,
    coverImageUrl: values.coverImageUrl,
    galleryPreview: gallery.slice(0, 4),
    keyInfo: shownInfo.slice(0, 4),
    services: [...serviceLines(values.services), ...groupsFromDraft(groups).flatMap((g) => g.items)],
    isFeatured: values.isFeatured,
    topRank: listing?.topRank ?? null,
    isElite: listing?.isElite ?? false,
    createdAt: listing?.createdAt ?? new Date().toISOString(),
    status: values.status,
    rating: values.googleRating.trim() && !Number.isNaN(Number(values.googleRating))
      ? { average: Number(values.googleRating), count: Number(values.googleReviewCount) || 0, source: "google" }
      : (listing?.rating ?? null),
    category: { id: category?.id ?? "", name: category?.name ?? "Category", slug: category?.slug ?? "" },
  };
}
