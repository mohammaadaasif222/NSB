import { formatPrice } from "@nsb/shared";

/** "₹1.25 Cr". */
export const priceText = (rupees: number) => `₹${formatPrice(rupees)}`;

/** "1,450 sq ft". */
export const sqftText = (n: number) => `${n.toLocaleString("en-IN")} sq ft`;
