"use client";

import Form from "next/form";
import type { ChangeEvent, ReactNode } from "react";
import { Search } from "lucide-react";
import { LISTING_AREAS } from "@nsb/shared";

/** For selects and date inputs: their filter applies straight away. */
export const submitFilters = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => e.currentTarget.form?.requestSubmit();

/**
 * A filter bar as a GET form, so filters live in the URL. `values` is what the URL holds: when it
 * changes (a status chip, "Clear") the key resets the inputs.
 */
export function FilterForm({ values, action, className, children }: { values: unknown; action: string; className: string; children: ReactNode }) {
  return (
    <Form key={JSON.stringify(values)} action={action} className={className}>
      {children}
    </Form>
  );
}

/** The tools row's search box. */
export function FilterSearch({ value, placeholder, label }: { value: string; placeholder: string; label: string }) {
  return (
    <label className="a-gs">
      <Search size={16} aria-hidden />
      <input name="q" type="search" defaultValue={value} placeholder={placeholder} aria-label={label} maxLength={100} />
    </label>
  );
}

/** The tools row's location select. */
export function AreaSelect({ value }: { value: string }) {
  return (
    <select name="area" className="a-sel" defaultValue={value} onChange={submitFilters} aria-label="Location">
      <option value="">All locations</option>
      {LISTING_AREAS.map((a) => (
        <option key={a}>{a}</option>
      ))}
    </select>
  );
}
