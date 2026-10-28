"use client";

import Form from "next/form";
import type { ReactNode } from "react";
import { useRef } from "react";
import { Search } from "lucide-react";
import { type ADMIN_PROJECT_SORTS, type AdminProjectQuery, LISTING_AREAS, PROJECT_TYPE_LABELS, PROJECT_TYPES, type ProjectType } from "@nsb/shared";

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
  const form = useRef<HTMLFormElement>(null);
  const submit = () => form.current?.requestSubmit();
  return (
    // key: reset the inputs when the URL changes (e.g. a status chip).
    <Form key={JSON.stringify(values)} ref={form} action="/admin/real-estate" className="a-tl">
      {values.status && <input type="hidden" name="status" value={values.status} />}
      <label className="a-gs">
        <Search size={16} aria-hidden />
        <input name="q" type="search" defaultValue={values.q} placeholder="Search name, builder or tag" aria-label="Search projects" maxLength={100} />
      </label>
      <select name="type" className="a-sel" defaultValue={values.type} onChange={submit} aria-label="Property type">
        <option value="">All property types</option>
        {PROJECT_TYPES.map((t) => (
          <option key={t} value={t}>
            {PROJECT_TYPE_LABELS[t]}
          </option>
        ))}
      </select>
      <select name="area" className="a-sel" defaultValue={values.area} onChange={submit} aria-label="Location">
        <option value="">All locations</option>
        {LISTING_AREAS.map((a) => (
          <option key={a}>{a}</option>
        ))}
      </select>
      {children}
      <select name="sort" className="a-sel ml-auto" defaultValue={values.sort} onChange={submit} aria-label="Sort">
        <option value="new">Newest first</option>
        <option value="exp">Expiring soon</option>
        <option value="lead">Most leads</option>
        <option value="az">Name A–Z</option>
      </select>
    </Form>
  );
}
