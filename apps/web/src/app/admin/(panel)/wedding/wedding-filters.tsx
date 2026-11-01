"use client";

import type { ReactNode } from "react";
import { AreaSelect, FilterForm, FilterSearch, submitFilters } from "@/components/admin/filters";

export interface WeddingFilterValues {
  sub: string;
  q: string;
  area: string;
  status: string;
  sort: "new" | "az" | "lead";
}

/** The demo's tools row: search, location, status chips (children) and sort. Selects apply straight away. */
export function WeddingFilters({ values, children }: { values: WeddingFilterValues; children: ReactNode }) {
  return (
    <FilterForm values={values} action="/admin/wedding" className="a-tl">
      {values.sub && <input type="hidden" name="sub" value={values.sub} />}
      {values.status && <input type="hidden" name="status" value={values.status} />}
      <FilterSearch value={values.q} placeholder="Search name, area or locality" label="Search listings" />
      <AreaSelect value={values.area} />
      {children}
      <select name="sort" className="a-sel ml-auto" defaultValue={values.sort} onChange={submitFilters} aria-label="Sort">
        <option value="new">Newest first</option>
        <option value="lead">Most leads</option>
        <option value="az">Name A–Z</option>
      </select>
    </FilterForm>
  );
}
