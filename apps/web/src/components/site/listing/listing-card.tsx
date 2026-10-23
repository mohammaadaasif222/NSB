import Image from "next/image";
import Link from "next/link";
import { Crown, ImageOff, Landmark, MapPin, Star } from "lucide-react";
import { type ListingRating, type ListingSummary, listingPlace, type QuickInfoItem, serviceTitle } from "@nsb/shared";
import { MoreInfo } from "./more-info";

export type ListingView = "grid" | "list";

/**
 * Vendor card, styled after the WedMeGood listing page. The whole card links to the listing
 * (the title's link is stretched over it). Key info: the first two items show as price-style
 * label/value pairs (e.g. Veg / Non veg), the next two as chips. List view is a white card
 * with gallery thumbnails and an Enquire button; grid view is the bare photo-and-text tile.
 */
export function ListingCard({ listing, href, view }: { listing: ListingSummary; href: string; view: ListingView }) {
  const primary = listing.keyInfo.slice(0, 2);
  const chips = [...listing.keyInfo.slice(2).map((item) => `${item.label}: ${item.value}`), ...listing.services.map(serviceTitle)];
  const isList = view === "list";
  const shownChips = chips.slice(0, isList ? 3 : 2);

  const cover = (
    <div className={`relative shrink-0 overflow-hidden rounded-lg bg-[#e5e7eb] ${isList ? "aspect-300/168" : "aspect-380/214"}`}>
      {listing.coverImageUrl ? (
        <Image
          src={listing.coverImageUrl}
          alt=""
          fill
          sizes={isList ? "(min-width: 640px) 300px, 100vw" : "(min-width: 1024px) 380px, 50vw"}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <span className="flex size-full items-center justify-center text-muted">
          <ImageOff className="size-8" aria-hidden />
        </span>
      )}
      {listing.isFeatured && (
        <span className="absolute top-0 left-0 flex h-6 items-center gap-1 bg-brand pr-4 pl-2 text-xs font-semibold text-white [clip-path:polygon(0_0,100%_0,calc(100%-6px)_50%,100%_100%,0_100%)]">
          <Crown className="size-3.5" aria-hidden /> Featured
        </span>
      )}
    </div>
  );

  return (
    <article
      className={`group relative flex flex-col transition-[box-shadow,transform] duration-150 pointer-coarse:active:scale-[0.985] ${isList ? "gap-4 rounded-xl bg-white p-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] sm:flex-row sm:gap-5 sm:rounded-lg sm:p-5" : ""}`}
    >
      {isList ? (
        <div className="shrink-0 sm:w-75">
          {cover}
          {listing.galleryPreview.length > 0 && (
            <ul className="mt-2.5 flex gap-2.5">
              {listing.galleryPreview.map((url) => (
                <li key={url} className="relative size-10 overflow-hidden rounded bg-[#e5e7eb]">
                  <Image src={url} alt="" fill sizes="40px" className="object-cover" />
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        cover
      )}

      <div className={`flex min-w-0 flex-1 flex-col ${isList ? "" : "pt-2.5"}`}>
        {/* Grid view is two cards to a row on phones, so the rating drops below the name there. */}
        <div className={`flex justify-between ${isList ? "items-baseline gap-3" : "flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3"}`}>
          <h3 className={`line-clamp-2 min-w-0 font-semibold break-words text-ink ${isList ? "text-xl leading-7" : "text-[15px] leading-5 sm:text-lg sm:leading-6"}`}>
            <Link href={href} className="after:absolute after:inset-0 after:rounded-lg group-hover:text-brand">
              {listing.name}
            </Link>
          </h3>
          {listing.rating && <Rating rating={listing.rating} compact={!isList} />}
        </div>

        <div className={`mt-1.5 grid text-muted ${isList ? "grid-cols-2 gap-4 text-sm sm:flex sm:gap-8" : "grid-cols-1 gap-1 text-xs sm:grid-cols-2 sm:gap-4 sm:text-sm"}`}>
          <p className={`flex min-w-0 items-center gap-1 ${isList ? "sm:max-w-1/2" : ""}`}>
            <MapPin className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{listingPlace(listing)}</span>
          </p>
          <p className={`flex min-w-0 items-center gap-1 ${isList ? "sm:max-w-1/2" : ""}`}>
            <Landmark className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{listing.category.name}</span>
          </p>
        </div>

        {primary.length > 0 && (
          <dl className={`mt-1 grid grid-cols-2 ${isList ? "gap-4 sm:flex sm:gap-8" : "gap-2 sm:gap-4"}`}>
            {primary.map((item) => (
              <div key={item.label} className="min-w-0">
                <dt className="truncate text-xs text-muted">{item.label}</dt>
                <dd className="truncate text-ink">
                  <Price item={item} compact={!isList} />
                </dd>
              </div>
            ))}
          </dl>
        )}

        {chips.length > 0 && (
          <div className="relative mt-3 flex flex-wrap items-center gap-2">
            <ul className="contents">
              {shownChips.map((chip, i) => (
                <li key={i} className="max-w-40 truncate rounded-sm bg-line px-2 py-1 text-xs text-ink-soft">
                  {chip}
                </li>
              ))}
            </ul>
            {chips.length > shownChips.length && <MoreInfo items={chips} hiddenCount={chips.length - shownChips.length} />}
          </div>
        )}

        {isList && (
          <>
            {listing.shortDescription && <p className="mt-3 truncate text-xs text-muted">{listing.shortDescription}</p>}
            <div className="mt-auto flex justify-end pt-4">
              <Link
                href={`${href}#enquire`}
                className="relative z-10 flex h-10 w-full items-center justify-center rounded-md bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-dark sm:w-auto"
              >
                Enquire Now
              </Link>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

/** The listing's real rating: its Google rating, or the average of its NSB reviews. */
function Rating({ rating, compact }: { rating: ListingRating; compact?: boolean }) {
  const label = rating.source === "google" ? "Google" : rating.count === 1 ? "review" : "reviews";
  return (
    <p className={`flex shrink-0 items-center gap-1 text-ink-soft ${compact ? "text-sm sm:text-base" : "text-base"}`} title={rating.source === "google" ? "Google rating" : "NSB reviews"}>
      <Star className="size-4 fill-[#fbbf24] text-[#fbbf24]" aria-hidden />
      <span className="font-medium">{rating.average.toFixed(1)}</span>
      {rating.count > 0 && (
        <span className={`text-muted ${compact ? "text-xs sm:text-sm" : "text-sm"}`}>
          ({rating.count} {label})
        </span>
      )}
    </p>
  );
}

/** "₹3,000 per function" → large "₹ 3,000" and a small "per function"; other values show as-is. `compact`: smaller on phones. */
function Price({ item, compact }: { item: QuickInfoItem; compact?: boolean }) {
  const match = /^₹\s*([\d,.]+)\s*(.*)$/.exec(item.value);
  if (!match) return <span className={`font-semibold ${compact ? "text-sm sm:text-base" : "text-base"}`}>{item.value}</span>;
  return (
    <>
      <span className={`font-bold ${compact ? "text-[15px] sm:text-lg" : "text-lg"}`}>₹ {match[1]}</span>
      {match[2] && <span className={`text-ink-soft ${compact ? "block text-[11px] sm:ml-1.5 sm:inline sm:text-xs" : "ml-1.5 text-xs"}`}>{match[2]}</span>}
    </>
  );
}
