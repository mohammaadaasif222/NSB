import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ChevronDown, FileText, Info, Sparkles } from "lucide-react";
import { formatInr, type ListingArtist, type ListingFaq, type ListingPackage, type ListingSummary, listingPlace, type ThingToKnow } from "@nsb/shared";
import { initialsOf } from "@/lib/format";
import { HighlightIcon, TrainingIcon } from "./profile-icons";

/**
 * The vendor page's Packages, Meet your artist, Service area, Things to know, FAQ, Included in
 * services and Similar vendors on tablets and desktops: the same content as the phone layout (vendor-mobile.tsx), in the desktop page's style.
 */

const avatar = "flex shrink-0 items-center justify-center rounded-full bg-[linear-gradient(145deg,#2a14e6,#0f0a66)] font-extrabold text-white";
const subhead = "text-xs font-bold tracking-wide text-muted uppercase";

/** "Included in services" chips, under the services. */
export function IncludedServices({ items }: { items: string[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className={subhead}>Included in services</h3>
      <ul className="flex flex-wrap gap-2">
        {items.map((t) => (
          <li key={t} className="rounded-lg border border-line bg-surface px-3 py-1.5 text-[13px] font-semibold text-ink">
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ArtistProfile({ artist }: { artist: ListingArtist }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3.5">
        <span className={`${avatar} size-15 text-lg`}>{initialsOf(artist.name)}</span>
        <div>
          <p className="text-lg font-bold text-ink">{artist.name}</p>
          {artist.role && <p className="text-sm text-muted">{artist.role}</p>}
        </div>
      </div>

      {artist.stats.length > 0 && (
        <dl className="grid max-w-xl divide-x divide-line rounded-2xl border border-line" style={{ gridTemplateColumns: `repeat(${artist.stats.length}, 1fr)` }}>
          {artist.stats.map((s, i) => (
            <div key={`${s.label}-${i}`} className="px-3 py-3.5 text-center">
              <dt className="text-2xl leading-tight font-bold text-brand">{s.value}</dt>
              <dd className="text-xs text-muted">{s.label}</dd>
            </div>
          ))}
        </dl>
      )}

      {(artist.highlights.length > 0 || artist.training.length > 0) && (
        <div className="grid gap-6 xl:grid-cols-2">
          {artist.highlights.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className={subhead}>Highlights</h3>
              <ul className="flex flex-col gap-2.5">
                {artist.highlights.map((t, i) => (
                  <li key={`${t}-${i}`} className="flex items-center gap-3 rounded-2xl border border-[#e1ddfa] bg-[linear-gradient(135deg,#f3f1ff,#fff_70%)] py-3 pr-4 pl-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(145deg,#2a14e6,#0f0a66)]">
                      <HighlightIcon index={i} />
                    </span>
                    <span className="text-sm font-semibold text-ink">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {artist.training.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className={subhead}>Training</h3>
              <ol className="flex flex-col gap-3">
                {artist.training.map((t, i) => (
                  <li key={`${t}-${i}`} className="flex items-start gap-3.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#f5bec0] bg-[#fff1f1]">
                      <TrainingIcon index={i} />
                    </span>
                    <span className="pt-2 text-sm font-semibold text-ink">{t}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {artist.note && <p className="rounded-xl bg-brand-soft px-4 py-3 text-sm font-semibold text-brand">{artist.note}</p>}
    </div>
  );
}

export function Faqs({ faqs }: { faqs: ListingFaq[] }) {
  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-white px-5">
      {faqs.map((f, i) => (
        <details key={`${f.question}-${i}`} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-[15px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
            {f.question}
            <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" strokeWidth={2.4} aria-hidden />
          </summary>
          <p className="pb-4 text-sm whitespace-pre-line text-muted">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}

/** Other listings in the category, as small cards. `href` builds each one's address. */
export function SimilarVendors({ items, href }: { items: ListingSummary[]; href: (slug: string) => string }) {
  return (
    <ul className="grid grid-cols-2 gap-3 xl:grid-cols-3">
      {items.map((s) => {
        const from = s.keyInfo.find((q) => q.value.startsWith("₹"));
        return (
          <li key={s.id}>
            <Link href={href(s.slug)} className="flex h-full flex-col rounded-2xl border border-line bg-white p-4 transition-colors hover:border-brand/40">
              <span className={`${avatar} mb-2.5 size-11 text-sm`}>{initialsOf(s.name)}</span>
              <span className="text-sm leading-snug font-semibold text-ink">{s.name}</span>
              <span className="mt-0.5 text-xs text-muted">{listingPlace(s)}</span>
              {from && <span className="mt-2 text-sm font-extrabold text-brand">from {from.value}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Package cards: photo, name, description, price and duration. Enquire opens the enquiry card
 * beside the page (#enquire). A package without its own photo uses one of `images`, in turn.
 */
export function Packages({ packages, note, images }: { packages: ListingPackage[]; note: string | null; images: string[] }) {
  let fallback = 0;
  return (
    <div className="flex flex-col gap-4">
      {note && <p className="-mt-1 text-sm text-muted">{note}</p>}
      <ul className="grid gap-3 xl:grid-cols-2">
        {packages.map((p, i) => {
          const image = p.imageUrl ?? (images.length ? images[fallback++ % images.length] : undefined);
          return (
            <li key={`${p.name}-${i}`} className="flex gap-3.5 rounded-2xl border border-line bg-white p-3.5">
              {image && <Image src={image} alt={p.name} width={88} height={88} sizes="88px" className="size-22 shrink-0 rounded-xl object-cover object-[center_20%]" />}
              <div className="flex min-w-0 flex-1 flex-col">
                <h3 className="text-[15px] leading-snug font-semibold text-ink">{p.name}</h3>
                {p.description && <p className="mt-0.5 line-clamp-2 text-[13px] text-muted">{p.description}</p>}
                <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                  <div>
                    {p.price !== null && (
                      <p className="text-[15px] font-extrabold text-brand">
                        {formatInr(p.price)} {p.priceNote && <span className="text-xs font-semibold text-muted">{p.priceNote}</span>}
                      </p>
                    )}
                    {p.duration && <p className="text-xs text-muted">{p.duration}</p>}
                  </div>
                  <a href="#enquire" className="shrink-0 rounded-full border border-brand px-3.5 py-1.5 text-[13px] font-bold text-brand hover:bg-brand-soft">
                    Enquire
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Service area: the paragraph, the places as chips, and the small print. */
export function ServiceArea({ text, chips, note }: { text: string | null; chips: string[]; note: string | null }) {
  return (
    <div className="flex flex-col gap-3">
      {text && <p className="text-base leading-7 whitespace-pre-line text-ink-soft">{text}</p>}
      {chips.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <li key={c} className="rounded-full border border-line bg-surface px-3.5 py-2 text-[13px] font-semibold text-ink">
              {c}
            </li>
          ))}
        </ul>
      )}
      {note && <p className="text-sm text-muted">{note}</p>}
    </div>
  );
}

const KNOW_ICONS = [CalendarDays, Sparkles, FileText, Info];

/** The vendor's "Things to know" cards, two per row. */
export function ThingsToKnow({ items }: { items: ThingToKnow[] }) {
  return (
    <ul className="grid gap-3 xl:grid-cols-2">
      {items.map((k, i) => {
        const Icon = KNOW_ICONS[i % KNOW_ICONS.length]!;
        return (
          <li key={`${k.title}-${i}`} className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-[0_2px_8px_rgba(26,6,210,0.1)]">
              <Icon className="size-[18px]" strokeWidth={2} aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{k.title}</p>
              <p className="mt-0.5 text-[13px] whitespace-pre-line text-muted">{k.text}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
