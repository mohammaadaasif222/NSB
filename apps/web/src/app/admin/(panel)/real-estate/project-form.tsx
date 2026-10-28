"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import {
  ADVERTISER_TYPES,
  type AdminProject,
  CONFIGURATION_SUGGESTIONS,
  formatPrice,
  LISTING_AREAS,
  LISTING_STATUSES,
  type ListingStatus,
  monthlyEmi,
  POSSESSION_STATUSES,
  PROJECT_AMENITIES,
  PROJECT_LIMITS,
  PROJECT_TAG_SUGGESTIONS,
  PROJECT_TERM_MONTHS,
  PROJECT_TYPE_LABELS,
  PROJECT_TYPES,
  type ProjectDuplicate,
  type ProjectFormInput,
  projectSlug,
  textLines,
  youTubeId,
} from "@nsb/shared";
import { Modal } from "@/components/admin/dialog";
import { Affix, Button, Field, Select, TextArea, TextInput, Toggle } from "@/components/admin/form";
import { ImageListUpload, useSessionUploads, useUploader } from "@/components/admin/image-upload";
import { TagPicker } from "@/components/admin/tag-picker";
import { useToast } from "@/components/admin/toast";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { adminClient } from "@/lib/admin-client";

/** The form's steps, as in the NSB Live Demo admin: each is a section of the project page. */
const STEPS = ["Basics", "Photos & Videos", "Overview", "Floor plans & pricing", "Amenities & specs", "Nearby & advertiser", "FAQs & SEO", "Publish"];

const STATUS_LABELS: Record<ListingStatus, string> = { draft: "Draft (hidden on the site)", live: "Live", hidden: "Hidden (taken off the site)" };

/** The step holding the field an API error belongs to. */
function stepOfError(path: string): number {
  const key = path.split(".")[0]!;
  if (["photos", "videoUrl", "videoChapters", "videos"].includes(key)) return 1;
  if (["units", "landArea", "towers", "about", "highlights"].includes(key)) return 2;
  if (key === "configurations") return 3;
  if (key === "amenities" || key === "specifications") return 4;
  if (key === "nearby" || key === "advertiser") return 5;
  if (["faqs", "metaTitle", "metaDescription"].includes(key)) return 6;
  if (["phone", "brochureUrl", "termStart", "termMonths", "status"].includes(key)) return 7;
  return 0;
}

// Form state: what the inputs hold. Numbers stay text while typing; the API parses them.
interface ConfigDraft {
  title: string;
  price: string;
  superArea: string;
  carpetArea: string;
  plan2dUrl: string | null;
  plan3dUrl: string | null;
}
// "type" is kept as saved on older projects; the form no longer asks for it.
type NearbyDraft = { name: string; type: string; minutes: string; km: string };
type VideoDraft = { title: string; url: string; chapters: string };
type FaqDraft = { question: string; answer: string };

const str = (n: number | null | undefined) => (n === null || n === undefined ? "" : String(n));
const emptyConfig = (title = ""): ConfigDraft => ({ title, price: "", superArea: "", carpetArea: "", plan2dUrl: null, plan3dUrl: null });
const todayInIndia = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
/** Digits only: "1,25,00,000" → "12500000". */
const digits = (v: string) => v.replace(/[,\s₹]/g, "");
const priceText = (n: number) => `₹${formatPrice(n)}`;

function draftOf(p?: AdminProject) {
  const predefined: readonly string[] = PROJECT_AMENITIES;
  return {
    type: p?.type ?? "apartments",
    area: p?.area ?? "Noida",
    name: p?.name ?? "",
    builder: p?.builder ?? "",
    locality: p?.locality ?? "",
    reraId: p?.reraId ?? "",
    possessionStatus: p?.possessionStatus ?? "Under Construction",
    possessionDate: p?.possessionDate ?? "",
    launchDate: p?.launchDate ?? "",
    isPremium: p?.isPremium ?? false,
    isFeatured: p?.isFeatured ?? false,
    tags: p?.tags ?? [],
    units: str(p?.units),
    landArea: p?.landArea ?? "",
    towers: str(p?.towers),
    about: p?.about ?? "",
    highlights: p?.highlights.join("\n") ?? "",
    configurations: p?.configurations.map((c) => ({ ...c, price: str(c.price), superArea: str(c.superArea), carpetArea: str(c.carpetArea) })) ?? [emptyConfig("2 BHK")],
    amenities: p?.amenities.filter((a) => predefined.includes(a)) ?? [],
    otherAmenities: p?.amenities.filter((a) => !predefined.includes(a)).join(", ") ?? "",
    specifications: p?.specifications ?? { flooring: "", fittings: "", walls: "" },
    nearby: p?.nearby.map((n) => ({ ...n, minutes: str(n.minutes), km: str(n.km) })) ?? [{ name: "", type: "", minutes: "", km: "" }],
    advertiser: {
      type: p?.advertiser.type ?? "builder",
      name: p?.advertiserType === "broker" ? p.advertiser.name : "",
      firm: p?.advertiser.firm ?? "",
      experienceYears: str(p?.advertiser.experienceYears),
      reraId: p?.advertiser.reraId ?? "",
      established: str(p?.advertiser.established),
      projectsDelivered: str(p?.advertiser.projectsDelivered),
      about: p?.advertiser.about ?? "",
    },
    faqs: p?.faqs ?? [],
    photos: p?.photos ?? [],
    videoUrl: p?.videoUrl ?? "",
    videoChapters: p?.videoChapters ?? "",
    videos: p?.videos ?? [],
    brochureUrl: p?.brochureUrl ?? "",
    phone: p?.phone ?? "",
    termStart: p?.termStart ?? todayInIndia(),
    termMonths: String(p?.termMonths ?? 12),
    status: p?.status ?? ("draft" as ListingStatus),
    metaTitle: p?.metaTitle ?? "",
    metaDescription: p?.metaDescription ?? "",
  };
}
type Draft = ReturnType<typeof draftOf> & { nearby: NearbyDraft[]; videos: VideoDraft[]; faqs: FaqDraft[]; configurations: ConfigDraft[] };

/** What the API gets: blank rows dropped, lists split, numbers as typed (the API parses them). */
function bodyOf(d: Draft): ProjectFormInput {
  const other = d.otherAmenities
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
  return {
    ...d,
    highlights: textLines(d.highlights).slice(0, PROJECT_LIMITS.highlights),
    configurations: d.configurations
      .filter((c) => c.title.trim())
      .map((c) => ({ ...c, price: digits(c.price), superArea: digits(c.superArea), carpetArea: digits(c.carpetArea) })),
    amenities: [...PROJECT_AMENITIES.filter((a) => d.amenities.includes(a)), ...other],
    nearby: d.nearby.filter((n) => n.name.trim()),
    faqs: d.faqs.filter((f) => f.question.trim() && f.answer.trim()),
    videos: d.videos.filter((v) => v.url.trim()),
    phone: d.phone.replace(/[\s-]/g, ""),
    termMonths: Number(d.termMonths),
  } as ProjectFormInput;
}

/** As on the demo: the checks that send you back to a step before anything is saved. */
function firstProblem(d: Draft, duplicate: ProjectDuplicate | null): [step: number, message: string] | null {
  if (!d.name.trim()) return [0, "Enter the project name"];
  if (!d.builder.trim()) return [0, "Enter the builder name"];
  if (!d.locality.trim()) return [0, "Enter the sector or address"];
  if (d.advertiser.type === "broker" && !d.advertiser.name.trim()) return [5, "Enter the broker name"];
  if (duplicate) return [0, `Already listed by ${duplicate.advertiserName}. One project can have only one listing.`];
  if (!d.configurations.some((c) => c.title.trim() && Number(digits(c.price)) > 0 && Number(digits(c.superArea)) > 0)) {
    return [3, "Add at least one configuration with price and area"];
  }
  if (d.phone.trim() && !/^[6-9]\d{9}$/.test(d.phone.replace(/[\s-]/g, ""))) return [7, "Enter a valid 10-digit contact number"];
  return null;
}

/** Which page sections are filled in, for the completeness meter (as on the demo). */
const completeness = (d: Draft): [string, boolean][] => [
  ["Photos", d.photos.length >= 3],
  ["Pricing", d.configurations.some((c) => c.title.trim() && Number(digits(c.price)) > 0)],
  ["Floor plan", d.configurations.some((c) => c.plan2dUrl || c.plan3dUrl)],
  ["Video", !!d.videoUrl.trim()],
  ["Brochure", !!d.brochureUrl.trim()],
];

/** Create (no `project`) or edit a real estate listing. These fields are the sections of the project page. */
export function ProjectForm({
  project,
  maxUploadBytes,
  planPrice,
  actions,
}: {
  project?: AdminProject;
  maxUploadBytes: number;
  /** The real estate plan price from Settings › Slot pricing. */
  planPrice: number;
  actions?: ReactNode;
}) {
  const router = useRouter();
  const toast = useToast();
  const { run, pending } = useAdminAction();
  const trackUpload = useSessionUploads();
  const [id, setId] = useState(project?.id);
  const [step, setStep] = useState(0);
  const [d, setDraft] = useState<Draft>(() => draftOf(project) as Draft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [found, setFound] = useState<ProjectDuplicate | null>(null);
  // A blank name has no duplicate, whatever the last check found.
  const duplicate = d.name.trim() ? found : null;
  const [saved, setSaved] = useState<AdminProject | null>(null);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((v) => ({ ...v, [key]: value }));
  const setRow = <K extends "configurations" | "nearby" | "videos" | "faqs">(key: K, i: number, patch: Partial<Draft[K][number]>) =>
    setDraft((v) => ({ ...v, [key]: (v[key] as Draft[K][number][]).map((r, j) => (j === i ? { ...r, ...patch } : r)) }));
  const addRow = <K extends "configurations" | "nearby" | "videos" | "faqs">(key: K, row: Draft[K][number]) =>
    setDraft((v) => ({ ...v, [key]: [...(v[key] as Draft[K][number][]), row] }));
  const removeRow = (key: "configurations" | "nearby" | "videos" | "faqs", i: number) =>
    setDraft((v) => ({ ...v, [key]: (v[key] as unknown[]).filter((_, j) => j !== i) }));
  const setAdvertiser = (patch: Partial<Draft["advertiser"]>) => setDraft((v) => ({ ...v, advertiser: { ...v.advertiser, ...patch } }));
  const setSpec = (key: keyof Draft["specifications"], value: string) => setDraft((v) => ({ ...v, specifications: { ...v.specifications, [key]: value } }));

  // "Already listed": checked while the name or location is typed.
  useEffect(() => {
    const name = d.name.trim();
    if (!name) return;
    const timer = setTimeout(() => {
      const query = new URLSearchParams({ name, area: d.area });
      if (id) query.set("exclude", id);
      adminClient
        .get<{ duplicate: ProjectDuplicate | null }>(`/admin/projects/duplicate?${query}`)
        .then((r) => setFound(r.duplicate))
        .catch(() => setFound(null));
    }, 350);
    return () => clearTimeout(timer);
  }, [d.name, d.area, id]);

  const goTo = (i: number) => {
    setStep(Math.max(0, Math.min(STEPS.length - 1, i)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  async function save(event?: FormEvent) {
    event?.preventDefault();
    const problem = firstProblem(d, duplicate);
    if (problem) {
      goTo(problem[0]);
      toast.error(problem[1]);
      return;
    }
    const body = bodyOf(d);
    const result = await run(() => (id ? adminClient.patch<AdminProject>(`/admin/projects/${id}`, body) : adminClient.post<AdminProject>("/admin/projects", body)), {
      refresh: false,
    });
    if (!result.ok) {
      const next = result.error.fieldErrors;
      setErrors(next);
      if (Object.keys(next).length) goTo(Math.min(...Object.keys(next).map(stepOfError)));
      return;
    }
    setErrors({});
    if (!id) {
      // Further saves edit this project; the address bar follows without leaving the form.
      setId(result.data.id);
      window.history.replaceState(null, "", `/admin/real-estate/${result.data.id}`);
    }
    setSaved(result.data);
  }

  const stepsWithErrors = [...new Set(Object.keys(errors).map(stepOfError))];
  const isBroker = d.advertiser.type === "broker";

  return (
    <>
      <div className="a-hd">
        <div>
          <h2>{project ? "Edit real estate listing" : "Add real estate listing"}</h2>
          <p>These fields are the sections of the project page. The preview updates as you type.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {actions}
          <Link href="/admin/real-estate" className="a-btn g">
            Cancel
          </Link>
          <Button onClick={() => void save()} pending={pending}>
            {pending ? "Saving…" : "Save listing"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] xl:items-start">
        <form onSubmit={save} className="a-card flex min-w-0 flex-col gap-5" noValidate>
          {Object.keys(errors).length > 0 && (
            <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              Please fix the highlighted fields in {stepsWithErrors.map((i) => STEPS[i]).join(", ")}.
              {Object.entries(errors).map(([path, message]) => (
                <span key={path} className="block text-xs">
                  {path}: {message}
                </span>
              ))}
            </div>
          )}

          <nav className="a-stp" aria-label="Form steps">
            {STEPS.map((label, i) => (
              <button key={label} type="button" aria-current={i === step ? "step" : undefined} onClick={() => goTo(i)}>
                {i + 1}. {label}
                {stepsWithErrors.includes(i) && <span className="a-stp-err" aria-label="has errors" />}
              </button>
            ))}
          </nav>

          {/* Every step stays mounted, so moving between steps keeps what was typed. */}
          <div hidden={step !== 0} className="grid gap-4 sm:grid-cols-2">
            {duplicate && (
              <p className="a-info e text-sm sm:col-span-2" role="alert">
                <b>Already listed.</b> {duplicate.name} in {duplicate.area} is listed by {duplicate.advertiserName} ({duplicate.status}). One project can have
                only one listing.
              </p>
            )}
            <Field label="Property type" error={errors.type}>
              <Select value={d.type} onChange={(e) => set("type", e.target.value as Draft["type"])}>
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {PROJECT_TYPE_LABELS[t]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Location" error={errors.area}>
              <Select value={d.area} onChange={(e) => set("area", e.target.value as Draft["area"])}>
                {LISTING_AREAS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </Select>
            </Field>
            <Field label="Project name *" hint="One project can be listed only once on NSB." error={errors.name}>
              <TextInput value={d.name} maxLength={120} placeholder="e.g. Skyline Heights" invalid={!!errors.name || !!duplicate} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Field label="Builder name *" error={errors.builder}>
              <TextInput value={d.builder} maxLength={120} placeholder="The builder of this project" invalid={!!errors.builder} onChange={(e) => set("builder", e.target.value)} />
            </Field>
            <Field label="Sector / address *" error={errors.locality}>
              <TextInput value={d.locality} maxLength={120} placeholder="e.g. Sector 150" invalid={!!errors.locality} onChange={(e) => set("locality", e.target.value)} />
            </Field>
            <Field label="RERA ID" error={errors.reraId}>
              <TextInput value={d.reraId} maxLength={60} placeholder="UPRERAPRJ…" onChange={(e) => set("reraId", e.target.value)} />
            </Field>
            <Field label="Possession status" error={errors.possessionStatus}>
              <Select value={d.possessionStatus} onChange={(e) => set("possessionStatus", e.target.value as Draft["possessionStatus"])}>
                {POSSESSION_STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </Field>
            <Field label="Possession date" error={errors.possessionDate}>
              <TextInput value={d.possessionDate} maxLength={40} placeholder="e.g. Dec 2028" onChange={(e) => set("possessionDate", e.target.value)} />
            </Field>
            <Field label="Launch date" error={errors.launchDate}>
              <TextInput value={d.launchDate} maxLength={40} placeholder="e.g. Jan 2025" onChange={(e) => set("launchDate", e.target.value)} />
            </Field>
            <div className="flex flex-col gap-2 text-[13px] font-semibold">
              Listing page
              <Toggle label="Show as Premium (top of the listing page)" showLabel checked={d.isPremium} onChange={(v) => set("isPremium", v)} />
              <Toggle label="Show Featured badge (any number of projects)" showLabel checked={d.isFeatured} onChange={(v) => set("isFeatured", v)} />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-[13px] font-semibold">Tags</span>
              <TagPicker
                value={d.tags}
                onChange={(tags) => set("tags", tags)}
                groups={[{ title: "Suggested", tags: [...PROJECT_TAG_SUGGESTIONS] }]}
                max={PROJECT_LIMITS.tags}
                error={errors.tags}
                hint="Visitors find this project by searching any of its tags."
              />
            </div>
          </div>

          <div hidden={step !== 1} className="flex flex-col gap-4">
            <p className="text-xs text-zinc-500">
              First photo is the cover. Crop each photo with a live preview before upload. Up to {PROJECT_LIMITS.photos} photos; the page shows a gallery
              of 5 and a “Show all photos” view.
            </p>
            <ImageListUpload
              label="Photos"
              slot="listing"
              crop
              value={d.photos}
              onChange={(urls) => set("photos", urls)}
              onUploaded={trackUpload}
              maxBytes={maxUploadBytes}
              max={PROJECT_LIMITS.photos}
            />
            <Field label="Main video (project reel or walkthrough)" hint="A YouTube link. Plays first on the page. No video? The Videos tab stays hidden." error={errors.videoUrl ?? videoError(d.videoUrl)}>
              <TextInput type="url" inputMode="url" value={d.videoUrl} maxLength={300} placeholder="https://youtube.com/…" onChange={(e) => set("videoUrl", e.target.value)} />
            </Field>
            <Chapters label="Add chapters for the main video (optional)" value={d.videoChapters} onChange={(v) => set("videoChapters", v)} placeholder={"0:00 Entrance and elevation\n2:10 Clubhouse and pool"} />
            <div className="flex flex-col gap-3">
              <span className="text-[13px] font-semibold">More videos (optional, up to {PROJECT_LIMITS.videos})</span>
              {d.videos.map((v, i) => (
                <div key={i} className="a-hc">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Title">
                      <TextInput value={v.title} maxLength={80} placeholder="Sample flat tour" onChange={(e) => setRow("videos", i, { title: e.target.value })} />
                    </Field>
                    <Field label="Video link" error={errors[`videos.${i}.url`] ?? videoError(v.url)}>
                      <TextInput type="url" inputMode="url" value={v.url} maxLength={300} placeholder="https://youtube.com/…" onChange={(e) => setRow("videos", i, { url: e.target.value })} />
                    </Field>
                  </div>
                  <Chapters label="Chapters (optional)" value={v.chapters} onChange={(c) => setRow("videos", i, { chapters: c })} placeholder="0:00 Living room" />
                  <Button variant="secondary" className="self-start" onClick={() => removeRow("videos", i)}>
                    Remove
                  </Button>
                </div>
              ))}
              {d.videos.length < PROJECT_LIMITS.videos && (
                <Button variant="secondary" className="self-start" onClick={() => addRow("videos", { title: "", url: "", chapters: "" })}>
                  <Plus className="size-4" aria-hidden /> Add another video
                </Button>
              )}
            </div>
          </div>

          <div hidden={step !== 2} className="grid gap-4 sm:grid-cols-3">
            <Field label="Project units" error={errors.units}>
              <TextInput inputMode="numeric" value={d.units} placeholder="640" onChange={(e) => set("units", e.target.value)} invalid={!!errors.units} />
            </Field>
            <Field label="Project area" error={errors.landArea}>
              <TextInput value={d.landArea} maxLength={40} placeholder="e.g. 6.5 Acres" onChange={(e) => set("landArea", e.target.value)} />
            </Field>
            <Field label="Number of towers" error={errors.towers}>
              <TextInput inputMode="numeric" value={d.towers} placeholder="4" onChange={(e) => set("towers", e.target.value)} invalid={!!errors.towers} />
            </Field>
            <Field label="About the project" error={errors.about} className="sm:col-span-3">
              <TextArea rows={6} maxLength={5000} value={d.about} placeholder="Write 2 short paragraphs. Leave a blank line between paragraphs." onChange={(e) => set("about", e.target.value)} />
            </Field>
            <Field label="Highlights (shown as 8 points)" hint="One highlight per line, up to 8." error={errors.highlights} className="sm:col-span-3">
              <TextArea
                rows={5}
                value={d.highlights}
                placeholder={"Mivan aluminium formwork\nDouble-height entrance lobby\nJust 2.8 km from metro station"}
                onChange={(e) => set("highlights", e.target.value)}
              />
            </Field>
          </div>

          <div hidden={step !== 3} className="flex flex-col gap-4">
            <p className="text-sm text-zinc-500">Add every configuration. The page shows the price range, rate per sq ft and EMI automatically.</p>
            {errors.configurations && <p className="text-sm text-red-600">{errors.configurations}</p>}
            {d.configurations.map((c, i) => (
              <div key={i} className="a-hc">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Configuration" error={errors[`configurations.${i}.title`]}>
                    <TextInput list="config-suggestions" value={c.title} maxLength={40} placeholder="3 BHK" onChange={(e) => setRow("configurations", i, { title: e.target.value })} />
                  </Field>
                  <Field label="Price (₹)" hint={Number(digits(c.price)) > 0 ? priceText(Number(digits(c.price))) : undefined} error={errors[`configurations.${i}.price`]}>
                    <Affix before="₹">
                      <TextInput inputMode="numeric" className="pl-8" value={c.price} placeholder="12500000" onChange={(e) => setRow("configurations", i, { price: e.target.value })} />
                    </Affix>
                  </Field>
                  <Field label="Super area (sq ft)" error={errors[`configurations.${i}.superArea`]}>
                    <TextInput inputMode="numeric" value={c.superArea} placeholder="1450" onChange={(e) => setRow("configurations", i, { superArea: e.target.value })} />
                  </Field>
                  <Field label="Carpet area (sq ft)" error={errors[`configurations.${i}.carpetArea`]}>
                    <TextInput inputMode="numeric" value={c.carpetArea} placeholder="1080" onChange={(e) => setRow("configurations", i, { carpetArea: e.target.value })} />
                  </Field>
                </div>
                <div className="a-pgrid">
                  <PlanBox label="2D floor plan" url={c.plan2dUrl} onChange={(url) => setRow("configurations", i, { plan2dUrl: url })} onUploaded={trackUpload} maxBytes={maxUploadBytes} />
                  <PlanBox label="3D floor plan" url={c.plan3dUrl} onChange={(url) => setRow("configurations", i, { plan3dUrl: url })} onUploaded={trackUpload} maxBytes={maxUploadBytes} />
                </div>
                {d.configurations.length > 1 && (
                  <Button variant="secondary" className="self-start" onClick={() => removeRow("configurations", i)}>
                    Remove this configuration
                  </Button>
                )}
              </div>
            ))}
            <datalist id="config-suggestions">
              {CONFIGURATION_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            {d.configurations.length < PROJECT_LIMITS.configurations && (
              <Button variant="secondary" className="self-start" onClick={() => addRow("configurations", emptyConfig())}>
                <Plus className="size-4" aria-hidden /> Add configuration
              </Button>
            )}
            <PricingNote configurations={d.configurations} />
          </div>

          <div hidden={step !== 4} className="flex flex-col gap-4">
            <label className="flex w-fit items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                className="size-4"
                checked={d.amenities.length === PROJECT_AMENITIES.length}
                // Part-ticked while only some amenities are chosen.
                ref={(el) => {
                  if (el) el.indeterminate = d.amenities.length > 0 && d.amenities.length < PROJECT_AMENITIES.length;
                }}
                onChange={(e) => set("amenities", e.target.checked ? [...PROJECT_AMENITIES] : [])}
              />
              Select all amenities
            </label>
            <fieldset className="a-amg2">
              <legend className="sr-only">Amenities</legend>
              {PROJECT_AMENITIES.map((a) => (
                <label key={a} className="a-am2">
                  <input
                    type="checkbox"
                    checked={d.amenities.includes(a)}
                    onChange={() => set("amenities", d.amenities.includes(a) ? d.amenities.filter((x) => x !== a) : [...d.amenities, a])}
                  />
                  {a}
                </label>
              ))}
            </fieldset>
            <Field label="Other amenities (comma separated)" error={errors.amenities}>
              <TextInput value={d.otherAmenities} placeholder="Rooftop lounge, Pet spa" onChange={(e) => set("otherAmenities", e.target.value)} />
            </Field>
            <h4 className="mt-2 font-extrabold">Specifications</h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Flooring" hint="One per line as Label: value" error={errors["specifications.flooring"]}>
                <TextArea rows={4} value={d.specifications.flooring} placeholder={"Living/Dining: Vitrified tiles\nBedrooms: Laminated wooden"} onChange={(e) => setSpec("flooring", e.target.value)} />
              </Field>
              <Field label="Fittings" error={errors["specifications.fittings"]}>
                <TextArea rows={4} value={d.specifications.fittings} placeholder={"Toilets: CP fittings, EWC\nKitchen: Granite platform"} onChange={(e) => setSpec("fittings", e.target.value)} />
              </Field>
              <Field label="Walls" error={errors["specifications.walls"]}>
                <TextArea rows={4} value={d.specifications.walls} placeholder={"Interior: Acrylic emulsion\nExterior: Textured paint"} onChange={(e) => setSpec("walls", e.target.value)} />
              </Field>
            </div>
          </div>

          <div hidden={step !== 5} className="flex flex-col gap-4">
            {d.nearby.map((n, i) => (
              <div key={i} className="a-hc">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Place or landmark" error={errors[`nearby.${i}.name`]}>
                    <TextInput value={n.name} maxLength={80} placeholder="e.g. Kidzee School, Sector 148 Metro" onChange={(e) => setRow("nearby", i, { name: e.target.value })} />
                  </Field>
                  <Field label="Minutes by car" error={errors[`nearby.${i}.minutes`]}>
                    <TextInput inputMode="numeric" value={n.minutes} placeholder="6" onChange={(e) => setRow("nearby", i, { minutes: e.target.value })} />
                  </Field>
                  <Field label="Distance (km)" error={errors[`nearby.${i}.km`]}>
                    <TextInput inputMode="decimal" value={n.km} placeholder="2.5" onChange={(e) => setRow("nearby", i, { km: e.target.value })} />
                  </Field>
                </div>
                <Button variant="secondary" className="self-start" onClick={() => removeRow("nearby", i)}>
                  Remove
                </Button>
              </div>
            ))}
            {d.nearby.length < PROJECT_LIMITS.nearby && (
              <Button variant="secondary" className="self-start" onClick={() => addRow("nearby", { name: "", type: "", minutes: "", km: "" })}>
                <Plus className="size-4" aria-hidden /> Add place
              </Button>
            )}
            <div className="mt-3 flex flex-col gap-1 border-t border-zinc-200 pt-4">
              <h4 className="font-extrabold">Who is advertising this project?</h4>
              <p className="text-[13px] leading-snug text-zinc-500">
                Shown on the project page under “Listed by”. A broker can list many projects, but each project has only one advertiser.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Advertiser type" className="sm:col-span-2">
                <Select value={d.advertiser.type} onChange={(e) => setAdvertiser({ type: e.target.value as Draft["advertiser"]["type"] })}>
                  {ADVERTISER_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t === "builder" ? "Builder (the builder is advertising)" : "Broker (a broker is advertising)"}
                    </option>
                  ))}
                </Select>
              </Field>
              {isBroker ? (
                <>
                  <Field label="Broker name *" error={errors["advertiser.name"]}>
                    <TextInput value={d.advertiser.name} maxLength={120} placeholder="Name of the broker" invalid={!!errors["advertiser.name"]} onChange={(e) => setAdvertiser({ name: e.target.value })} />
                  </Field>
                  <Field label="Firm or agency" error={errors["advertiser.firm"]}>
                    <TextInput value={d.advertiser.firm} maxLength={120} placeholder="e.g. Prime Estates" onChange={(e) => setAdvertiser({ firm: e.target.value })} />
                  </Field>
                  <Field label="Experience (years)" error={errors["advertiser.experienceYears"]}>
                    <TextInput inputMode="numeric" value={d.advertiser.experienceYears} placeholder="8" onChange={(e) => setAdvertiser({ experienceYears: e.target.value })} />
                  </Field>
                  <Field label="Broker RERA ID" error={errors["advertiser.reraId"]}>
                    <TextInput value={d.advertiser.reraId} maxLength={60} placeholder="UPRERAAGT…" onChange={(e) => setAdvertiser({ reraId: e.target.value })} />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Established (year)" error={errors["advertiser.established"]}>
                    <TextInput inputMode="numeric" value={d.advertiser.established} placeholder="2005" onChange={(e) => setAdvertiser({ established: e.target.value })} />
                  </Field>
                  <Field label="Projects delivered" error={errors["advertiser.projectsDelivered"]}>
                    <TextInput inputMode="numeric" value={d.advertiser.projectsDelivered} placeholder="9" onChange={(e) => setAdvertiser({ projectsDelivered: e.target.value })} />
                  </Field>
                </>
              )}
              <Field label={isBroker ? "About the broker" : "About the builder"} error={errors["advertiser.about"]} className="sm:col-span-2">
                <TextArea
                  rows={3}
                  maxLength={1000}
                  value={d.advertiser.about}
                  placeholder={isBroker ? "Short description of the broker…" : "Short description of the builder…"}
                  onChange={(e) => setAdvertiser({ about: e.target.value })}
                />
              </Field>
            </div>
          </div>

          <div hidden={step !== 6} className="flex flex-col gap-4">
            <p className="a-info text-sm">Price, possession, RERA and builder questions are created automatically. Add your own below.</p>
            {d.faqs.map((f, i) => (
              <div key={i} className="a-hc">
                <Field label="Question" error={errors[`faqs.${i}.question`]}>
                  <TextInput value={f.question} maxLength={200} placeholder="Is there a home loan facility?" onChange={(e) => setRow("faqs", i, { question: e.target.value })} />
                </Field>
                <Field label="Answer" error={errors[`faqs.${i}.answer`]}>
                  <TextArea rows={2} maxLength={1000} value={f.answer} placeholder="Yes…" onChange={(e) => setRow("faqs", i, { answer: e.target.value })} />
                </Field>
                <Button variant="secondary" className="self-start" onClick={() => removeRow("faqs", i)}>
                  Remove
                </Button>
              </div>
            ))}
            {d.faqs.length < PROJECT_LIMITS.faqs && (
              <Button variant="secondary" className="self-start" onClick={() => addRow("faqs", { question: "", answer: "" })}>
                <Plus className="size-4" aria-hidden /> Add FAQ
              </Button>
            )}
            <h4 className="mt-2 font-extrabold">SEO</h4>
            <Field label="URL slug" hint="Made from the project name and location.">
              <TextInput value={`/real-estate/${projectSlug(d.name, d.area)}`} readOnly />
            </Field>
            <Field label="Meta title" hint="Leave blank to use the project name and sector." error={errors.metaTitle}>
              <TextInput value={d.metaTitle} maxLength={70} placeholder="Auto-created from the project name" onChange={(e) => set("metaTitle", e.target.value)} />
            </Field>
            <Field label="Meta description" hint="Leave blank to describe the configurations, price and possession." error={errors.metaDescription}>
              <TextArea rows={2} maxLength={170} value={d.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} />
            </Field>
          </div>

          <div hidden={step !== 7} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact number (shown after View Number)" hint="Leads from the site go to this number" error={errors.phone}>
                <Affix before="+91">
                  <TextInput type="tel" inputMode="numeric" className="pl-12" value={d.phone} maxLength={14} placeholder="9876543210" invalid={!!errors.phone} onChange={(e) => set("phone", e.target.value)} />
                </Affix>
              </Field>
              <Field label="Brochure link (PDF)" hint="Visitors get it after sharing their number" error={errors.brochureUrl}>
                <TextInput type="url" inputMode="url" value={d.brochureUrl} maxLength={500} placeholder="https://…/brochure.pdf" invalid={!!errors.brochureUrl} onChange={(e) => set("brochureUrl", e.target.value)} />
              </Field>
              <Field label="Term starts" error={errors.termStart}>
                <TextInput type="date" value={d.termStart} onChange={(e) => set("termStart", e.target.value || todayInIndia())} />
              </Field>
              <Field label="Term length" error={errors.termMonths}>
                <Select value={d.termMonths} onChange={(e) => set("termMonths", e.target.value)}>
                  {PROJECT_TERM_MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m === 12 ? "12 months (real estate)" : `${m} months`}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Status" error={errors.status}>
                <Select value={d.status} onChange={(e) => set("status", e.target.value as ListingStatus)}>
                  {LISTING_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <p className="a-info text-sm">
              Plan: ₹{planPrice.toLocaleString("en-IN")} for 1 year. 1 project, 1 broker. Leads go only to this {isBroker ? "broker" : "builder"}.
            </p>
            <Button type="submit" className="self-start" pending={pending}>
              {pending ? "Saving…" : "Save listing"}
            </Button>
          </div>

          <div className="flex justify-between gap-2 border-t border-zinc-200 pt-4">
            <Button variant="secondary" onClick={() => goTo(step - 1)} disabled={step === 0}>
              Back
            </Button>
            {step < STEPS.length - 1 && (
              <Button variant="secondary" className="a-next" onClick={() => goTo(step + 1)}>
                Next
              </Button>
            )}
          </div>
        </form>

        <Preview draft={d} />
      </div>

      <Modal open={saved !== null} onClose={() => setSaved(null)} title="Listing saved" size="sm">
        <p className="text-sm text-zinc-600">
          {saved?.status === "live" ? "It is live on the site now." : "Saved as a draft. It will not show on the site until the status is Live."}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => router.push("/admin/real-estate")}>
            Back to listings
          </Button>
          {saved?.status === "live" && (
            <a className="a-btn" href={`/real-estate/${saved.slug}`} target="_blank" rel="noreferrer">
              View on site
            </a>
          )}
        </div>
      </Modal>
    </>
  );
}

const videoError = (url: string) => (url.trim() && !youTubeId(url) ? "Paste a YouTube link (copy it from the Share button on YouTube)." : undefined);

function Chapters({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <details className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5" open={!!value.trim()}>
      <summary className="cursor-pointer text-sm font-semibold">{label}</summary>
      <TextArea rows={3} maxLength={2000} value={value} placeholder={placeholder} aria-label={label} onChange={(e) => onChange(e.target.value)} />
      <span className="mt-1 block text-xs text-zinc-500">One chapter per line: the start time, then its title.</span>
    </details>
  );
}

/** A floor plan image: upload, replace or remove. */
function PlanBox({
  label,
  url,
  onChange,
  onUploaded,
  maxBytes,
}: {
  label: string;
  url: string | null;
  onChange: (url: string | null) => void;
  onUploaded: (url: string) => void;
  maxBytes: number;
}) {
  const input = useRef<HTMLInputElement>(null);
  const { upload, pending, error } = useUploader("floor-plan", maxBytes, onUploaded);
  return (
    <div className="a-pbx">
      <div className="a-pth2">{url ? <Image src={url} alt="" fill unoptimized sizes="84px" /> : pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : "No image"}</div>
      <div className="min-w-0">
        <b className="text-sm">{label}</b>
        <div className="mt-1.5 flex gap-1.5">
          <Button variant="secondary" className="px-3! py-1! text-xs!" disabled={pending} onClick={() => input.current?.click()}>
            {url ? "Replace" : "Upload"}
          </Button>
          {url && (
            <Button variant="secondary" className="px-3! py-1! text-xs!" disabled={pending} onClick={() => onChange(null)}>
              Remove
            </Button>
          )}
        </div>
        {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label={`Upload ${label}`}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          const uploaded = await upload(file);
          if (uploaded) onChange(uploaded);
        }}
      />
    </div>
  );
}

/** What the project page will show, from the priced configurations. */
function PricingNote({ configurations }: { configurations: ConfigDraft[] }) {
  const priced = configurations.map((c) => ({ price: Number(digits(c.price)), superArea: Number(digits(c.superArea)) })).filter((c) => c.price > 0);
  if (!priced.length) return <p className="a-info text-sm">Add a price to see the range, rate and EMI.</p>;
  const min = Math.min(...priced.map((c) => c.price));
  const max = Math.max(...priced.map((c) => c.price));
  const rates = priced.filter((c) => c.superArea > 0).map((c) => c.price / c.superArea);
  return (
    <p className="a-info text-sm">
      The page will show: {priceText(min)}
      {max > min && ` – ${priceText(max)}`}
      {rates.length > 0 && ` · ₹${(rates.reduce((a, b) => a + b, 0) / rates.length / 1000).toFixed(1)}K/sq.ft avg`} · EMI from about ₹{Math.round(monthlyEmi(min) / 1000)}K
    </p>
  );
}

function Preview({ draft: d }: { draft: Draft }) {
  const prices = d.configurations.map((c) => Number(digits(c.price))).filter((n) => n > 0);
  const min = prices.length ? Math.min(...prices) : 0;
  const max = prices.length ? Math.max(...prices) : 0;
  const items = completeness(d);
  const done = items.filter(([, ok]) => ok).length;
  const percent = Math.round((done / items.length) * 100);
  const missing = items.find(([, ok]) => !ok)?.[0];
  let next: ReactNode = "This page is complete.";
  if (missing === "Video") next = "Add a video to unlock the Videos tab on the page.";
  else if (missing) next = `Next: add ${missing.toLowerCase()}.`;

  return (
    <aside className="a-card a-pc xl:sticky xl:top-20" aria-label="Live preview">
      <h3 className="mb-3! text-base font-extrabold">Live preview</h3>
      <div className="im">
        {d.photos[0] && <Image src={d.photos[0]} alt="" fill unoptimized sizes="352px" />}
        <span className={`a-pl ${d.status}`}>{d.status}</span>
      </div>
      <h4>{d.name.trim() || "Project name"}</h4>
      <p>
        {d.builder.trim() || "Builder"} · {PROJECT_TYPE_LABELS[d.type]}
      </p>
      <p>
        {d.locality.trim() && `${d.locality.trim()}, `}
        {d.area}
      </p>
      <div className="pr">
        <b>{prices.length ? (min === max ? priceText(min) : `${priceText(min)} – ${priceText(max)}`) : "Add pricing"}</b>
        <span className="a-btn s">View Number</span>
      </div>

      <div className="mt-4 border-t border-zinc-200 pt-4">
        <h3 className="mb-2.5! text-[15px] font-extrabold">
          Page completeness <span className="text-(--admin-accent)">{percent}%</span>
        </h3>
        <div className="a-meter" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Page completeness">
          <i style={{ width: `${percent}%` }} />
        </div>
        <ul className="flex flex-col gap-1 text-sm">
          {items.map(([label, ok]) => (
            <li key={label} className="flex items-center gap-2 font-semibold">
              <span className={ok ? "text-(--admin-ok)" : "text-zinc-500"} aria-hidden>
                {ok ? "✓" : "○"}
              </span>
              {label}
              <span className="sr-only">{ok ? "done" : "missing"}</span>
            </li>
          ))}
        </ul>
        <p className="a-info mt-2 text-[13px]">{next}</p>
      </div>
    </aside>
  );
}
