import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, ChevronRight, Crown, MapPin, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import { listingPlace, parseService, WEDDING_EVENT_TYPES } from "@nsb/shared";
import { EnquiryCard } from "@/components/site/listing/enquiry-form";
import { ExpandableList, ReadMore } from "@/components/site/listing/expandable";
import { Gallery } from "@/components/site/listing/gallery";
import { GoogleRatingBadge, ReviewsSummary } from "@/components/site/listing/reviews";
import { ServiceIcon } from "@/components/site/listing/service-icon";
import { Videos } from "@/components/site/listing/videos";
import { getCategory, getListing, listingPath } from "@/lib/catalog";
import { CATEGORY_PAGES_ENABLED, COMING_SOON_METADATA } from "@/lib/flags";
import { getSiteSettings, whatsappHref } from "@/lib/site-settings";

/** Vendor profile — one template for every listing, laid out after the ezweddingz venue page. */

type Props = PageProps<"/[vertical]/[category]/[listing]">;

/** Loads the listing and redirects to its canonical URL if the path segments don't match. */
async function load(params: Props["params"]) {
  const { vertical, category: categorySlug, listing: slug } = await params;
  const listing = await getListing(slug);
  const category = await getCategory(listing.category.slug);
  if (!category.parent) notFound();
  if (category.parent.slug !== vertical || category.slug !== categorySlug) {
    redirect(listingPath(category.parent.slug, category.slug, listing.slug));
  }
  return { listing, category, vertical: category.parent };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!CATEGORY_PAGES_ENABLED) return COMING_SOON_METADATA;
  const { listing, category } = await load(params);
  return {
    title: `${listing.name}, ${listingPlace(listing)}`,
    description: `${listing.shortDescription} ${category.name} in ${listingPlace(listing)}. Send an enquiry on Noida Super Bazaar.`,
    openGraph: listing.coverImageUrl ? { images: [listing.coverImageUrl] } : undefined,
  };
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-semibold text-ink">{title}</h2>
        <span className="mt-2 block h-0.5 w-10 rounded bg-brand" aria-hidden />
      </div>
      {children}
    </section>
  );
}

/** Services: two columns, as on the ezweddingz facilities list. */
const SERVICE_GRID = "grid grid-cols-2 gap-x-4 gap-y-4 sm:gap-x-8 sm:gap-y-5";
const SERVICE_LIMIT = 10;

/**
 * One service as an icon, name and detail line ("Breakout rooms" over "28 rooms · Included in
 * rent"). The icon comes from the words in the name; the detail is what the admin typed after `|`.
 */
function ServiceRow({ service }: { service: string }) {
  const { title, detail } = parseService(service);
  return (
    <li className="flex min-w-0 items-start gap-2.5 sm:gap-3">
      <ServiceIcon text={title} className="mt-px size-[18px] shrink-0 text-brand sm:size-5" strokeWidth={1.75} />
      <div className="min-w-0">
        <p className="text-[13px] leading-5 font-medium break-words text-ink sm:text-[15px]">{title}</p>
        {detail && <p className="mt-0.5 text-xs leading-[18px] break-words text-muted sm:text-[13px]">{detail}</p>}
      </div>
    </li>
  );
}

const serviceRows = (services: string[]) => services.map((service, i) => <ServiceRow key={`${service}-${i}`} service={service} />);

const mapsUrl = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export default async function ListingDetailPage({ params }: Props) {
  const [{ listing, category, vertical }, { whatsapp }] = await Promise.all([load(params), getSiteSettings()]);
  const chatHref = whatsapp ? whatsappHref(whatsapp, listing.name) : null;
  const images = [listing.coverImageUrl, ...listing.gallery.map((g) => g.url)].filter((u): u is string => !!u);
  const place = listingPlace(listing);
  const mapQuery = `${listing.name}, ${listing.address || place}`;

  return (
    <>
      <div className="container-page pt-4 pb-28 lg:pb-14">
        <Link
          href={`/${vertical.slug}/${category.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
        >
          <ChevronLeft className="size-4" aria-hidden /> Browse {category.name}
        </Link>

        <header className="mt-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-[28px] leading-tight font-bold text-ink sm:text-4xl">{listing.name}</h1>
            <Link
              href={`/${vertical.slug}/${category.slug}`}
              className="rounded-full border border-brand/30 bg-brand-soft px-3 py-0.5 text-xs font-medium text-brand"
            >
              {category.name}
            </Link>
            <GoogleRatingBadge listing={listing} />
            {listing.isFeatured && (
              <span className="flex items-center gap-1 rounded-full bg-[#f59e0b] px-3 py-0.5 text-xs font-semibold text-white">
                <Crown className="size-3.5 fill-white" aria-hidden /> Featured
              </span>
            )}
          </div>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span className="flex items-center gap-1">
              <MapPin className="size-4 text-brand" aria-hidden /> {place}
            </span>
            <a
              href={mapsUrl(mapQuery)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center font-semibold text-brand hover:underline"
            >
              View on map <ChevronRight className="size-4" aria-hidden />
            </a>
          </p>
        </header>

        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
          <div className="flex min-w-0 flex-col gap-10">
            <Gallery name={listing.name} images={images} />

            {listing.videos.length > 0 && (
              <Section title="Videos">
                <Videos name={listing.name} videos={listing.videos} />
              </Section>
            )}

            {listing.about && (
              <Section title="About">
                <ReadMore text={listing.about} />
              </Section>
            )}

            {(listing.services.length > 0 || listing.serviceGroups.length > 0) && (
              <Section title="Services">
                <div className="flex flex-col gap-7">
                  {listing.services.length > 0 && (
                    <ExpandableList limit={SERVICE_LIMIT} moreLabel="Show more" className={SERVICE_GRID} items={serviceRows(listing.services)} />
                  )}
                  {/* Headed sections from the admin (e.g. Food, Decor), each its own two-column list. */}
                  {listing.serviceGroups.map((group, g) => (
                    <div key={`${group.title}-${g}`} className="flex flex-col gap-4">
                      <h3 className="text-lg font-semibold text-ink">{group.title}</h3>
                      <ExpandableList limit={SERVICE_LIMIT} moreLabel="Show more" className={SERVICE_GRID} items={serviceRows(group.items)} />
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {listing.quickInfo.length > 0 && (
              <Section title="Quick Information">
                <dl className="grid grid-cols-2 gap-3 xl:grid-cols-3">
                  {listing.quickInfo.map((item) => (
                    <div key={item.label} className="rounded-xl border border-line bg-surface px-4 py-3">
                      <dt className="text-xs font-bold tracking-wide text-ink uppercase">{item.label}</dt>
                      <dd className="mt-0.5 text-sm font-normal text-ink-soft">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </Section>
            )}

            {(listing.reviews.length > 0 || listing.googleRating !== null) && (
              <Section title="Reviews">
                <ReviewsSummary listing={listing} />
              </Section>
            )}

            <Section title="Location">
              <div className="flex max-w-md items-start gap-3 rounded-2xl border border-line bg-white p-5 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.06)]">
                <MapPin className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
                <div>
                  <p className="font-semibold text-ink">{place}</p>
                  <p className="text-sm text-muted">{listing.address || listing.name}</p>
                  <a
                    href={mapsUrl(mapQuery)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-sm font-semibold text-brand hover:underline"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              </div>
            </Section>
          </div>

          <aside id="enquire" className="scroll-mt-4 lg:sticky lg:top-4">
            <EnquiryCard
              listingId={listing.id}
              vendorName={listing.name}
              keyInfo={listing.keyInfo}
              eventTypes={vertical.slug === "wedding" ? WEDDING_EVENT_TYPES : []}
              whatsappHref={chatHref}
            />
          </aside>
        </div>
      </div>

      {/* Mobile: Enquire Now and WhatsApp stay reachable while scrolling, side by side in one row. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.06)] lg:hidden">
        {chatHref ? (
          <div className="grid grid-cols-2 gap-3">
            <a href="#enquire" className="flex h-11 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white hover:bg-brand-dark">
              Enquire Now
            </a>
            <a
              href={chatHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#25d366] bg-[#25d366]/10 text-sm font-semibold text-[#128c7e]"
            >
              <MessageCircle className="size-5" aria-hidden /> WhatsApp
            </a>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{listing.name}</p>
              <p className="truncate text-xs text-muted">{place}</p>
            </div>
            <a href="#enquire" className="shrink-0 rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark">
              Enquire Now
            </a>
          </div>
        )}
      </div>
    </>
  );
}
