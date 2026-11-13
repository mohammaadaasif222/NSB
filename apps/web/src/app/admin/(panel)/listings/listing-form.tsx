"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useMemo, useState } from "react";
import { type AdminCategory, type AdminListing, hasProfileSections, LISTING_FORMS, listingFormFor, type ListingVideo, type QuickInfoItem } from "@nsb/shared";
import { Button } from "@/components/admin/form";
import { useSessionUploads } from "@/components/admin/image-upload";
import { type DetailsDraft, draftFromDetails } from "@/components/admin/listing-fields";
import { draftFromProfile, type ProfileDraft } from "@/components/admin/profile-sections-editor";
import { draftFromGroups, type ServiceGroupDraft } from "@/components/admin/service-groups-editor";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { scrollToTop, useSteppedForm } from "@/components/admin/use-stepped-form";
import { adminClient } from "@/lib/admin-client";
import { CardPreview } from "./card-preview";
import { listingBody, listingPreview, listingProblems, type ListingValues, nestedErrors, oldAreaOf, STEPS, stepOfError, valuesOf } from "./listing-draft";
import { BasicsStep } from "./steps/basics-step";
import { DetailsStep } from "./steps/details-step";
import { MediaStep } from "./steps/media-step";
import { SeoStep } from "./steps/seo-step";
import { SlotStep } from "./steps/slot-step";
import { StepErrors, StepNav } from "@/components/admin/step-nav";

/** Where the listing is filed: a sub-category, or a top-level category. */
function useCategoryChoice(categories: AdminCategory[], listing?: AdminListing) {
  const current = categories.find((c) => c.id === listing?.category.id);
  const currentTopId = current?.parentId ?? current?.id ?? "";
  const [topId, setTopId] = useState(currentTopId);
  const [subId, setSubId] = useState(current?.parentId ? current.id : "");
  // Only categories with a form take new listings; an existing listing keeps its own category.
  const tops = useMemo(() => categories.filter((c) => !c.parentId && (LISTING_FORMS[c.slug] || c.id === currentTopId)), [categories, currentTopId]);
  const subs = useMemo(() => categories.filter((c) => topId && c.parentId === topId), [categories, topId]);
  const top = categories.find((c) => c.id === topId);
  const sub = subs.find((c) => c.id === subId);
  const form = useMemo(() => (top ? (sub ? listingFormFor(sub.slug, top.slug) : listingFormFor(top.slug)) : null), [top, sub]);
  return { topId, setTopId, subId, setSubId, tops, subs, top, sub, form };
}

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
  const { step, goTo, errors, setErrors, showErrors, stepsWithErrors } = useSteppedForm(STEPS.length, stepOfError);
  const [slugEdited, setSlugEdited] = useState(!!listing);
  const isLast = step === STEPS.length - 1;

  const { topId, setTopId, subId, setSubId, tops, subs, top, sub, form } = useCategoryChoice(categories, listing);
  const isOldListing = !!listing && Object.keys(listing.details).length === 0;
  const [useForm, setUseForm] = useState(!isOldListing);
  const structured = !!form && useForm;
  const fields = structured ? form.fields : null;

  const [values, setValues] = useState(() => valuesOf(listing));
  const [groups, setGroups] = useState<ServiceGroupDraft[]>(() => draftFromGroups(listing?.serviceGroups ?? []));
  const [draft, setDraft] = useState<DetailsDraft>(() => draftFromDetails(listing?.details ?? {}));
  const [quickInfo, setQuickInfo] = useState<QuickInfoItem[]>(listing?.savedQuickInfo ?? []);
  const [gallery, setGallery] = useState<string[]>(listing?.gallery.map((g) => g.url) ?? []);
  const [videos, setVideos] = useState<ListingVideo[]>(listing?.videos ?? []);
  const [tags, setTags] = useState<string[]>(listing?.tags ?? []);
  const [profile, setProfile] = useState<ProfileDraft>(() => draftFromProfile(listing));
  const profileSections = hasProfileSections(sub?.slug);
  const set = useCallback(<K extends keyof ListingValues>(key: K, value: ListingValues[K]) => setValues((v) => ({ ...v, [key]: value })), []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!listing && !isLast) {
      goTo(step + 1);
      return;
    }
    const problems = listingProblems({ values, topId, subId, hasSubs: subs.length > 0, fields });
    if (Object.keys(problems).length) {
      showErrors(problems);
      return;
    }
    setErrors({});
    const body = listingBody({ values, groups, details: draft, quickInfo, gallery, videos, tags, profile }, { listing, categoryId: subId || topId, fields, profileSections });
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
    showErrors(next);
    if (!Object.keys(next).length) scrollToTop();
  }

  const preview = listingPreview({ values, groups, details: draft, quickInfo, gallery }, { listing, category: sub ?? top, fields });

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,48rem)_minmax(0,22rem)] xl:items-start">
      <form onSubmit={onSubmit} className="flex min-w-0 flex-col gap-5" noValidate>
        <StepErrors errors={errors} shown={nestedErrors(errors)} labels={STEPS} steps={[...stepsWithErrors].sort()} />
        <StepNav labels={STEPS} step={step} stepsWithErrors={stepsWithErrors} goTo={goTo} />

        {/* Every step stays mounted, so moving between steps keeps what was typed. */}
        <BasicsStep
          hidden={step !== 0}
          values={values}
          errors={errors}
          set={set}
          structured={structured}
          topId={topId}
          subId={subId}
          setTopId={setTopId}
          setSubId={setSubId}
          tops={tops}
          subs={subs}
          oldArea={oldAreaOf(listing)}
          slugEdited={slugEdited}
        />
        <MediaStep
          hidden={step !== 1}
          values={values}
          errors={errors}
          set={set}
          gallery={gallery}
          setGallery={setGallery}
          videos={videos}
          setVideos={setVideos}
          trackUpload={trackUpload}
          maxUploadBytes={maxUploadBytes}
        />
        <DetailsStep
          hidden={step !== 2}
          values={values}
          errors={errors}
          set={set}
          form={form}
          structured={structured}
          isOldListing={isOldListing}
          setUseForm={setUseForm}
          top={top}
          sub={sub}
          subs={subs}
          groups={groups}
          setGroups={setGroups}
          tags={tags}
          setTags={setTags}
          draft={draft}
          setDraft={setDraft}
          quickInfo={quickInfo}
          setQuickInfo={setQuickInfo}
          profile={profileSections ? profile : null}
          setProfile={setProfile}
          trackUpload={trackUpload}
          maxUploadBytes={maxUploadBytes}
        />
        <SlotStep hidden={step !== 3} values={values} set={set} sub={sub} listing={listing} />
        <SeoStep hidden={step !== 4} values={values} errors={errors} set={set} top={top} sub={sub} setSlugEdited={setSlugEdited} />

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
