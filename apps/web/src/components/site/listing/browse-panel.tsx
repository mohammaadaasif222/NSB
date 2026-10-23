import Image from "next/image";
import Link from "next/link";
import type { BrowsePanel as Panel } from "@/lib/browse-panels";

/**
 * Side card of photo tiles ("Venues by budget"). Each tile filters the page by its tag; the
 * active tile links back to all listings.
 */
export function BrowsePanel({ panel, tag, href }: { panel: Panel; tag?: string; href: (tag: string | null) => string }) {
  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white px-5 pt-5 pb-6" aria-label={panel.title}>
      <h2 className="text-center text-lg font-semibold text-ink">{panel.title}</h2>
      <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5">
        {panel.tiles.map((tile) => {
          const on = tag?.toLowerCase() === tile.label.toLowerCase();
          return (
            <li key={tile.label}>
              <Link
                href={href(on ? null : tile.label)}
                scroll={false}
                aria-current={on ? "true" : undefined}
                className="group flex flex-col items-center gap-2 text-center"
              >
                <span className="relative block size-16 overflow-hidden rounded-full bg-[#e5e7eb] ring-brand ring-offset-2 transition group-hover:ring-2 group-aria-[current=true]:ring-2">
                  <Image src={tile.image} alt="" fill sizes="64px" className="object-cover" />
                </span>
                <span className="text-sm leading-tight text-ink-soft group-hover:text-brand group-aria-[current=true]:font-semibold group-aria-[current=true]:text-brand">
                  {tile.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
