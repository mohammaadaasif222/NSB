"use client";

import { type Dispatch, memo, type SetStateAction } from "react";
import { Plus, Trash2 } from "lucide-react";
import { type AdminCategory, MAX_LISTING_TAGS, type QuickInfoItem, type ResolvedListingForm } from "@nsb/shared";
import { Button, Field, IconButton, TextArea, TextInput } from "@/components/admin/form";
import { DetailsSection, type DetailsDraft, FormSection } from "@/components/admin/listing-fields";
import { type ProfileDraft, ProfileSectionsEditor } from "@/components/admin/profile-sections-editor";
import { type ServiceGroupDraft, ServiceGroupsEditor } from "@/components/admin/service-groups-editor";
import { TagPicker } from "@/components/admin/tag-picker";
import { sameStepProps } from "@/components/admin/use-stepped-form";
import { browseTagGroups } from "@/lib/browse-panels";
import type { ListingStepProps } from "../listing-draft";

const MAX_QUICK_INFO = 12;

const KEYS = ["shortDescription", "about", "services", "googleRating", "googleReviewCount", "googleMapsUrl"] as const;

export const DetailsStep = memo(function DetailsStep({
  values,
  hidden,
  errors,
  set,
  form,
  structured,
  isOldListing,
  setUseForm,
  top,
  sub,
  subs,
  groups,
  setGroups,
  tags,
  setTags,
  draft,
  setDraft,
  quickInfo,
  setQuickInfo,
  profile,
  setProfile,
  trackUpload,
  maxUploadBytes,
}: ListingStepProps<(typeof KEYS)[number]> & {
  form: ResolvedListingForm | null;
  structured: boolean;
  isOldListing: boolean;
  setUseForm: (useForm: boolean) => void;
  top?: AdminCategory;
  sub?: AdminCategory;
  subs: AdminCategory[];
  groups: ServiceGroupDraft[];
  setGroups: (rows: ServiceGroupDraft[]) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  draft: DetailsDraft;
  setDraft: Dispatch<SetStateAction<DetailsDraft>>;
  quickInfo: QuickInfoItem[];
  setQuickInfo: Dispatch<SetStateAction<QuickInfoItem[]>>;
  /** Null when the sub-category's form has no profile sections. */
  profile: ProfileDraft | null;
  setProfile: Dispatch<SetStateAction<ProfileDraft>>;
  /** For package photos. */
  trackUpload: (url: string) => void;
  maxUploadBytes: number;
}) {
  const setInfo = (i: number, patch: Partial<QuickInfoItem>) => setQuickInfo((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const setDetail = (key: string, value: DetailsDraft[string]) => setDraft((d) => ({ ...d, [key]: value }));

  return (
    <div hidden={hidden} className="flex flex-col gap-5">
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

      {structured && form && top && (
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

      {profile && <ProfileSectionsEditor draft={profile} setDraft={setProfile} errors={errors} trackUpload={trackUpload} maxUploadBytes={maxUploadBytes} />}

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
  );
}, sameStepProps(KEYS));
