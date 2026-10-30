import Link from "next/link";
import { Landmark, MapPin, MessageCircle, Phone, Star, Users } from "lucide-react";
import { type ListingRating, type ListingSummary, listingPlace, type QuickInfoItem, serviceTitle } from "@nsb/shared";
import { CardPhotos } from "./card-photos";
import { MoreInfo } from "./more-info";
import "./listing-page.css";

export type ListingView = "grid" | "list";

/** NSB's own contact links for a card's phone buttons. Never the vendor's number. */
export interface CardContact {
  whatsapp?: string;
  phone?: string;
}

/**
 * Vendor card, after the NSB venue page design. The whole card links to the listing (the name's
 * link is stretched over it). Key info: the first two items show as label/value pairs, the rest
 * as chips; phones swap the chips for a short summary and add call buttons. Elite listings get
 * the blue card, which spans the row in grid view.
 */
export function ListingCard({ listing, href, view, contact }: { listing: ListingSummary; href: string; view: ListingView; contact?: CardContact }) {
  const primary = listing.keyInfo.slice(0, 2);
  const chips = [...listing.keyInfo.slice(2).map((item) => `${item.label}: ${item.value}`), ...listing.services.map(serviceTitle)];
  const shownChips = chips.slice(0, 2);
  const hiddenChips = chips.slice(shownChips.length);
  const isGrid = view === "grid" && !listing.isElite;

  return (
    <article className={`lp-card ${view === "grid" ? "is-grid" : ""} ${listing.isElite ? "is-elite" : ""}`}>
      <CardPhotos
        name={listing.name}
        cover={listing.coverImageUrl}
        gallery={listing.galleryPreview}
        badge={listing.isElite ? "elite" : listing.isFeatured ? "featured" : null}
        sizes={isGrid ? "(min-width: 1024px) 480px, (min-width: 701px) 50vw, 100vw" : "(min-width: 701px) 230px, 100vw"}
      />

      <div className="lp-body">
        <div className="lp-top">
          <h3>
            <Link href={href} className="lp-name">
              {listing.name}
            </Link>
          </h3>
          {listing.rating && <Rating rating={listing.rating} />}
        </div>

        <p className="lp-loc">
          <MapPin aria-hidden />
          {listingPlace(listing)}
          <span className="lp-cat">· {listing.category.name}</span>
        </p>

        {primary.length > 0 && (
          <dl className="lp-kv">
            {primary.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>
                  <Price item={item} />
                </dd>
              </div>
            ))}
          </dl>
        )}

        {/* Phones show the key details after the price, in place of the chips. */}
        {listing.keyInfo.length > 1 && (
          <ul className="lp-mr">
            {listing.keyInfo.slice(1, 3).map((item) => (
              <li key={item.label}>
                {/guest/i.test(`${item.label} ${item.value}`) ? <Users aria-hidden /> : <Landmark aria-hidden />}
                {item.value.startsWith("₹") ? `${item.label} ${item.value}` : item.value}
              </li>
            ))}
          </ul>
        )}

        {(chips.length > 0 || listing.shortDescription) && (
          <div className="lp-ft">
            {shownChips.map((chip, i) => (
              <span key={i} className="lp-chip">
                {chip}
              </span>
            ))}
            {hiddenChips.length > 0 && <MoreInfo items={hiddenChips} />}
            {listing.shortDescription && <p className="lp-desc">{listing.shortDescription}</p>}
          </div>
        )}

        <div className="lp-bt">
          <Link href={`${href}#enquire`} className="lp-en">
            Enquire Now
          </Link>
          {contact?.whatsapp && (
            <a href={contact.whatsapp} target="_blank" rel="noreferrer" className="lp-ic" aria-label={`WhatsApp about ${listing.name}`}>
              <MessageCircle aria-hidden />
            </a>
          )}
          {contact?.phone && (
            <a href={contact.phone} className="lp-ic" aria-label={`Call about ${listing.name}`}>
              <Phone aria-hidden />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

/** The listing's real rating: its Google rating, or the average of its NSB reviews. */
function Rating({ rating }: { rating: ListingRating }) {
  const label = rating.source === "google" ? "Google" : rating.count === 1 ? "review" : "reviews";
  return (
    <p className="lp-rt" title={rating.source === "google" ? "Google rating" : "NSB reviews"}>
      <Star aria-hidden />
      {rating.average.toFixed(1)}
      {rating.count > 0 && (
        <span>
          ({rating.count} {label})
        </span>
      )}
    </p>
  );
}

/** "₹3,000 per function" → large "₹ 3,000" and a small "per function"; other values show as-is. */
function Price({ item }: { item: QuickInfoItem }) {
  const match = /^₹\s*([\d,.]+)\s*(.*)$/.exec(item.value);
  if (!match) return item.value;
  return (
    <>
      ₹ {match[1]}
      {match[2] && <small>{match[2]}</small>}
    </>
  );
}
