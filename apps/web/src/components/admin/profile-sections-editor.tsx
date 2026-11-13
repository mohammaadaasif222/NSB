"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import {
  type AdminListing,
  type ArtistStat,
  type ListingArtist,
  type ListingFaq,
  type ListingPackage,
  MAX_ARTIST_POINTS,
  MAX_ARTIST_STATS,
  MAX_INCLUDED_SERVICES,
  MAX_LISTING_FAQS,
  MAX_LISTING_PACKAGES,
  MAX_SERVICE_AREA_CHIPS,
  MAX_THINGS_TO_KNOW,
  type ThingToKnow,
} from "@nsb/shared";
import { Button, Field, IconButton, TextArea, TextInput } from "./form";
import { ImageUpload } from "./image-upload";
import { FormSection } from "./listing-fields";
import { TagPicker } from "./tag-picker";

/**
 * The extra sections of a makeup vendor's page (see hasProfileSections), in the page's order:
 * Packages, Included in services, Meet your artist, Service area, Things to know and FAQ.
 * Lists of points are one per line, as in the Services box.
 */

/** A package while editing: the price as typed. */
export interface PackageDraft {
  name: string;
  description: string;
  price: string;
  priceNote: string;
  duration: string;
  imageUrl: string | null;
}

export interface ProfileDraft {
  packagesTitle: string;
  packagesNote: string;
  packages: PackageDraft[];
  included: string[];
  artistName: string;
  artistRole: string;
  artistNote: string;
  stats: ArtistStat[];
  highlights: string;
  training: string;
  serviceAreaTitle: string;
  serviceArea: string;
  serviceAreaChips: string[];
  serviceAreaNote: string;
  thingsToKnow: ThingToKnow[];
  faqs: ListingFaq[];
}

export const draftFromProfile = (listing?: AdminListing): ProfileDraft => ({
  packagesTitle: listing?.packagesTitle ?? "",
  packagesNote: listing?.packagesNote ?? "",
  packages: (listing?.packages ?? []).map((p) => ({
    name: p.name,
    description: p.description ?? "",
    price: p.price?.toString() ?? "",
    priceNote: p.priceNote ?? "",
    duration: p.duration ?? "",
    imageUrl: p.imageUrl,
  })),
  included: listing?.includedServices ?? [],
  artistName: listing?.artist?.name ?? "",
  artistRole: listing?.artist?.role ?? "",
  artistNote: listing?.artist?.note ?? "",
  stats: listing?.artist?.stats ?? [],
  highlights: listing?.artist?.highlights.join("\n") ?? "",
  training: listing?.artist?.training.join("\n") ?? "",
  serviceAreaTitle: listing?.serviceAreaTitle ?? "",
  serviceArea: listing?.serviceArea ?? "",
  serviceAreaChips: listing?.serviceAreaChips ?? [],
  serviceAreaNote: listing?.serviceAreaNote ?? "",
  thingsToKnow: listing?.thingsToKnow ?? [],
  faqs: listing?.faqs ?? [],
});

const lines = (text: string) =>
  text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

const orNull = (text: string) => text.trim() || null;

export interface ProfileBody {
  packages: ListingPackage[];
  packagesTitle: string | null;
  packagesNote: string | null;
  includedServices: string[];
  artist: ListingArtist | null;
  serviceArea: string | null;
  serviceAreaTitle: string | null;
  serviceAreaChips: string[];
  serviceAreaNote: string | null;
  thingsToKnow: ThingToKnow[];
  faqs: ListingFaq[];
}

/**
 * What the API gets. Blank rows are dropped. The artist is null while every artist field is blank;
 * a filled-in field without a name is sent as it is, so the API asks for the name.
 */
export function profileFromDraft(d: ProfileDraft): ProfileBody {
  const stats = d.stats.map((s) => ({ value: s.value.trim(), label: s.label.trim() })).filter((s) => s.value || s.label);
  const highlights = lines(d.highlights);
  const training = lines(d.training);
  const anyArtist = d.artistName.trim() || d.artistRole.trim() || d.artistNote.trim() || stats.length || highlights.length || training.length;
  return {
    packages: d.packages
      .map((p) => ({
        name: p.name.trim(),
        description: orNull(p.description),
        price: p.price.trim() ? Number(p.price) : null,
        priceNote: orNull(p.priceNote),
        duration: orNull(p.duration),
        imageUrl: p.imageUrl,
      }))
      .filter((p) => p.name || p.description || p.price !== null || p.priceNote || p.duration || p.imageUrl),
    packagesTitle: orNull(d.packagesTitle),
    packagesNote: orNull(d.packagesNote),
    includedServices: d.included,
    artist: anyArtist ? { name: d.artistName.trim(), role: orNull(d.artistRole), note: orNull(d.artistNote), stats, highlights, training } : null,
    serviceArea: orNull(d.serviceArea),
    serviceAreaTitle: orNull(d.serviceAreaTitle),
    serviceAreaChips: d.serviceAreaChips,
    serviceAreaNote: orNull(d.serviceAreaNote),
    thingsToKnow: d.thingsToKnow.map((k) => ({ title: k.title.trim(), text: k.text.trim() })).filter((k) => k.title || k.text),
    faqs: d.faqs.map((f) => ({ question: f.question.trim(), answer: f.answer.trim() })).filter((f) => f.question || f.answer),
  };
}

/** Nothing to save: the sections stay hidden on the site. */
export const emptyProfile = (): ProfileBody => ({
  packages: [],
  packagesTitle: null,
  packagesNote: null,
  includedServices: [],
  artist: null,
  serviceArea: null,
  serviceAreaTitle: null,
  serviceAreaChips: [],
  serviceAreaNote: null,
  thingsToKnow: [],
  faqs: [],
});

/* ---------- list helpers ---------- */

const updateAt = <T,>(rows: T[], i: number, patch: Partial<T>) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r));
const removeAt = <T,>(rows: T[], i: number) => rows.filter((_, j) => j !== i);
function moveAt<T>(rows: T[], i: number, d: -1 | 1) {
  const next = [...rows];
  [next[i], next[i + d]] = [next[i + d]!, next[i]!];
  return next;
}

/** A boxed row with up, down and remove buttons beside its first field. */
function RowBox({ label, index, count, onMove, onRemove, first, children }: { label: string; index: number; count: number; onMove: (d: -1 | 1) => void; onRemove: () => void; first: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-3">
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">{first}</div>
        <IconButton label={`Move ${label} ${index + 1} up`} onClick={() => onMove(-1)} disabled={index === 0} className="mb-1">
          <ArrowUp className="size-4" aria-hidden />
        </IconButton>
        <IconButton label={`Move ${label} ${index + 1} down`} onClick={() => onMove(1)} disabled={index === count - 1} className="mb-1">
          <ArrowDown className="size-4" aria-hidden />
        </IconButton>
        <IconButton label={`Remove ${label} ${index + 1}`} onClick={onRemove} className="mb-1 hover:text-red-600">
          <Trash2 className="size-4" aria-hidden />
        </IconButton>
      </div>
      {children}
    </div>
  );
}

function AddButton({ label, onClick, count, max }: { label: string; onClick: () => void; count: number; max: number }) {
  return count < max ? (
    <Button variant="secondary" className="self-start" onClick={onClick}>
      <Plus className="size-4" aria-hidden /> {label}
    </Button>
  ) : (
    <p className="text-xs text-zinc-500">Up to {max}.</p>
  );
}

export function ProfileSectionsEditor({
  draft,
  setDraft,
  errors,
  trackUpload,
  maxUploadBytes,
}: {
  draft: ProfileDraft;
  setDraft: Dispatch<SetStateAction<ProfileDraft>>;
  errors: Record<string, string>;
  trackUpload: (url: string) => void;
  maxUploadBytes: number;
}) {
  const set = <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const listError = (key: string) => Object.entries(errors).find(([path]) => path === key || path.startsWith(`${key}.`))?.[1];
  const err = (path: string) => errors[path];

  return (
    <>
      <FormSection title="Packages" tag="Optional">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Section heading" hint='Empty shows "Packages"' error={err("packagesTitle")}>
            <TextInput value={draft.packagesTitle} maxLength={60} placeholder="e.g. Makeup packages" onChange={(e) => set("packagesTitle", e.target.value)} />
          </Field>
          <Field label="Line under the heading" error={err("packagesNote")}>
            <TextInput value={draft.packagesNote} maxLength={200} placeholder="e.g. Message us to customise a package or to book for a group." onChange={(e) => set("packagesNote", e.target.value)} />
          </Field>
        </div>
        {draft.packages.map((p, i) => {
          const patch = (v: Partial<PackageDraft>) => set("packages", updateAt(draft.packages, i, v));
          return (
            <RowBox
              key={i}
              label="package"
              index={i}
              count={draft.packages.length}
              onMove={(d) => set("packages", moveAt(draft.packages, i, d))}
              onRemove={() => set("packages", removeAt(draft.packages, i))}
              first={
                <Field label={`Package ${i + 1} name`} error={err(`packages.${i}.name`)}>
                  <TextInput value={p.name} maxLength={80} placeholder="e.g. Bridal HD makeup" onChange={(e) => patch({ name: e.target.value })} invalid={!!err(`packages.${i}.name`)} />
                </Field>
              }
            >
              <Field label="Description" error={err(`packages.${i}.description`)}>
                <TextArea value={p.description} rows={2} maxLength={300} onChange={(e) => patch({ description: e.target.value })} />
              </Field>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Price (₹)" hint="Empty shows no price" error={err(`packages.${i}.price`)}>
                  <TextInput type="number" inputMode="numeric" min={0} step={1} value={p.price} placeholder="25000" onChange={(e) => patch({ price: e.target.value })} invalid={!!err(`packages.${i}.price`)} />
                </Field>
                <Field label="After the price" error={err(`packages.${i}.priceNote`)}>
                  <TextInput value={p.priceNote} maxLength={30} placeholder="e.g. onwards, per trial" onChange={(e) => patch({ priceNote: e.target.value })} />
                </Field>
                <Field label="Duration" error={err(`packages.${i}.duration`)}>
                  <TextInput value={p.duration} maxLength={40} placeholder="e.g. 3 hrs 30 mins" onChange={(e) => patch({ duration: e.target.value })} />
                </Field>
              </div>
              <ImageUpload
                label="Photo (optional: one of the listing's photos is used otherwise)"
                slot="listing"
                crop
                value={p.imageUrl}
                onChange={(url) => patch({ imageUrl: url })}
                onUploaded={trackUpload}
                maxBytes={maxUploadBytes}
                error={err(`packages.${i}.imageUrl`)}
              />
            </RowBox>
          );
        })}
        <AddButton
          label="Add package"
          count={draft.packages.length}
          max={MAX_LISTING_PACKAGES}
          onClick={() => set("packages", [...draft.packages, { name: "", description: "", price: "", priceNote: "", duration: "", imageUrl: null }])}
        />
      </FormSection>

      <FormSection title="Included in services" tag="Optional">
        <TagPicker
          value={draft.included}
          onChange={(v) => set("included", v)}
          groups={[]}
          max={MAX_INCLUDED_SERVICES}
          error={listError("includedServices")}
          hint="Shown as chips under the packages, e.g. Hairstyling, Saree draping."
        />
      </FormSection>

      <FormSection title="Meet your artist" tag="Optional">
        <p className="text-xs text-zinc-500">Leave every field empty to hide this section. Fill in the name to show it.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Artist name" error={err("artist.name")}>
            <TextInput value={draft.artistName} maxLength={80} placeholder="e.g. Ritika Sharma" onChange={(e) => set("artistName", e.target.value)} invalid={!!err("artist.name")} />
          </Field>
          <Field label="Role" error={err("artist.role")}>
            <TextInput value={draft.artistRole} maxLength={120} placeholder="e.g. Founder and lead makeup artist" onChange={(e) => set("artistRole", e.target.value)} />
          </Field>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-zinc-900">Stats</span>
          <p className="text-xs text-zinc-500">Up to {MAX_ARTIST_STATS}, e.g. 9 years · Experience, 500+ · Brides styled.</p>
          {draft.stats.map((row, i) => (
            <div key={i} className="flex items-start gap-2">
              <TextInput aria-label={`Stat ${i + 1} figure`} placeholder="Figure, e.g. 500+" value={row.value} maxLength={20} onChange={(e) => set("stats", updateAt(draft.stats, i, { value: e.target.value }))} invalid={!!err(`artist.stats.${i}.value`)} />
              <TextInput aria-label={`Stat ${i + 1} label`} placeholder="Label, e.g. Brides styled" value={row.label} maxLength={40} onChange={(e) => set("stats", updateAt(draft.stats, i, { label: e.target.value }))} invalid={!!err(`artist.stats.${i}.label`)} />
              <IconButton label={`Remove stat ${i + 1}`} onClick={() => set("stats", removeAt(draft.stats, i))} className="mt-1 hover:text-red-600">
                <Trash2 className="size-4" aria-hidden />
              </IconButton>
            </div>
          ))}
          {listError("artist.stats") && <p className="text-xs text-red-600">{listError("artist.stats")}</p>}
          <AddButton label="Add stat" count={draft.stats.length} max={MAX_ARTIST_STATS} onClick={() => set("stats", [...draft.stats, { value: "", label: "" }])} />
        </div>
        <Field label="Highlights" hint={`One per line, up to ${MAX_ARTIST_POINTS}`} error={listError("artist.highlights")}>
          <TextArea value={draft.highlights} rows={3} placeholder={"Styled over 500 brides across Delhi NCR\nSpecialist in HD and airbrush makeup"} onChange={(e) => set("highlights", e.target.value)} />
        </Field>
        <Field label="Training and qualifications" hint={`One per line, up to ${MAX_ARTIST_POINTS}`} error={listError("artist.training")}>
          <TextArea value={draft.training} rows={3} placeholder={"Professional diploma in makeup and hair styling\nAirbrush makeup certification"} onChange={(e) => set("training", e.target.value)} />
        </Field>
        <Field label="Note" hint="Optional. Shown in a box at the end of the section." error={err("artist.note")}>
          <TextInput value={draft.artistNote} maxLength={300} placeholder="e.g. Uses professional, skin-safe products." onChange={(e) => set("artistNote", e.target.value)} />
        </Field>
      </FormSection>

      <FormSection title="Service area" tag="Optional">
        <p className="text-xs text-zinc-500">Fill in the paragraph or the places to show this section.</p>
        <Field label="Section heading" hint='Empty shows "Service area"' error={err("serviceAreaTitle")}>
          <TextInput value={draft.serviceAreaTitle} maxLength={60} placeholder="e.g. We come to you" onChange={(e) => set("serviceAreaTitle", e.target.value)} />
        </Field>
        <Field label="Where the vendor works" error={err("serviceArea")}>
          <TextArea
            value={draft.serviceArea}
            rows={3}
            maxLength={1000}
            placeholder="e.g. The team travels to homes and venues across Noida, Greater Noida and Noida Extension."
            onChange={(e) => set("serviceArea", e.target.value)}
          />
        </Field>
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-zinc-900">Places</span>
          <TagPicker
            value={draft.serviceAreaChips}
            onChange={(v) => set("serviceAreaChips", v)}
            groups={[]}
            max={MAX_SERVICE_AREA_CHIPS}
            error={listError("serviceAreaChips")}
            hint="Shown as chips, e.g. Noida, Greater Noida, Delhi NCR on request."
          />
        </div>
        <Field label="Small print" error={err("serviceAreaNote")}>
          <TextInput value={draft.serviceAreaNote} maxLength={200} placeholder="e.g. Travel charges, if any, are shared in your quote." onChange={(e) => set("serviceAreaNote", e.target.value)} />
        </Field>
      </FormSection>

      <FormSection title="Things to know" tag="Optional">
        <p className="text-xs text-zinc-500">Short cards such as Booking, Trial, Cancellation. The listing&apos;s other details follow them on phones.</p>
        {draft.thingsToKnow.map((row, i) => (
          <RowBox
            key={i}
            label="card"
            index={i}
            count={draft.thingsToKnow.length}
            onMove={(d) => set("thingsToKnow", moveAt(draft.thingsToKnow, i, d))}
            onRemove={() => set("thingsToKnow", removeAt(draft.thingsToKnow, i))}
            first={
              <Field label={`Card ${i + 1} title`} error={err(`thingsToKnow.${i}.title`)}>
                <TextInput value={row.title} maxLength={60} placeholder="e.g. Booking" onChange={(e) => set("thingsToKnow", updateAt(draft.thingsToKnow, i, { title: e.target.value }))} invalid={!!err(`thingsToKnow.${i}.title`)} />
              </Field>
            }
          >
            <Field label="Text" error={err(`thingsToKnow.${i}.text`)}>
              <TextArea value={row.text} rows={2} maxLength={400} placeholder="e.g. Book 2 to 3 months ahead. A 25% advance confirms your date." onChange={(e) => set("thingsToKnow", updateAt(draft.thingsToKnow, i, { text: e.target.value }))} invalid={!!err(`thingsToKnow.${i}.text`)} />
            </Field>
          </RowBox>
        ))}
        <AddButton label="Add card" count={draft.thingsToKnow.length} max={MAX_THINGS_TO_KNOW} onClick={() => set("thingsToKnow", [...draft.thingsToKnow, { title: "", text: "" }])} />
      </FormSection>

      <FormSection title="Questions people ask" tag="FAQ">
        {draft.faqs.map((row, i) => (
          <RowBox
            key={i}
            label="question"
            index={i}
            count={draft.faqs.length}
            onMove={(d) => set("faqs", moveAt(draft.faqs, i, d))}
            onRemove={() => set("faqs", removeAt(draft.faqs, i))}
            first={
              <Field label={`Question ${i + 1}`} error={err(`faqs.${i}.question`)}>
                <TextInput value={row.question} maxLength={200} placeholder="e.g. Do you travel to the venue?" onChange={(e) => set("faqs", updateAt(draft.faqs, i, { question: e.target.value }))} invalid={!!err(`faqs.${i}.question`)} />
              </Field>
            }
          >
            <Field label="Answer" error={err(`faqs.${i}.answer`)}>
              <TextArea value={row.answer} rows={2} maxLength={1000} onChange={(e) => set("faqs", updateAt(draft.faqs, i, { answer: e.target.value }))} invalid={!!err(`faqs.${i}.answer`)} />
            </Field>
          </RowBox>
        ))}
        <AddButton label="Add question" count={draft.faqs.length} max={MAX_LISTING_FAQS} onClick={() => set("faqs", [...draft.faqs, { question: "", answer: "" }])} />
      </FormSection>
    </>
  );
}
