import Link from "next/link";
import { type AdminCategory, LISTING_AREAS, type ListingSummary, type Paginated } from "@nsb/shared";
import { adminApi } from "@/lib/api";

/**
 * Slots and terms, as in the NSB Live Demo admin: 10 vendors per sub-category per location,
 * sold for a 6-month term. Static for now: nothing here is saved; each cell counts the
 * listings already filed in that sub-category and area.
 */
const SLOTS_PER_AREA = 10;

/** Demo plan prices for a 6-month slot, by sub-category slug. */
const SLOT_PRICE: Record<string, number> = {
  "wedding-venues": 25_000,
  "makeup-beauty": 25_000,
  "catering-halwai": 25_000,
  "photography-films": 10_000,
  "cards-invitations": 5_000,
};
const inr = (n: number) => `₹${n >= 1000 ? `${n / 1000}K` : n}`;

/** Every listing under the Wedding category (a page of 100 at a time, capped). */
async function weddingListings(weddingId: string) {
  const items: ListingSummary[] = [];
  for (let page = 1; page <= 10; page++) {
    const res = await adminApi.get<Paginated<ListingSummary>>(`/admin/listings?categoryId=${weddingId}&pageSize=100&page=${page}`);
    items.push(...res.items);
    if (items.length >= res.total || res.items.length === 0) break;
  }
  return items;
}

function Cell({ filled, href }: { filled: number; href: string }) {
  const tone = filled >= SLOTS_PER_AREA ? "f" : filled >= 7 ? "w" : "";
  const free = Math.max(0, SLOTS_PER_AREA - filled);
  return (
    <Link href={href} className={`a-cell ${tone}`}>
      <b>
        {filled}/{SLOTS_PER_AREA}
      </b>
      <small>{free ? `${free} free` : "Full"}</small>
      <i>
        <u style={{ width: `${Math.min(100, filled * 10)}%` }} />
      </i>
    </Link>
  );
}

export async function WeddingSlots({ weddingId, subs, selected }: { weddingId: string; subs: AdminCategory[]; selected?: AdminCategory }) {
  const listings = await weddingListings(weddingId);
  const filled = (subId: string, area: string) => listings.filter((l) => l.category.id === subId && l.area === area).length;
  const rows = selected ? [selected] : subs;
  const total = rows.length * LISTING_AREAS.length * SLOTS_PER_AREA;
  const used = rows.reduce((n, c) => n + LISTING_AREAS.reduce((m, a) => m + Math.min(SLOTS_PER_AREA, filled(c.id, a)), 0), 0);

  return (
    <section className="a-card mb-4" aria-labelledby="slots-h" style={{ padding: "14px 16px" }}>
      <h3 id="slots-h" style={{ marginBottom: 4 }}>
        <span>Slots and terms</span>
        <span className="a-soon">Static for now</span>
      </h3>
      <p className="a-hsub" style={{ margin: "0 0 4px" }}>
        {SLOTS_PER_AREA} vendors per sub-category per location, for a 6-month term. Slots filled: {used} of {total}. Paid slots are not
        tracked yet; each cell counts the listings filed there.
      </p>
      <div className="a-tw" style={{ border: 0 }}>
        <table className="a-mx">
          <thead>
            <tr>
              <th scope="col">Sub-category</th>
              {LISTING_AREAS.map((a) => (
                <th key={a} scope="col">
                  {a}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <th scope="row">
                  {c.name}
                  <small>{SLOT_PRICE[c.slug] ? `${inr(SLOT_PRICE[c.slug]!)} / 6 mo` : "Price not set"}</small>
                </th>
                {LISTING_AREAS.map((a) => (
                  <td key={a}>
                    <Cell filled={filled(c.id, a)} href={`/admin/wedding?sub=${c.id}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
