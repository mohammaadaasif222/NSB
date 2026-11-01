"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { PROJECT_TYPE_LABELS } from "@nsb/shared";
import { completeness, digits, type Draft, priceText } from "./project-draft";

export function Preview({ draft: d }: { draft: Draft }) {
  const prices = d.configurations.map((c) => Number(digits(c.price))).filter((n) => n > 0);
  const min = prices.length ? Math.min(...prices) : 0;
  const max = prices.length ? Math.max(...prices) : 0;
  const items = completeness(d);
  const done = items.filter(([, ok]) => ok).length;
  const percent = Math.round((done / items.length) * 100);
  const missing = items.find(([, ok]) => !ok)?.[0];
  let next: ReactNode = "This page is complete.";
  if (missing === "Video") next = "Add a video to unlock the Videos tab on the page.";
  else if (missing) next = `Next: add ${missing.toLowerCase()}.`;

  return (
    <aside className="a-card a-pc xl:sticky xl:top-20" aria-label="Live preview">
      <h3 className="mb-3! text-base font-extrabold">Live preview</h3>
      <div className="im">
        {d.photos[0] && <Image src={d.photos[0]} alt="" fill unoptimized sizes="352px" />}
        <span className={`a-pl ${d.status}`}>{d.status}</span>
      </div>
      <h4>{d.name.trim() || "Project name"}</h4>
      <p>
        {d.builder.trim() || "Builder"} · {PROJECT_TYPE_LABELS[d.type]}
      </p>
      <p>
        {d.locality.trim() && `${d.locality.trim()}, `}
        {d.area}
      </p>
      <div className="pr">
        <b>{prices.length ? (min === max ? priceText(min) : `${priceText(min)} – ${priceText(max)}`) : "Add pricing"}</b>
        <span className="a-btn s">View Number</span>
      </div>

      <div className="mt-4 border-t border-zinc-200 pt-4">
        <h3 className="mb-2.5! text-[15px] font-extrabold">
          Page completeness <span className="text-(--admin-accent)">{percent}%</span>
        </h3>
        <div className="a-meter" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Page completeness">
          <i style={{ width: `${percent}%` }} />
        </div>
        <ul className="flex flex-col gap-1 text-sm">
          {items.map(([label, ok]) => (
            <li key={label} className="flex items-center gap-2 font-semibold">
              <span className={ok ? "text-(--admin-ok)" : "text-zinc-500"} aria-hidden>
                {ok ? "✓" : "○"}
              </span>
              {label}
              <span className="sr-only">{ok ? "done" : "missing"}</span>
            </li>
          ))}
        </ul>
        <p className="a-info mt-2 text-[13px]">{next}</p>
      </div>
    </aside>
  );
}
