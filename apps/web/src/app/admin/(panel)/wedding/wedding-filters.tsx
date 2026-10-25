"use client";

import Form from "next/form";
import { type ReactNode, useRef } from "react";
import { Search } from "lucide-react";
import { LISTING_AREAS } from "@nsb/shared";

export interface WeddingFilterValues {
  sub: string;
  q: string;
  area: string;
  status: string;
  sort: "new" | "az" | "lead";
}

/** The demo's tools row: search, location, status chips (children) and sort. Selects apply straight away. */
export function WeddingFilters({ values, children }: { values: WeddingFilterValues; children: ReactNode }) {
  const form = useRef<HTMLFormElement>(null);
  const submit = () => form.current?.requestSubmit();
  return (
    <Form key={JSON.stringify(values)} ref={form} action="/admin/wedding" className="a-tl">
      {values.sub && <input type="hidden" name="sub" value={values.sub} />}
      {values.status && <input type="hidden" name="status" value={values.status} />}
      <label className="a-gs">
        <Search size={16} aria-hidden />
        <input name="q" type="search" defaultValue={values.q} placeholder="Search name, area or locality" aria-label="Search listings" maxLength={100} />
      </label>
      <select name="area" className="a-sel" defaultValue={values.area} onChange={submit} aria-label="Location">
        <option value="">All locations</option>
        {LISTING_AREAS.map((a) => (
          <option key={a}>{a}</option>
        ))}
      </select>
      {children}
      <select name="sort" className="a-sel ml-auto" defaultValue={values.sort} onChange={submit} aria-label="Sort">
        <option value="new">Newest first</option>
        <option value="lead">Most leads</option>
        <option value="az">Name A–Z</option>
      </select>
    </Form>
  );
}
