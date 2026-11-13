import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { type CategoryRef, formatInr, type ListingDetail, type ListingPackage, type ListingSummary, listingPlace, parseService } from "@nsb/shared";
import { cormorant, manrope } from "@/lib/fonts";
import { initialsOf } from "@/lib/format";
import { listingPath } from "@/lib/catalog";
import { ReviewsSummary } from "./reviews";
import { HighlightIcon, TrainingIcon } from "./profile-icons";
import { ServiceIcon } from "./service-icon";
import { AboutText, BookingBar, EnquireService, HeroSlider, QuoteProvider, Reels, SaveShare } from "./vendor-mobile-client";
import "./vendor-mobile.css";

/**
 * The vendor page on phones, after Makeup-Vendor-Page.html: a photo hero card, then one white card
 * per section and a fixed booking bar. Sections show only when the listing has data for them, so the
 * same layout serves every vendor. Wider screens keep the desktop page.
 */

const PIN = (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#E00606"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);
const CROWN = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M2.5 8.2l4.6 3.4L12 4.5l4.9 7.1 4.6-3.4-1.9 10.3H4.4z" />
    <rect x="4.4" y="19.6" width="15.2" height="1.8" rx=".9" />
  </svg>
);
const STAR = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff" aria-hidden>
    <path d="m12 2 3 7 7 .6-5.3 4.7 1.7 7.2L12 17.8 5.6 21.5l1.7-7.2L2 9.6 9 9z" />
  </svg>
);

/** Unique names, ignoring case: the first spelling wins. */
const uniqueNames = (names: string[]) => names.filter((n, i) => names.findIndex((m) => m.toLowerCase() === n.toLowerCase()) === i);

/** Chips, as under "Included in services" in the design. */
function Chips({ items }: { items: string[] }) {
  return (
    <div className="vm-inc">
      {items.map((t) => (
        <span key={t}>{t}</span>
      ))}
    </div>
  );
}

/** A package row: photo, name, description, price and duration, and Enquire. */
function PackageRow({ pkg, image }: { pkg: ListingPackage; image: string | undefined }) {
  return (
    <div className={`vm-pk${image ? "" : " no-img"}`}>
      {image && <Image src={image} alt={pkg.name} width={78} height={78} sizes="78px" />}
      <div>
        <h3>{pkg.name}</h3>
        {pkg.description && <p>{pkg.description}</p>}
        <div className="vm-pkb is-split">
          <div>
            {pkg.price !== null && (
              <span className="vm-pr">
                {formatInr(pkg.price)} {pkg.priceNote && <small>{pkg.priceNote}</small>}
              </span>
            )}
            {pkg.duration && <div className="vm-du">{pkg.duration}</div>}
          </div>
          <EnquireService service={pkg.name} />
        </div>
      </div>
    </div>
  );
}

/** "Things to know" icons from the design: calendar, sparkle, document, info. */
const KNOW_ICONS = [
  <path key="0" d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />,
  <path key="1" d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  <path key="2" d="M6 4h12v16H6zM9 9h6M9 13h6M9 17h3" />,
  <g key="3">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v6M12 7.5v.01" />
  </g>,
];
const KnowIcon = ({ index }: { index: number }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A06D2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {KNOW_ICONS[index % KNOW_ICONS.length]}
  </svg>
);

export function VendorMobile({
  listing,
  vertical,
  category,
  images,
  similar,
  eventTypes,
  whatsappHref,
  mapHref,
}: {
  listing: ListingDetail;
  vertical: CategoryRef;
  category: CategoryRef;
  /** Cover first, then the gallery. */
  images: string[];
  /** Other listings in the category. */
  similar: ListingSummary[];
  eventTypes: readonly string[];
  whatsappHref: string | null;
  mapHref: string;
}) {
  const place = listingPlace(listing);
  const elite = listing.isElite;
  const artist = listing.artist;
  const quick = listing.keyInfo.slice(0, 4);
  const quickLabels = new Set(quick.map((q) => q.label));
  // Yes/no answers read as pills ("Travels to venue"); the rest go to Things to know.
  const pills = listing.quickInfo.filter((q) => q.value === "Yes").map((q) => q.label);
  const know = listing.quickInfo.filter((q) => !quickLabels.has(q.label) && q.value !== "Yes");
  const groups = [{ title: "", items: listing.services }, ...listing.serviceGroups].filter((g) => g.items.length > 0);
  // The quote sheet's Service list: packages, then services.
  const serviceTitles = [...new Set([...listing.packages.map((p) => p.name), ...groups.flatMap((g) => g.items.map((s) => parseService(s).title))])];
  const hasPackages = listing.packages.length > 0;
  // Services show as chips. With packages they join "Included in services" in the packages card.
  const serviceNames = (items: string[]) => uniqueNames(items.map((item) => parseService(item).title));
  const allServiceNames = serviceNames(groups.flatMap((g) => g.items));
  const includedWithPackages = uniqueNames([...listing.includedServices, ...allServiceNames]);
  const includedExtra = listing.includedServices.filter((t) => !allServiceNames.some((n) => n.toLowerCase() === t.toLowerCase()));
  const photo = (i: number) => (images.length ? images[i % images.length] : undefined);
  let row = 0;

  // Bar: the headline price, as in the design: "Bridal makeup onwards" over "₹25,000".
  const price = listing.keyInfo.find((q) => q.value.startsWith("₹"));
  const [, amount, priceRest] = price?.value.match(/^(₹[\d,.]+)\s*(.*)$/) ?? [];
  const barLabel = price ? [price.label, priceRest].filter(Boolean).join(" ") : place;
  const barValue = price ? (amount ?? price.value) : listing.name;

  const badge = elite ? (
    <span className="vm-b is-gold">{CROWN}Elite 10</span>
  ) : listing.isFeatured ? (
    <span className="vm-b is-red">{STAR}Featured</span>
  ) : null;

  return (
    <div className={`vm ${cormorant.variable} ${manrope.variable}`}>
      {/* The footer sits outside .vm, so it gets the design's font here (phones only, see vendor-mobile.css). */}
      <style>{`@media (max-width: 639.98px) { body:has(.vm) .nsb-footer { font-family: ${manrope.style.fontFamily}; } }`}</style>
      {/* Inside .vm, so the quote sheet gets the layout's colours and fonts. */}
      <QuoteProvider listingId={listing.id} vendorName={listing.name} elite={elite} eventTypes={eventTypes} services={serviceTitles}>
        <nav className="vm-crumb" aria-label="Breadcrumb">
          <Link href={`/${vertical.slug}`}>{vertical.name}</Link> › <Link href={`/${vertical.slug}/${category.slug}`}>{category.name}</Link>{" "}
          › <b aria-current="page">{listing.name}</b>
        </nav>

        <section className="vm-hero">
          <HeroSlider name={listing.name} images={images} badge={badge} />
          <div className="vm-who">
            <div className="vm-av">{initialsOf(listing.name)}</div>
            <SaveShare slug={listing.slug} name={listing.name} />
          </div>
          <div className="vm-tb">
            <h1>{listing.name}</h1>
            {listing.shortDescription && <p className="vm-tag">{listing.shortDescription}</p>}
            <div className="vm-meta">
              {PIN}
              <span>
                {place} · {category.name}
              </span>
            </div>
            {pills.length > 0 && (
              <div className="vm-pills">
                {pills.map((p) => (
                  <span key={p} className="vm-pill">
                    {p}
                  </span>
                ))}
              </div>
            )}
            {quick.length > 0 && (
              <div className="vm-quick">
                {quick.map((q) => (
                  <div key={q.label}>
                    {q.label}
                    <b>{q.value}</b>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {listing.about && (
          <section className="vm-sec vm-about">
            <h2>About</h2>
            <div className="vm-abt">
              <AboutText text={listing.about} />
            </div>
          </section>
        )}

        {hasPackages && (
          <section className="vm-sec">
            <h2>{listing.packagesTitle || "Packages"}</h2>
            {listing.packagesNote ? <p className="vm-lead">{listing.packagesNote}</p> : <div className="vm-mt12" />}
            <div className="vm-pkv">
              <div>
                {listing.packages.map((pkg, i) => (
                  <PackageRow key={`${pkg.name}-${i}`} pkg={pkg} image={pkg.imageUrl ?? photo(row++)} />
                ))}
              </div>
            </div>
            {includedWithPackages.length > 0 && (
              <>
                <div className="vm-h4">Included in services</div>
                <Chips items={includedWithPackages} />
              </>
            )}
          </section>
        )}

        {!hasPackages && (groups.length > 0 || listing.includedServices.length > 0) && (
          <section className="vm-sec">
            <h2>Services</h2>
            {groups.map((group, g) => (
              <div key={`${group.title}-${g}`}>
                {group.title && <div className="vm-h4">{group.title}</div>}
                <Chips items={serviceNames(group.items)} />
              </div>
            ))}
            {includedExtra.length > 0 && (
              <>
                <div className="vm-h4">Included in services</div>
                <Chips items={includedExtra} />
              </>
            )}
          </section>
        )}

        {artist && (
          <section className="vm-sec">
            <h2>Meet your artist</h2>
            <div className="vm-ar">
              <div className="vm-av">{initialsOf(artist.name)}</div>
              <div>
                <b>{artist.name}</b>
                {artist.role && <span>{artist.role}</span>}
              </div>
            </div>
            {artist.stats.length > 0 && (
              <div className="vm-st" style={{ gridTemplateColumns: `repeat(${artist.stats.length}, 1fr)` }}>
                {artist.stats.map((st, i) => (
                  <div key={`${st.label}-${i}`}>
                    <b>{st.value}</b>
                    <span>{st.label}</span>
                  </div>
                ))}
              </div>
            )}
            {artist.highlights.length > 0 && (
              <>
                <div className="vm-h4">Highlights</div>
                <div className="vm-hl">
                  {artist.highlights.map((t, i) => (
                    <div key={`${t}-${i}`} className="vm-hi">
                      <span className="vm-hic">
                        <HighlightIcon index={i} />
                      </span>
                      <span className="vm-ht">{t}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            {artist.training.length > 0 && (
              <>
                <div className="vm-h4">Training</div>
                <div className="vm-tl">
                  {artist.training.map((t, i) => (
                    <div key={`${t}-${i}`} className="vm-ti">
                      <span className="vm-tic">
                        <TrainingIcon index={i} />
                      </span>
                      <span className="vm-tt">{t}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            {artist.note && <div className="vm-note">{artist.note}</div>}
          </section>
        )}

        {listing.videos.length > 0 && (
          <section className="vm-sec">
            <h2>Videos</h2>
            <div className="vm-mt12">
              <Reels name={listing.name} videos={listing.videos} />
            </div>
          </section>
        )}

        {(listing.serviceArea || listing.serviceAreaChips.length > 0) && (
          <section className="vm-sec">
            <h2>{listing.serviceAreaTitle || "Service area"}</h2>
            {listing.serviceArea && <p className="vm-txt vm-pre">{listing.serviceArea}</p>}
            {listing.serviceAreaChips.length > 0 && (
              <div className="vm-chips">
                {listing.serviceAreaChips.map((c) => (
                  <span key={c} className="vm-ch">
                    {c}
                  </span>
                ))}
              </div>
            )}
            {listing.serviceAreaNote && <p className="vm-lead vm-small">{listing.serviceAreaNote}</p>}
          </section>
        )}

        <section className="vm-sec">
          <h2>Location</h2>
          <p className="vm-txt">{listing.address || place}</p>
          <div className="vm-chips">
            <span className="vm-ch">{place}</span>
          </div>
          <a className="vm-link" href={mapHref} target="_blank" rel="noopener noreferrer">
            Open in Google Maps →
          </a>
        </section>

        {(listing.thingsToKnow.length > 0 || know.length > 0) && (
          <section className="vm-sec">
            <h2>Things to know</h2>
            <div className="vm-mt12">
              {listing.thingsToKnow.map((k, i) => (
                <div key={`${k.title}-${i}`} className="vm-kc">
                  <span className="vm-ki">
                    <KnowIcon index={i} />
                  </span>
                  <div>
                    <b>{k.title}</b>
                    <p className="vm-pre">{k.text}</p>
                  </div>
                </div>
              ))}
              {/* The listing's other details, after the vendor's own cards. */}
              {know.map((k) => (
                <div key={k.label} className="vm-kc">
                  <span className="vm-ki">
                    <ServiceIcon text={k.label} className="size-[18px]" strokeWidth={2} />
                  </span>
                  <div>
                    <b>{k.label}</b>
                    <p>{k.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {listing.faqs.length > 0 && (
          <section className="vm-sec">
            <h2>Questions people ask</h2>
            <div className="vm-faq">
              {listing.faqs.map((f, i) => (
                <details key={`${f.question}-${i}`}>
                  <summary>
                    {f.question}
                    <ChevronDown className="size-4 shrink-0" strokeWidth={2.4} aria-hidden />
                  </summary>
                  <p>{f.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {(listing.reviews.length > 0 || listing.googleRating !== null) && (
          <section className="vm-sec">
            <h2>Reviews</h2>
            <div className="vm-mt12">
              <ReviewsSummary listing={listing} />
            </div>
          </section>
        )}

        {similar.length > 0 && (
          <section className="vm-sec">
            <h2>Similar vendors</h2>
            <p className="vm-lead">More in {category.name}.</p>
            <div className="vm-sim">
              {similar.map((s) => {
                const from = s.keyInfo.find((q) => q.value.startsWith("₹"));
                return (
                  <Link key={s.id} className="vm-sc" href={listingPath(vertical.slug, category.slug, s.slug)}>
                    <div className="vm-av">{initialsOf(s.name)}</div>
                    <b>{s.name}</b>
                    <span>{listingPlace(s)}</span>
                    {from && <em>from {from.value}</em>}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <BookingBar
          label={barLabel}
          value={barValue}
          elite={elite}
          whatsappHref={whatsappHref}
        />
      </QuoteProvider>
    </div>
  );
}
