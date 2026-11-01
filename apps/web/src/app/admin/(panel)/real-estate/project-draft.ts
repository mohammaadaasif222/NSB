import type { Dispatch, SetStateAction } from "react";
import {
  type AdminProject,
  formatPrice,
  LISTING_AREAS,
  type ListingStatus,
  mobileSchema,
  PROJECT_AMENITIES,
  PROJECT_LIMITS,
  type ProjectDuplicate,
  type ProjectFormInput,
  textLines,
  youTubeId,
} from "@nsb/shared";
import { todayInIndia } from "@nsb/shared/client";

/** The form's steps, as in the NSB Live Demo admin: each is a section of the project page. */
export const STEPS = ["Basics", "Photos & Videos", "Overview", "Floor plans & pricing", "Amenities & specs", "Nearby & advertiser", "FAQs & SEO", "Publish"];

/** The step holding the field an API error belongs to. */
export function stepOfError(path: string): number {
  const key = path.split(".")[0]!;
  if (["photos", "videoUrl", "videoChapters", "videos"].includes(key)) return 1;
  if (["units", "landArea", "towers", "about", "highlights"].includes(key)) return 2;
  if (key === "configurations") return 3;
  if (key === "amenities" || key === "specifications") return 4;
  if (key === "nearby" || key === "advertiser") return 5;
  if (["faqs", "slug", "metaTitle", "metaDescription"].includes(key)) return 6;
  if (["phone", "brochureUrl", "termStart", "termMonths", "status"].includes(key)) return 7;
  return 0;
}

// Form state: what the inputs hold. Numbers stay text while typing; the API parses them.
export interface ConfigDraft {
  title: string;
  price: string;
  superArea: string;
  carpetArea: string;
  plan2dUrl: string | null;
  plan3dUrl: string | null;
}
// "type" is kept as saved on older projects; the form no longer asks for it.
type NearbyDraft = { name: string; type: string; minutes: string; km: string };

const str = (n: number | null | undefined) => (n === null || n === undefined ? "" : String(n));
export const emptyConfig = (title = ""): ConfigDraft => ({ title, price: "", superArea: "", carpetArea: "", plan2dUrl: null, plan3dUrl: null });
/** Digits only: "1,25,00,000" → "12500000". */
export const digits = (v: string) => v.replace(/[,\s₹]/g, "");
export const priceText = (n: number) => `₹${formatPrice(n)}`;

export const videoError = (url: string) => (url.trim() && !youTubeId(url) ? "Paste a YouTube link (copy it from the Share button on YouTube)." : undefined);

export function draftOf(p?: AdminProject) {
  const predefined: readonly string[] = PROJECT_AMENITIES;
  return {
    type: p?.type ?? "apartments",
    // A saved area is plain text; the select offers only LISTING_AREAS, and the value is sent back as it was.
    area: (p?.area ?? "Noida") as (typeof LISTING_AREAS)[number],
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
    configurations: p?.configurations.map((c): ConfigDraft => ({ ...c, price: str(c.price), superArea: str(c.superArea), carpetArea: str(c.carpetArea) })) ?? [emptyConfig("2 BHK")],
    amenities: p?.amenities.filter((a) => predefined.includes(a)) ?? [],
    otherAmenities: p?.amenities.filter((a) => !predefined.includes(a)).join(", ") ?? "",
    specifications: p?.specifications ?? { flooring: "", fittings: "", walls: "" },
    nearby: p?.nearby.map((n): NearbyDraft => ({ ...n, minutes: str(n.minutes), km: str(n.km) })) ?? [{ name: "", type: "", minutes: "", km: "" }],
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
    /** Only sent when creating; a saved project keeps its slug. */
    slug: "",
  };
}
export type Draft = ReturnType<typeof draftOf>;

const cleanPhone = (phone: string) => phone.replace(/[\s-]/g, "");

/** What the API gets: blank rows dropped, lists split, numbers as typed (the API parses them). */
export function bodyOf(d: Draft): ProjectFormInput {
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
    phone: cleanPhone(d.phone),
    termMonths: Number(d.termMonths),
  };
}

/** As on the demo: the checks that send you back to a step before anything is saved. */
export function firstProblem(d: Draft, duplicate: ProjectDuplicate | null): [step: number, message: string] | null {
  if (!d.name.trim()) return [0, "Enter the project name"];
  if (!d.builder.trim()) return [0, "Enter the builder name"];
  if (!d.locality.trim()) return [0, "Enter the sector or address"];
  if (d.advertiser.type === "broker" && !d.advertiser.name.trim()) return [5, "Enter the broker name"];
  if (duplicate) return [0, `Already listed by ${duplicate.advertiserName}. One project can have only one listing.`];
  if (!d.configurations.some((c) => c.title.trim() && Number(digits(c.price)) > 0 && Number(digits(c.superArea)) > 0)) {
    return [3, "Add at least one configuration with price and area"];
  }
  // This form takes the bare 10 digits: the schema strips a +91 / 0 prefix, so a prefixed number comes back changed.
  const phone = cleanPhone(d.phone);
  if (d.phone.trim() && mobileSchema.safeParse(phone).data !== phone) return [7, "Enter a valid 10-digit contact number"];
  return null;
}

/** Which page sections are filled in, for the completeness meter (as on the demo). */
export const completeness = (d: Pick<Draft, "photos" | "configurations" | "videoUrl" | "brochureUrl">): [string, boolean][] => [
  ["Photos", d.photos.length >= 3],
  ["Pricing", d.configurations.some((c) => c.title.trim() && Number(digits(c.price)) > 0)],
  ["Floor plan", d.configurations.some((c) => c.plan2dUrl || c.plan3dUrl)],
  ["Video", !!d.videoUrl.trim()],
  ["Brochure", !!d.brochureUrl.trim()],
];

type RowKey = "configurations" | "nearby" | "videos" | "faqs";

/** The updates the steps make to the draft. They use only `setDraft`, so one set lasts the form's life. */
export function draftEditors(setDraft: Dispatch<SetStateAction<Draft>>) {
  return {
    set: <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((v) => ({ ...v, [key]: value })),
    setRow: <K extends RowKey>(key: K, i: number, patch: Partial<Draft[K][number]>) =>
      setDraft((v) => ({ ...v, [key]: (v[key] as Draft[K][number][]).map((r, j) => (j === i ? { ...r, ...patch } : r)) })),
    addRow: <K extends RowKey>(key: K, row: Draft[K][number]) => setDraft((v) => ({ ...v, [key]: [...(v[key] as Draft[K][number][]), row] })),
    removeRow: (key: RowKey, i: number) => setDraft((v) => ({ ...v, [key]: (v[key] as unknown[]).filter((_, j) => j !== i) })),
    setAdvertiser: (patch: Partial<Draft["advertiser"]>) => setDraft((v) => ({ ...v, advertiser: { ...v.advertiser, ...patch } })),
    setSpec: (key: keyof Draft["specifications"], value: string) => setDraft((v) => ({ ...v, specifications: { ...v.specifications, [key]: value } })),
  };
}

/** What every step gets. `values` is the part of the draft the step reads (see sameStepProps). */
export interface ProjectStepProps<K extends keyof Draft> {
  values: Pick<Draft, K>;
  hidden: boolean;
  errors: Record<string, string>;
  edit: ReturnType<typeof draftEditors>;
}
