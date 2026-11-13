import { formatPrice } from "@nsb/shared/client";

/** "₹1.25 Cr". */
export const priceText = (rupees: number) => `₹${formatPrice(rupees)}`;

/** "1,450 sq ft". */
export const sqftText = (n: number) => `${n.toLocaleString("en-IN")} sq ft`;

/** How long ago a project was listed, as on property cards: "today", "5d ago", "2wk ago", "1mo ago", "1yr ago". */
export function listedAgo(iso: string, now = Date.now()) {
  const days = Math.max(0, Math.floor((now - Date.parse(iso)) / 86_400_000));
  if (days < 1) return "today";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}wk ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}yr ago`;
}

/** Square feet to square metres, rounded: 1,450 → 135. */
export const sqmOf = (sqft: number) => Math.round(sqft * 0.092903);
