"use client";

import { type AdminCategory, type AdminListing, LISTING_STATUSES, type ListingStatus } from "@nsb/shared";
import { Field, Select, TextInput, Toggle } from "@/components/admin/form";
import { FormSection } from "@/components/admin/listing-fields";
import type { ListingStepProps } from "../listing-draft";

const STATUS_LABELS: Record<ListingStatus, { label: string; hint: string }> = {
  live: { label: "Live", hint: "Shown on the website." },
  draft: { label: "Draft", hint: "Still being prepared. Not shown on the website." },
  hidden: { label: "Hidden", hint: "Taken off the website for now. Its enquiries and data are kept." },
};

/** Slots and terms are static for now: shown as in the demo, never saved. */
const TERM_MONTHS = 6;
const SLOTS_PER_AREA = 10;
const termDate = (iso: string, months = 0) => {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

/** Not memoised: a new listing's term dates read the clock on every render. */
export function SlotStep({
  values,
  hidden,
  set,
  sub,
  listing,
}: Omit<ListingStepProps<"area" | "status" | "isFeatured">, "errors"> & { sub?: AdminCategory; listing?: AdminListing }) {
  return (
    <div hidden={hidden} className="flex flex-col gap-5">
      <FormSection title="Slot & Term" tag="Static for now">
        <p className="a-info text-sm">
          {sub && values.area ? (
            <>
              <b>
                {SLOTS_PER_AREA} slots
              </b>{" "}
              in {sub.name}, {values.area}. Each vendor takes one slot for a {TERM_MONTHS}-month term.
            </>
          ) : (
            <>Choose a sub-category and area in Basics to see its slots. Each vendor takes one slot for a {TERM_MONTHS}-month term.</>
          )}{" "}
          Slots and terms are not saved yet.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Term starts">
            <TextInput value={termDate(listing?.createdAt ?? new Date().toISOString())} readOnly disabled />
          </Field>
          <Field label="Term length">
            <Select value={String(TERM_MONTHS)} disabled onChange={() => {}}>
              <option value="6">6 months (wedding season)</option>
            </Select>
          </Field>
          <Field label="Ends on">
            <TextInput value={termDate(listing?.createdAt ?? new Date().toISOString(), TERM_MONTHS)} readOnly disabled />
          </Field>
        </div>
      </FormSection>
      <FormSection title="Status">
        <Field label="Status" hint={STATUS_LABELS[values.status].hint} className="sm:max-w-xs">
          <Select value={values.status} onChange={(e) => set("status", e.target.value as ListingStatus)}>
            {LISTING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s].label}
              </option>
            ))}
          </Select>
        </Field>
        <Toggle label="Show as featured (listed first and on the home page)" showLabel checked={values.isFeatured} onChange={(v) => set("isFeatured", v)} />
      </FormSection>
    </div>
  );
}
