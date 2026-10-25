"use client";

import Form from "next/form";
import { type ReactNode, useRef } from "react";
import { Search } from "lucide-react";
import { type AdminCategory, type LeadStatus, PROJECT_LEAD_SOURCES, PROJECT_TYPE_LABELS, PROJECT_TYPES, type ProjectType } from "@nsb/shared";

export interface LeadFilterValues {
  section: "real-estate" | "wedding";
  q: string;
  /** Wedding: a sub-category id. */
  category: string;
  /** Real estate: a property type and a source button. */
  type: ProjectType | "";
  source: string;
  leadStatus: LeadStatus | "";
  /** "unread" to show only leads nobody has opened. */
  status: "unread" | "";
  from: string;
  to: string;
}

/**
 * The demo's leads tools row as a GET form, so filters live in the URL. Selects and dates apply
 * straight away; the status chips (links, passed as children) keep the other filters.
 */
export function LeadFilters({ values, subCategories, children }: { values: LeadFilterValues; subCategories: AdminCategory[]; children: ReactNode }) {
  const form = useRef<HTMLFormElement>(null);
  const submit = () => form.current?.requestSubmit();
  const wedding = values.section === "wedding";
  return (
    <Form key={JSON.stringify(values)} ref={form} action="/admin/enquiries" className="a-tl">
      <input type="hidden" name="section" value={values.section} />
      {values.leadStatus && <input type="hidden" name="leadStatus" value={values.leadStatus} />}
      {values.status && <input type="hidden" name="status" value={values.status} />}
      <label className="a-gs">
        <Search size={16} aria-hidden />
        <input name="q" type="search" defaultValue={values.q} placeholder="Search name or listing" aria-label="Search leads" maxLength={100} />
      </label>
      {wedding ? (
        <select name="category" className="a-sel" defaultValue={values.category} onChange={submit} aria-label="Sub-category">
          <option value="">All sub-categories</option>
          {subCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      ) : (
        <>
          <select name="type" className="a-sel" defaultValue={values.type} onChange={submit} aria-label="Property type">
            <option value="">All property types</option>
            {PROJECT_TYPES.map((t) => (
              <option key={t} value={t}>
                {PROJECT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <select name="source" className="a-sel" defaultValue={values.source} onChange={submit} aria-label="Source">
            <option value="">All sources</option>
            {PROJECT_LEAD_SOURCES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </>
      )}
      {children}
      <span className="ml-auto flex items-center gap-1.5 text-xs text-zinc-500">
        <input type="date" name="from" className="a-sel" defaultValue={values.from} max={values.to || undefined} onChange={submit} aria-label="Received from" />
        to
        <input type="date" name="to" className="a-sel" defaultValue={values.to} min={values.from || undefined} onChange={submit} aria-label="Received to" />
      </span>
    </Form>
  );
}
