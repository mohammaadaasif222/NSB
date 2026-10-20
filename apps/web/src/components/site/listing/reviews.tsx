import { BadgeCheck, ExternalLink, Star } from "lucide-react";
import type { ListingDetail, ListingReview } from "@nsb/shared";
import { formatDate } from "@/lib/format";

/** Five stars with `rating` of them filled. */
export function Stars({ rating, size = "size-4" }: { rating: number; size?: string }) {
  return (
    <span className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${size} ${n <= Math.round(rating) ? "fill-[#fbbf24] text-[#fbbf24]" : "fill-line text-line"}`} aria-hidden />
      ))}
    </span>
  );
}

/** "G 4.7 (128)" pill beside the vendor's name, linking to Google Maps when the admin added the link. */
export function GoogleRatingBadge({ listing }: { listing: Pick<ListingDetail, "googleRating" | "googleReviewCount" | "googleMapsUrl"> }) {
  if (listing.googleRating === null) return null;
  const body = (
    <>
      <span className="font-bold text-[#4285f4]">G</span>
      <Star className="size-3.5 fill-[#fbbf24] text-[#fbbf24]" aria-hidden />
      <span className="font-semibold text-ink">{listing.googleRating.toFixed(1)}</span>
      {listing.googleReviewCount !== null && <span className="text-muted">({listing.googleReviewCount.toLocaleString("en-IN")})</span>}
    </>
  );
  const className = "inline-flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-0.5 text-xs";
  return listing.googleMapsUrl ? (
    <a href={listing.googleMapsUrl} target="_blank" rel="noopener noreferrer" className={`${className} hover:border-brand`} title="Google rating: open on Google Maps">
      {body}
    </a>
  ) : (
    <span className={className} title="Google rating">
      {body}
    </span>
  );
}

function ReviewCard({ review }: { review: ListingReview }) {
  return (
    <li className="flex min-w-0 flex-col gap-2 rounded-2xl border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{review.authorName}</p>
          {review.reviewDate && <p className="text-xs text-muted">{formatDate(review.reviewDate)}</p>}
        </div>
        <Stars rating={review.rating} />
      </div>
      {review.text && <p className="text-sm leading-6 whitespace-pre-line text-ink-soft">{review.text}</p>}
      <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
        {review.isVerified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
            <BadgeCheck className="size-3.5" aria-hidden /> Verified
          </span>
        )}
        <span className="rounded-full bg-line px-2 py-0.5 text-ink-soft">{review.source === "google" ? "From Google" : "Customer review"}</span>
      </div>
    </li>
  );
}

/**
 * Reviews added in the admin panel (no made-up ones), with a summary on top: the Google rating
 * when the admin entered it, and the average of these reviews.
 */
export function ReviewsSummary({ listing }: { listing: ListingDetail }) {
  const { reviews } = listing;
  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        {listing.googleRating !== null && (
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3">
            <span className="text-2xl font-bold text-[#4285f4]">G</span>
            <div>
              <p className="flex items-center gap-2 font-semibold text-ink">
                {listing.googleRating.toFixed(1)} <Stars rating={listing.googleRating} />
              </p>
              <p className="text-xs text-muted">
                Google rating{listing.googleReviewCount !== null && ` · ${listing.googleReviewCount.toLocaleString("en-IN")} reviews`}
                {listing.googleMapsUrl && (
                  <>
                    {" · "}
                    <a href={listing.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 font-semibold text-brand hover:underline">
                      View on Google <ExternalLink className="size-3" aria-hidden />
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>
        )}
        {average !== null && (
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3">
            <span className="text-2xl font-bold text-ink">{average.toFixed(1)}</span>
            <div>
              <Stars rating={average} />
              <p className="text-xs text-muted">
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"} on Noida Super Bazaar
              </p>
            </div>
          </div>
        )}
      </div>
      {reviews.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </ul>
      )}
    </div>
  );
}
