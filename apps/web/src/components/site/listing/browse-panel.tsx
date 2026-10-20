import Image from "next/image";
import type { BrowsePanel as Panel } from "@/lib/browse-panels";

/** Side card of photo tiles ("Venues by budget"). Display only until budget/type filters exist. */
export function BrowsePanel({ panel }: { panel: Panel }) {
  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white px-5 pt-5 pb-6" aria-label={panel.title}>
      <h2 className="text-center text-lg font-semibold text-ink">{panel.title}</h2>
      <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5">
        {panel.tiles.map((tile) => (
          <li key={tile.label} className="flex flex-col items-center gap-2 text-center">
            <span className="relative block size-16 overflow-hidden rounded-full bg-[#e5e7eb]">
              <Image src={tile.image} alt="" fill sizes="64px" className="object-cover" />
            </span>
            <span className="text-sm leading-tight text-ink-soft">{tile.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
