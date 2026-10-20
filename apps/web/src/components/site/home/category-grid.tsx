import Image from "next/image";
import Link from "next/link";
import type { Category } from "@nsb/shared";
import { HIDDEN_UNTIL_EXPANDED, ShowMore } from "./show-more";

/** Icon backgrounds from the home design, keyed by slug; other categories cycle through them. */
const TILE_COLORS: Record<string, string> = {
  wedding: "#f2e4fe",
  "real-estate": "#d5e7fd",
  "tattoo-studios": "#fee3f1",
  restaurants: "#ffead0",
  "loans-finance": "#d3fce4",
  "interior-services": "#c4f9fd",
  "beauty-spa": "#ffe0e2",
  "home-decor": "#fef2c2",
  "travel-services": "#d9f0fd",
  "fitness-gym": "#ffdede",
  electronics: "#eef3f8",
  "ac-repair": "#bffbef",
  "refurbished-laptops": "#dbe3fe",
  cafes: "#fef9be",
  "event-services": "#fbe4fe",
};
const PALETTE = Object.values(TILE_COLORS);

export const tileColor = (category: Category, index: number) =>
  TILE_COLORS[category.slug] ?? PALETTE[index % PALETTE.length];

export function CategoryIcon({ category, index, size = 20 }: { category: Category; index: number; size?: number }) {
  return (
    <span className="flex shrink-0 rounded-full p-2.5" style={{ background: tileColor(category, index) }}>
      {category.imageUrl ? (
        <Image src={category.imageUrl} alt="" width={size} height={size} className="object-contain" style={{ width: size, height: size }} />
      ) : (
        <span
          className="flex items-center justify-center font-semibold text-ink-soft"
          style={{ width: size, height: size, fontSize: size * 0.6 }}
          aria-hidden
        >
          {category.name.charAt(0)}
        </span>
      )}
    </span>
  );
}

/** Categories visible on phones before "See more": two per row, three rows. */
const PHONE_VISIBLE = 6;

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    // Phones: two cards per row, three rows, then "See more" keeps the page short. Larger screens: the full designed grid.
    // scroll-mt clears the sticky phone header when jumping to #categories.
    <section id="categories" className="scroll-mt-28 bg-surface py-6 sm:py-10 lg:scroll-mt-4">
      <div className="container-page flex flex-col gap-4 sm:gap-8 lg:gap-10">
        <h2 className="text-lg leading-7 font-bold text-ink sm:text-center sm:text-[25px] sm:leading-9">Browse by Category</h2>
        <ShowMore hiddenCount={Math.max(0, categories.length - PHONE_VISIBLE)} label="See more">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 lg:gap-4">
            {categories.map((category, i) => (
              <li key={category.id} className={i >= PHONE_VISIBLE ? HIDDEN_UNTIL_EXPANDED : undefined}>
                <Link
                  href={`/${category.slug}`}
                  className="flex h-full min-h-16 items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5 shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.05)] transition-all sm:min-h-[112px] sm:flex-col sm:justify-start sm:px-2 sm:py-4 sm:shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] sm:hover:-translate-y-0.5 sm:hover:shadow-lg lg:h-32 lg:gap-4 lg:p-5"
                >
                  <CategoryIcon category={category} index={i} />
                  <span className="text-left text-[13px] leading-4 font-semibold text-ink-soft sm:text-center sm:text-xs">{category.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </ShowMore>
      </div>
    </section>
  );
}
