"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { LayoutGrid, List, Plus, Trash2 } from "lucide-react";
import {
  type AdminCategory,
  type AdminListing,
  isYouTubeShortsLink,
  LISTING_AREAS,
  LISTING_FORMS,
  listingDetailsToQuickInfo,
  listingFormFor,
  LISTING_STATUSES,
  type ListingStatus,
  type ListingSummary,
  type ListingUpdate,
  type ListingVideo,
  type ListingVideoKind,
  MAX_LISTING_TAGS,
  MAX_LISTING_VIDEOS,
  type QuickInfoItem,
  youTubeId,
} from "@nsb/shared";
import { Affix, Button, Field, IconButton, Select, slugify, TextArea, TextInput, Toggle } from "@/components/admin/form";
import { ImageListUpload, ImageUpload, useSessionUploads } from "@/components/admin/image-upload";
import { DetailsSection, type DetailsDraft, detailsFromDraft, draftFromDetails, FormSection } from "@/components/admin/listing-fields";
import { draftFromGroups, groupsFromDraft, type ServiceGroupDraft, ServiceGroupsEditor } from "@/components/admin/service-groups-editor";
import { TagPicker } from "@/components/admin/tag-picker";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { ListingCard, type ListingView } from "@/components/site/listing/listing-card";
import { adminClient } from "@/lib/admin-client";
import { browseTagGroups } from "@/lib/browse-panels";

const MAX_QUICK_INFO = 12;

const STATUS_LABELS: Record<ListingStatus, { label: string; hint: string }> = {
  live: { label: "Live", hint: "Shown on the website." },
  draft: { label: "Draft", hint: "Still being prepared. Not shown on the website." },
  hidden: { label: "Hidden", hint: "Taken off the website for now. Its enquiries and data are kept." },
};
const MAX_GALLERY = 30;

/** The form's steps, as in the NSB Live Demo admin. */
const STEPS = [
  { id: "basics", label: "Basics" },
  { id: "media", label: "Media" },
  { id: "details", label: "Details" },
  { id: "slot", label: "Slot & Term" },
  { id: "seo", label: "SEO" },
] as const;

/** Slots and terms are static for now: shown as in the demo, never saved. */
const TERM_MONTHS = 6;
const SLOTS_PER_AREA = 10;
const termDate = (iso: string, months = 0) => {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const BASICS_FIELDS = new Set(["categoryId", "subId", "name", "area", "locality", "address", "phone", "email", "notifyVendor"]);

/** The step holding the field an error belongs to. Unknown keys are the category's own fields, under Details. */
function stepOfError(path: string): number {
  const key = path.split(".")[0]!;
  if (BASICS_FIELDS.has(key)) return 0;
  if (key === "coverImageUrl" || key === "gallery" || key === "videos") return 1;
  if (key === "status" || key === "isFeatured") return 3;
  if (key === "slug") return 4;
  return 2;
}

/** 10-digit Indian mobile number, ignoring spaces, dashes and a +91 / 0 prefix. */
const normalisePhone = (value: string) => value.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, "");

/** A cleared optional text: "" removes a saved value; a value that was never set stays unset. */
const optional = (value: string, saved: string | null | undefined) => value.trim() || (saved ? "" : undefined);

/**
 * Create (no `listing`) or edit a vendor listing. The form has three parts: basic details every
 * listing shares, the category's fields and the sub-category's fields (LISTING_FORMS).
 *
 * Listings added before the structured forms keep their free-form key information, shown on the
 * site exactly as saved, until an admin chooses to switch them to the form.
 */
export function ListingForm({
  listing,
  categories,
  maxUploadBytes,
}: {
  listing?: AdminListing;
  categories: AdminCategory[];
  maxUploadBytes: number;
}) {
  const router = useRouter();
  const { run, pending } = useAdminAction();
  const trackUpload = useSessionUploads();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugEdited, setSlugEdited] = useState(!!listing);
  /** Which step of the split listing form is currently shown. */
  const [step, setStep] = useState(0);

  const isLast = step === STEPS.length - 1;

  // A listing is filed under one category id: a sub-category, or a top-level category.
  const current = categories.find((c) => c.id === listing?.category.id);
  const currentTopId = current?.parentId ?? current?.id ?? "";
  const [topId, setTopId] = useState(currentTopId);
  const [subId, setSubId] = useState(current?.parentId ? current.id : "");
  // Only categories with a form take new listings; an existing listing keeps its own category.
  const tops = categories.filter((c) => !c.parentId && (LISTING_FORMS[c.slug] || c.id === currentTopId));
  const subs = categories.filter((c) => topId && c.parentId === topId);
  const top = categories.find((c) => c.id === topId);
  const sub = subs.find((c) => c.id === subId);
  const form = top ? (sub ? listingFormFor(sub.slug, top.slug) : listingFormFor(top.slug)) : null;

  const isOldListing = !!listing && Object.keys(listing.details).length === 0;
  const [useForm, setUseForm] = useState(!isOldListing);
  const structured = !!form && useForm;

  const [values, setValues] = useState({
    name: listing?.name ?? "",
    slug: listing?.slug ?? "",
    area: listing?.area ?? "",
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
  });
  const [groups, setGroups] = useState<ServiceGroupDraft[]>(() => draftFromGroups(listing?.serviceGroups ?? []));
  const [draft, setDraft] = useState<DetailsDraft>(() => draftFromDetails(listing?.details ?? {}));
  const [quickInfo, setQuickInfo] = useState<QuickInfoItem[]>(listing?.savedQuickInfo ?? []);
  const [gallery, setGallery] = useState<string[]>(listing?.gallery.map((g) => g.url) ?? []);
  const [videos, setVideos] = useState<ListingVideo[]>(listing?.videos ?? []);
  const [tags, setTags] = useState<string[]>(listing?.tags ?? []);
  const setVideo = (i: number, patch: Partial<ListingVideo>) => setVideos((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const addVideo = (kind: ListingVideoKind) => setVideos((rows) => [...rows, { kind, url: "" }]);
  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => setValues((v) => ({ ...v, [key]: value }));
  const setInfo = (i: number, patch: Partial<QuickInfoItem>) => setQuickInfo((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const setDetail = (key: string, value: DetailsDraft[string]) => setDraft((d) => ({ ...d, [key]: value }));

  const services = values.services
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const shownInfo = structured ? listingDetailsToQuickInfo(form.fields, detailsFromDraft(form.fields, draft)) : quickInfo.filter((r) => r.label.trim() && r.value.trim());

  const goTo = (i: number) => {
    setStep(i);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!listing && !isLast) {
      goTo(step + 1);
      return;
    }
    const categoryId = subId || topId;
    const problems: Record<string, string> = {};
    if (!categoryId) problems.categoryId = "Choose a category";
    else if (structured && subs.length > 0 && !subId) problems.subId = "Choose a sub-category";
    const phone = normalisePhone(values.phone);
    if (structured && !/^[6-9]\d{9}$/.test(phone)) problems.phone = "Enter the 10-digit mobile number";
    if (Object.keys(problems).length) {
      setErrors(problems);
      setStep(Math.min(...Object.keys(problems).map(stepOfError)));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors({});
    const body: ListingUpdate = {
      ...values,
      categoryId,
      phone: structured ? phone : values.phone,
      locality: optional(values.locality, listing?.locality),
      address: optional(values.address, listing?.address),
      services,
      tags,
      serviceGroups: groupsFromDraft(groups),
      googleRating: values.googleRating.trim() ? Number(values.googleRating) : null,
      googleReviewCount: values.googleReviewCount.trim() ? Number(values.googleReviewCount) : null,
      googleMapsUrl: values.googleMapsUrl.trim() || null,
      gallery,
      videos: videos.map((v) => ({ ...v, url: v.url.trim() })).filter((v) => v.url),
      // A form listing saves its answers; its saved quick info is left as it was.
      ...(structured ? { details: detailsFromDraft(form.fields, draft) } : { quickInfo: quickInfo.filter((r) => r.label.trim() || r.value.trim()) }),
    };
    const result = await run(
      () =>
        listing
          ? adminClient.patch<AdminListing>(`/admin/listings/${listing.id}`, body)
          : adminClient.post<AdminListing>("/admin/listings", body),
      { success: listing ? "Listing saved" : "Listing added", refresh: false },
    );
    if (result.ok) {
      // A new listing opens on its own page; replace() keeps the empty Add form out of Back.
      if (listing) router.push("/admin/wedding");
      else router.replace(`/admin/listings/${result.data.id}`);
      return;
    }
    const next = result.error.status === 409 ? { slug: result.error.message } : result.error.fieldErrors;
    setErrors(next);
    if (Object.keys(next).length) setStep(Math.min(...Object.keys(next).map(stepOfError)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const stepsWithErrors = [...new Set(Object.keys(errors).map(stepOfError))].sort();
  const nestedErrors = Object.entries(errors).filter(([path]) => /^(services|serviceGroups|quickInfo|gallery|videos)\./.test(path));
  const unfiled = topId && !subId && subs.length > 0;
  const areas: string[] = [...LISTING_AREAS];
  // An older listing's free-text area stays selectable, so saving does not change it.
  if (values.area && !areas.includes(values.area)) areas.push(values.area);

  const preview: ListingSummary = {
    id: listing?.id ?? "preview",
    name: values.name.trim() || "Business name",
    slug: values.slug,
    area: values.area || "Area",
    locality: values.locality.trim() || null,
    shortDescription: values.shortDescription,
    coverImageUrl: values.coverImageUrl,
    galleryPreview: gallery.slice(0, 4),
    keyInfo: shownInfo.slice(0, 4),
    services: [...services, ...groupsFromDraft(groups).flatMap((g) => g.items)],
    isFeatured: values.isFeatured,
    createdAt: listing?.createdAt ?? new Date().toISOString(),
    status: values.status,
    rating: values.googleRating.trim() && !Number.isNaN(Number(values.googleRating))
      ? { average: Number(values.googleRating), count: Number(values.googleReviewCount) || 0, source: "google" }
      : (listing?.rating ?? null),
    category: { id: sub?.id ?? top?.id ?? "", name: sub?.name ?? top?.name ?? "Category", slug: sub?.slug ?? top?.slug ?? "" },
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,48rem)_minmax(0,22rem)] xl:items-start">
      <form onSubmit={onSubmit} className="flex min-w-0 flex-col gap-5" noValidate>
        {Object.keys(errors).length > 0 && (
          <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            Please fix the highlighted fields
            {stepsWithErrors.length > 0 && <> in {stepsWithErrors.map((i) => STEPS[i]!.label).join(", ")}</>}.
            {nestedErrors.map(([path, message]) => (
              <span key={path} className="block text-xs">
                {path}: {message}
              </span>
            ))}
          </div>
        )}

        <nav className="a-stp" aria-label="Form steps">
          {STEPS.map((s, i) => (
            <button key={s.id} type="button" aria-current={i === step ? "step" : undefined} onClick={() => goTo(i)}>
              {i + 1}. {s.label}
              {stepsWithErrors.includes(i) && <span className="a-stp-err" aria-label="has errors" />}
            </button>
          ))}
        </nav>

        {/* Every step stays mounted, so moving between steps keeps what was typed. */}
        <div hidden={step !== 0} className="flex flex-col gap-5">
          <FormSection title="Where does this listing go?">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category *" error={errors.categoryId}>
                <Select
                  value={topId}
                  invalid={!!errors.categoryId}
                  onChange={(e) => {
                    setTopId(e.target.value);
                    setSubId(""); // a sub-category always belongs to the chosen category
                  }}
                >
                  <option value="">Choose…</option>
                  {tops.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.isActive ? "" : " (hidden)"}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label={structured ? "Sub-category *" : "Sub-category"}
                error={errors.subId}
                hint={subs.length === 0 && topId ? "This category has no sub-categories yet." : undefined}
              >
                <Select value={subId} invalid={!!errors.subId} onChange={(e) => setSubId(e.target.value)} disabled={subs.length === 0}>
                  <option value="">{structured ? "Choose…" : "None"}</option>
                  {subs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.isActive ? "" : " (hidden)"}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            {unfiled && !structured && (
              <p className="text-xs text-amber-700">
                The site lists vendors inside sub-categories (for example Wedding › Wedding Venues). Without one, this listing is saved but does
                not appear on a category page.
              </p>
            )}
            <p className="text-xs text-zinc-500">Only categories with a listing form are offered. Wedding is open for now.</p>
          </FormSection>

          <FormSection title="Basic details" tag="Same for every listing">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Business name *" error={errors.name} className="sm:col-span-2">
                <TextInput
                  value={values.name}
                  maxLength={120}
                  required
                  placeholder="e.g. Royal Orchid Banquet"
                  invalid={!!errors.name}
                  onChange={(e) => {
                    set("name", e.target.value);
                    if (!slugEdited) set("slug", slugify(e.target.value));
                  }}
                />
              </Field>
              <Field label="Area *" error={errors.area}>
                <Select value={values.area} invalid={!!errors.area} onChange={(e) => set("area", e.target.value)}>
                  <option value="">Choose…</option>
                  {areas.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Locality / sector" error={errors.locality}>
                <TextInput value={values.locality} maxLength={120} placeholder="e.g. Sector 18" onChange={(e) => set("locality", e.target.value)} />
              </Field>
            </div>
            <Field label="Full address" error={errors.address}>
              <TextArea value={values.address} onChange={(e) => set("address", e.target.value)} rows={2} maxLength={300} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={structured ? "Phone *" : "Phone"} hint="Private, never shown on the site" error={errors.phone}>
                <Affix before="+91">
                  <TextInput
                    type="tel"
                    inputMode="numeric"
                    value={values.phone}
                    maxLength={structured ? 14 : 20}
                    placeholder="98XXXXXXXX"
                    className="pl-12"
                    invalid={!!errors.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </Affix>
              </Field>
              <Field label="Email for leads" hint="Optional and private. Leave blank if this vendor should not get emails." error={errors.email}>
                <TextInput type="email" value={values.email} placeholder="owner@business.com" onChange={(e) => set("email", e.target.value)} invalid={!!errors.email} />
              </Field>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5">
              <Toggle label="Send enquiries to this vendor" showLabel checked={values.notifyVendor} onChange={(v) => set("notifyVendor", v)} />
              <span className="text-xs text-zinc-500">
                {values.notifyVendor
                  ? values.email.trim()
                    ? "Each enquiry is emailed to the vendor and to NSB."
                    : "Add an email above, or enquiries reach NSB only."
                  : "Off: enquiries for this listing reach NSB only; the vendor is never emailed."}
              </span>
            </div>
          </FormSection>
        </div>

        <div hidden={step !== 1} className="flex flex-col gap-5">
          <FormSection title="Photos">
            <ImageUpload
              label="Cover photo"
              slot="listing"
              crop
              value={values.coverImageUrl}
              onChange={(url) => set("coverImageUrl", url)}
              onUploaded={trackUpload}
              maxBytes={maxUploadBytes}
              error={errors.coverImageUrl}
            />
            <ImageListUpload
              label="Gallery"
              slot="listing"
              value={gallery}
              onChange={setGallery}
              onUploaded={trackUpload}
              maxBytes={maxUploadBytes}
              max={MAX_GALLERY}
            />
          </FormSection>

          <FormSection title="Videos">
            <p className="-mt-2 text-xs text-zinc-500">
              Paste YouTube links. Choose <b>Video</b> for a normal YouTube video (wide) or <b>Short</b> for a YouTube Short (tall). They show on
              the listing page in this order.
            </p>
            {videos.map((row, i) => {
              const id = youTubeId(row.url);
              const invalid = row.url.trim() !== "" && !id;
              const error = errors[`videos.${i}.url`] ?? (invalid ? "This isn't a YouTube link. Copy it from the Share button on YouTube." : undefined);
              return (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-zinc-200 p-3">
                  <div className={`relative shrink-0 overflow-hidden rounded bg-zinc-100 ${row.kind === "short" ? "h-20 w-12" : "h-12 w-20"}`}>
                    {id && <Image src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" fill sizes="80px" className="object-cover" />}
                  </div>
                  <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[120px_minmax(0,1fr)]">
                    <Select aria-label={`Type of video ${i + 1}`} value={row.kind} onChange={(e) => setVideo(i, { kind: e.target.value as ListingVideoKind })}>
                      <option value="video">Video</option>
                      <option value="short">Short</option>
                    </Select>
                    <Field label={`YouTube link ${i + 1}`} hideLabel error={error}>
                      <TextInput
                        type="url"
                        inputMode="url"
                        placeholder={row.kind === "short" ? "https://youtube.com/shorts/…" : "https://youtu.be/…"}
                        value={row.url}
                        maxLength={300}
                        invalid={!!error}
                        onChange={(e) => {
                          const url = e.target.value;
                          // A /shorts/ link is always a Short; switch the type so it shows tall on the site.
                          setVideo(i, isYouTubeShortsLink(url) ? { url, kind: "short" } : { url });
                        }}
                      />
                    </Field>
                  </div>
                  <IconButton label={`Remove video ${i + 1}`} onClick={() => setVideos((rows) => rows.filter((_, j) => j !== i))} className="mt-1 hover:text-red-600">
                    <Trash2 className="size-4" aria-hidden />
                  </IconButton>
                </div>
              );
            })}
            {videos.length < MAX_LISTING_VIDEOS ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => addVideo("video")}>
                  <Plus className="size-4" aria-hidden /> Add video
                </Button>
                <Button variant="secondary" onClick={() => addVideo("short")}>
                  <Plus className="size-4" aria-hidden /> Add Short
                </Button>
              </div>
            ) : (
              <p className="text-xs text-zinc-500">Up to {MAX_LISTING_VIDEOS} videos per listing.</p>
            )}
          </FormSection>
        </div>

        <div hidden={step !== 2} className="flex flex-col gap-5">
          <FormSection title="Description and services">
            <Field label="Short description *" hint="One line on the vendor card (240 characters)" error={errors.shortDescription}>
              <TextInput
                value={values.shortDescription}
                onChange={(e) => set("shortDescription", e.target.value)}
                maxLength={240}
                invalid={!!errors.shortDescription}
              />
            </Field>
            <Field label="About" error={errors.about}>
              <TextArea value={values.about} onChange={(e) => set("about", e.target.value)} rows={6} maxLength={5000} placeholder="Describe the venue, services, packages…" />
            </Field>
            <Field label="Services" hint="One per line. Add a detail after a | to show it under the name, e.g. Catering | In-house catering only. The card shows a few as chips." error={errors.services}>
              <TextArea value={values.services} onChange={(e) => set("services", e.target.value)} rows={4} placeholder={"Breakout rooms | 28 rooms | Included in rent\nFood served | Veg only"} />
            </Field>
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold text-zinc-900">Service sections</span>
              <ServiceGroupsEditor rows={groups} onChange={setGroups} errors={errors} />
            </div>
          </FormSection>

          <FormSection title="Tags" tag="Site filters">
            <TagPicker
              value={tags}
              onChange={setTags}
              groups={sub ? browseTagGroups(sub.slug, sub.name) : []}
              max={MAX_LISTING_TAGS}
              error={errors.tags}
            />
          </FormSection>

          {structured && top && (
            <>
              <DetailsSection
                title={`${top.name} details`}
                tag={`All ${top.name} listings`}
                fields={form.categoryFields}
                draft={draft}
                errors={errors}
                onChange={setDetail}
              />
              {sub ? (
                <DetailsSection
                  title={`${sub.name} details`}
                  tag={`Only ${sub.name}`}
                  fields={form.subcategoryFields}
                  draft={draft}
                  errors={errors}
                  onChange={setDetail}
                />
              ) : (
                subs.length > 0 && (
                  <p className="rounded-xl border border-dashed border-zinc-300 px-5 py-4 text-sm text-zinc-500">
                    Choose a sub-category in Basics to see its fields: {subs.map((c) => c.name).join(", ")}.
                  </p>
                )
              )}
            </>
          )}

          {!structured && (
            <FormSection title="Key information">
              {form && (
                <div className="flex flex-col items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <p>
                    This listing was added before the {sub?.name ?? top?.name} form. Its key information below is shown on the site as it is saved.
                  </p>
                  <Button variant="secondary" onClick={() => setUseForm(true)}>
                    Fill in the {sub?.name ?? top?.name} form instead
                  </Button>
                </div>
              )}
              <p className="text-xs text-zinc-500">The first four items show on the vendor card, e.g. Starting price · ₹50,000.</p>
              {quickInfo.map((row, i) => (
                <div key={i} className="flex items-start gap-2">
                  <TextInput aria-label={`Label ${i + 1}`} placeholder="Label" value={row.label} maxLength={40} onChange={(e) => setInfo(i, { label: e.target.value })} />
                  <TextInput aria-label={`Value ${i + 1}`} placeholder="Value" value={row.value} maxLength={120} onChange={(e) => setInfo(i, { value: e.target.value })} />
                  <IconButton label={`Remove item ${i + 1}`} onClick={() => setQuickInfo((rows) => rows.filter((_, j) => j !== i))} className="mt-1 hover:text-red-600">
                    <Trash2 className="size-4" aria-hidden />
                  </IconButton>
                </div>
              ))}
              {quickInfo.length < MAX_QUICK_INFO && (
                <Button variant="secondary" className="self-start" onClick={() => setQuickInfo((rows) => [...rows, { label: "", value: "" }])}>
                  <Plus className="size-4" aria-hidden /> Add item
                </Button>
              )}
            </FormSection>
          )}

          {structured && isOldListing && (
            <p className="-mt-2 text-xs text-zinc-500">
              Once saved, the site shows these answers instead of the old key information.{" "}
              <button type="button" className="font-medium text-zinc-900 underline" onClick={() => setUseForm(false)}>
                Keep the old key information
              </button>
            </p>
          )}

          <FormSection title="Ratings and reviews">
            <p className="text-xs text-zinc-500">
              Type in the vendor&apos;s rating exactly as Google Maps shows it. It is not synced automatically, so update it now and then. The
              cards show this rating, or the average of the reviews below when there is no Google rating.
            </p>
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_2fr]">
              <Field label="Google rating" hint="1 to 5, e.g. 4.7" error={errors.googleRating}>
                <TextInput type="number" inputMode="decimal" min={1} max={5} step={0.1} value={values.googleRating} onChange={(e) => set("googleRating", e.target.value)} invalid={!!errors.googleRating} />
              </Field>
              <Field label="Google reviews" hint="Number of reviews" error={errors.googleReviewCount}>
                <TextInput type="number" inputMode="numeric" min={0} step={1} value={values.googleReviewCount} onChange={(e) => set("googleReviewCount", e.target.value)} invalid={!!errors.googleReviewCount} />
              </Field>
              <Field label="Google Maps link" hint="Visitors can open the Google reviews from it" error={errors.googleMapsUrl}>
                <TextInput type="url" inputMode="url" value={values.googleMapsUrl} placeholder="https://maps.app.goo.gl/…" onChange={(e) => set("googleMapsUrl", e.target.value)} invalid={!!errors.googleMapsUrl} />
              </Field>
            </div>
          </FormSection>
        </div>

        <div hidden={step !== 3} className="flex flex-col gap-5">
          <FormSection title="Slot & Term" tag="Static for now">
            <p className="a-info text-sm">
              {sub && values.area ? (
                <>
                  <b>
                    {SLOTS_PER_AREA} slots
                  </b>{" "}
                  in {sub.name}, {values.area}. Each vendor takes one slot for a {TERM_MONTHS}-month term.
                </>
              ) : (
                <>Choose a sub-category and area in Basics to see its slots. Each vendor takes one slot for a {TERM_MONTHS}-month term.</>
              )}{" "}
              Slots and terms are not saved yet.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Term starts">
                <TextInput value={termDate(listing?.createdAt ?? new Date().toISOString())} readOnly disabled />
              </Field>
              <Field label="Term length">
                <Select value={String(TERM_MONTHS)} disabled onChange={() => {}}>
                  <option value="6">6 months (wedding season)</option>
                </Select>
              </Field>
              <Field label="Ends on">
                <TextInput value={termDate(listing?.createdAt ?? new Date().toISOString(), TERM_MONTHS)} readOnly disabled />
              </Field>
            </div>
          </FormSection>
          <FormSection title="Status">
            <Field label="Status" hint={STATUS_LABELS[values.status].hint} className="sm:max-w-xs">
              <Select value={values.status} onChange={(e) => set("status", e.target.value as ListingStatus)}>
                {LISTING_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s].label}
                  </option>
                ))}
              </Select>
            </Field>
            <Toggle label="Show as featured (listed first and on the home page)" showLabel checked={values.isFeatured} onChange={(v) => set("isFeatured", v)} />
          </FormSection>
        </div>

        <div hidden={step !== 4} className="flex flex-col gap-5">
          <FormSection title="SEO">
            <Field
              label="URL slug *"
              hint={`Lowercase letters, numbers and hyphens. Page address: /${top?.slug ?? "wedding"}/${sub?.slug ?? "…"}/${values.slug || "…"}`}
              error={errors.slug}
            >
              <TextInput
                value={values.slug}
                maxLength={120}
                required
                invalid={!!errors.slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  set("slug", e.target.value);
                }}
              />
            </Field>
          </FormSection>
        </div>

        <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 bg-zinc-50/95 px-4 py-3 md:-mx-8 md:px-8 xl:mx-0 xl:px-0">
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => goTo(step - 1)} disabled={step === 0}>
              Back
            </Button>
            {!isLast && (
              <Button variant="secondary" className="a-next" onClick={() => goTo(step + 1)}>
                Next
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => router.push("/admin/wedding")} disabled={pending}>
              Cancel
            </Button>
            {(listing || isLast) && (
              <Button type="submit" pending={pending}>
                {pending ? "Saving…" : listing ? "Save listing" : "Add listing"}
              </Button>
            )}
          </div>
        </div>
      </form>

      <CardPreview listing={preview} />
    </div>
  );
}

/** The real site card, filled from the form as you type. */
function CardPreview({ listing }: { listing: ListingSummary }) {
  const [view, setView] = useState<ListingView>("grid");
  return (
    <aside aria-label="Card preview" className="flex flex-col gap-3 xl:sticky xl:top-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Preview on the site</h2>
        <div className="flex rounded-md border border-zinc-300 bg-white p-0.5">
          {(["grid", "list"] as const).map((v) => (
            <IconButton key={v} label={v === "grid" ? "Grid card" : "List card"} aria-pressed={view === v} onClick={() => setView(v)} className="aria-pressed:bg-zinc-900 aria-pressed:text-white">
              {v === "grid" ? <LayoutGrid className="size-4" aria-hidden /> : <List className="size-4" aria-hidden />}
            </IconButton>
          ))}
        </div>
      </div>
      <div inert className="rounded-lg bg-white p-4 font-sans shadow-sm ring-1 ring-zinc-200">
        <ListingCard listing={listing} href="#" view={view} />
      </div>
      <p className="text-xs text-zinc-500">The card shows the first four key details. Highlighted fields such as price come first.</p>
    </aside>
  );
}
