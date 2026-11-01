"use client";

import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import type { ListingSummary } from "@nsb/shared";
import { IconButton } from "@/components/admin/form";
import { ListingCard, type ListingView } from "@/components/shared/listing-card";

/** The real site card, filled from the form as you type. */
export function CardPreview({ listing }: { listing: ListingSummary }) {
  const [view, setView] = useState<ListingView>("grid");
  return (
    <aside aria-label="Card preview" className="flex flex-col gap-3 xl:sticky xl:top-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Preview on the site</h2>
        <div className="flex rounded-md border border-zinc-300 bg-white p-0.5">
          {(["grid", "list"] as const).map((v) => (
            <IconButton key={v} label={v === "grid" ? "Grid card" : "List card"} aria-pressed={view === v} onClick={() => setView(v)} className="aria-pressed:bg-zinc-900 aria-pressed:text-white">
              {v === "grid" ? <LayoutGrid className="size-4" aria-hidden /> : <List className="size-4" aria-hidden />}
            </IconButton>
          ))}
        </div>
      </div>
      <div inert className="rounded-lg bg-white p-4 font-sans shadow-sm ring-1 ring-zinc-200">
        <ListingCard listing={listing} href="#" view={view} />
      </div>
      <p className="text-xs text-zinc-500">The card shows the first four key details. Highlighted fields such as price come first.</p>
    </aside>
  );
}
