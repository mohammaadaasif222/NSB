"use client";

import { memo } from "react";
import { LISTING_STATUSES, type ListingStatus, PROJECT_TERM_MONTHS } from "@nsb/shared";
import { todayInIndia } from "@nsb/shared/client";
import { Affix, Button, Field, Select, TextInput } from "@/components/admin/form";
import { sameStepProps } from "@/components/admin/use-stepped-form";
import type { ProjectStepProps } from "../project-draft";

const KEYS = ["phone", "brochureUrl", "termStart", "termMonths", "status", "advertiser"] as const;

const STATUS_LABELS: Record<ListingStatus, string> = { draft: "Draft (hidden on the site)", live: "Live", hidden: "Hidden (taken off the site)" };

export const PublishStep = memo(function PublishStep({
  values: d,
  hidden,
  errors,
  edit: { set },
  planPrice,
  pending,
}: ProjectStepProps<(typeof KEYS)[number]> & { planPrice: number; pending: boolean }) {
  const isBroker = d.advertiser.type === "broker";

  return (
    <div hidden={hidden} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Contact number (shown after View Number)" hint="Leads from the site go to this number" error={errors.phone}>
          <Affix before="+91">
            <TextInput type="tel" inputMode="numeric" className="pl-12" value={d.phone} maxLength={14} placeholder="9876543210" invalid={!!errors.phone} onChange={(e) => set("phone", e.target.value)} />
          </Affix>
        </Field>
        <Field label="Brochure link (PDF)" hint="Visitors get it after sharing their number" error={errors.brochureUrl}>
          <TextInput type="url" inputMode="url" value={d.brochureUrl} maxLength={500} placeholder="https://…/brochure.pdf" invalid={!!errors.brochureUrl} onChange={(e) => set("brochureUrl", e.target.value)} />
        </Field>
        <Field label="Term starts" error={errors.termStart}>
          <TextInput type="date" value={d.termStart} onChange={(e) => set("termStart", e.target.value || todayInIndia())} />
        </Field>
        <Field label="Term length" error={errors.termMonths}>
          <Select value={d.termMonths} onChange={(e) => set("termMonths", e.target.value)}>
            {PROJECT_TERM_MONTHS.map((m) => (
              <option key={m} value={m}>
                {m === 12 ? "12 months (real estate)" : `${m} months`}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status" error={errors.status}>
          <Select value={d.status} onChange={(e) => set("status", e.target.value as ListingStatus)}>
            {LISTING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <p className="a-info text-sm">
        Plan: ₹{planPrice.toLocaleString("en-IN")} for 1 year. 1 project, 1 broker. Leads go only to this {isBroker ? "broker" : "builder"}.
      </p>
      <Button type="submit" className="self-start" pending={pending}>
        {pending ? "Saving…" : "Save listing"}
      </Button>
    </div>
  );
}, sameStepProps(KEYS));
