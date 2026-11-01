"use client";

import { memo } from "react";
import { type AdminCategory, LISTING_AREAS } from "@nsb/shared";
import { Affix, Field, Select, slugify, TextArea, TextInput, Toggle } from "@/components/admin/form";
import { FormSection } from "@/components/admin/listing-fields";
import { sameStepProps } from "@/components/admin/use-stepped-form";
import type { ListingStepProps } from "../listing-draft";

const KEYS = ["name", "area", "locality", "address", "phone", "email", "notifyVendor"] as const;

export const BasicsStep = memo(function BasicsStep({
  values,
  hidden,
  errors,
  set,
  structured,
  topId,
  subId,
  setTopId,
  setSubId,
  tops,
  subs,
  oldArea,
  slugEdited,
}: ListingStepProps<(typeof KEYS)[number]> & {
  structured: boolean;
  topId: string;
  subId: string;
  setTopId: (id: string) => void;
  setSubId: (id: string) => void;
  tops: AdminCategory[];
  subs: AdminCategory[];
  oldArea: string | null;
  slugEdited: boolean;
}) {
  const unfiled = topId && !subId && subs.length > 0;

  return (
    <div hidden={hidden} className="flex flex-col gap-5">
      <FormSection title="Where does this listing go?">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category *" error={errors.categoryId}>
            <Select
              value={topId}
              invalid={!!errors.categoryId}
              onChange={(e) => {
                setTopId(e.target.value);
                setSubId(""); // a sub-category always belongs to the chosen category
              }}
            >
              <option value="">Choose…</option>
              {tops.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.isActive ? "" : " (hidden)"}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label={structured ? "Sub-category *" : "Sub-category"}
            error={errors.subId}
            hint={subs.length === 0 && topId ? "This category has no sub-categories yet." : undefined}
          >
            <Select value={subId} invalid={!!errors.subId} onChange={(e) => setSubId(e.target.value)} disabled={subs.length === 0}>
              <option value="">{structured ? "Choose…" : "None"}</option>
              {subs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.isActive ? "" : " (hidden)"}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        {unfiled && !structured && (
          <p className="text-xs text-amber-700">
            The site lists vendors inside sub-categories (for example Wedding › Wedding Venues). Without one, this listing is saved but does
            not appear on a category page.
          </p>
        )}
        <p className="text-xs text-zinc-500">Only categories with a listing form are offered. Wedding is open for now.</p>
      </FormSection>

      <FormSection title="Basic details" tag="Same for every listing">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business name *" error={errors.name} className="sm:col-span-2">
            <TextInput
              value={values.name}
              maxLength={120}
              required
              placeholder="e.g. Royal Orchid Banquet"
              invalid={!!errors.name}
              onChange={(e) => {
                set("name", e.target.value);
                if (!slugEdited) set("slug", slugify(e.target.value));
              }}
            />
          </Field>
          <Field label="Area *" error={errors.area} hint={oldArea && !values.area ? `Was “${oldArea}”. Choose one of the areas NSB covers.` : undefined}>
            <Select value={values.area} invalid={!!errors.area} onChange={(e) => set("area", e.target.value)}>
              <option value="">Choose…</option>
              {LISTING_AREAS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </Select>
          </Field>
          <Field label="Locality / sector" error={errors.locality}>
            <TextInput value={values.locality} maxLength={120} placeholder="e.g. Sector 18" onChange={(e) => set("locality", e.target.value)} />
          </Field>
        </div>
        <Field label="Full address" error={errors.address}>
          <TextArea value={values.address} onChange={(e) => set("address", e.target.value)} rows={2} maxLength={300} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={structured ? "Phone *" : "Phone"} hint="Private, never shown on the site" error={errors.phone}>
            <Affix before="+91">
              <TextInput
                type="tel"
                inputMode="numeric"
                value={values.phone}
                maxLength={structured ? 14 : 20}
                placeholder="98XXXXXXXX"
                className="pl-12"
                invalid={!!errors.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </Affix>
          </Field>
          <Field label="Email for leads" hint="Optional and private. Leave blank if this vendor should not get emails." error={errors.email}>
            <TextInput type="email" value={values.email} placeholder="owner@business.com" onChange={(e) => set("email", e.target.value)} invalid={!!errors.email} />
          </Field>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5">
          <Toggle label="Send enquiries to this vendor" showLabel checked={values.notifyVendor} onChange={(v) => set("notifyVendor", v)} />
          <span className="text-xs text-zinc-500">
            {values.notifyVendor
              ? values.email.trim()
                ? "Each enquiry is emailed to the vendor and to NSB."
                : "Add an email above, or enquiries reach NSB only."
              : "Off: enquiries for this listing reach NSB only; the vendor is never emailed."}
          </span>
        </div>
      </FormSection>
    </div>
  );
}, sameStepProps(KEYS));
