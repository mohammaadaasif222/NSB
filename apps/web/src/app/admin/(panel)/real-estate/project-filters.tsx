"use client";

import type { ReactNode } from "react";
import { type ADMIN_PROJECT_SORTS, type AdminProjectQuery, PROJECT_TYPE_LABELS, PROJECT_TYPES, type ProjectType } from "@nsb/shared";
import { AreaSelect, FilterForm, FilterSearch, submitFilters } from "@/components/admin/filters";

export interface ProjectFilterValues {
  q: string;
  type: ProjectType | "";
  area: string;
  status: NonNullable<AdminProjectQuery["status"]> | "";
  sort: (typeof ADMIN_PROJECT_SORTS)[number];
}

/**
 * The demo's tools row as a GET form: filters live in the URL. The selects apply straight away;
 * the status chips (links, passed as children) keep the other filters.
 */
export function ProjectFilters({ values, children }: { values: ProjectFilterValues; children: ReactNode }) {
  return (
    <FilterForm values={values} action="/admin/real-estate" className="a-tl">
      {values.status && <input type="hidden" name="status" value={values.status} />}
      <FilterSearch value={values.q} placeholder="Search name, builder or tag" label="Search projects" />
      <select name="type" className="a-sel" defaultValue={values.type} onChange={submitFilters} aria-label="Property type">
        <option value="">All property types</option>
        {PROJECT_TYPES.map((t) => (
          <option key={t} value={t}>
            {PROJECT_TYPE_LABELS[t]}
          </option>
        ))}
      </select>
      <AreaSelect value={values.area} />
      {children}
      <select name="sort" className="a-sel ml-auto" defaultValue={values.sort} onChange={submitFilters} aria-label="Sort">
        <option value="new">Newest first</option>
        <option value="exp">Expiring soon</option>
        <option value="lead">Most leads</option>
        <option value="az">Name A–Z</option>
      </select>
    </FilterForm>
  );
}
