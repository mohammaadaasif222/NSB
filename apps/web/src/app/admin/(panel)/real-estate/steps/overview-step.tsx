"use client";

import { memo } from "react";
import { Field, TextArea, TextInput } from "@/components/admin/form";
import { sameStepProps } from "@/components/admin/use-stepped-form";
import type { ProjectStepProps } from "../project-draft";

const KEYS = ["units", "landArea", "towers", "about", "highlights"] as const;

export const OverviewStep = memo(function OverviewStep({
  values: d,
  hidden,
  errors,
  edit: { set },
}: ProjectStepProps<(typeof KEYS)[number]>) {
  return (
    <div hidden={hidden} className="grid gap-4 sm:grid-cols-3">
      <Field label="Project units" error={errors.units}>
        <TextInput inputMode="numeric" value={d.units} placeholder="640" onChange={(e) => set("units", e.target.value)} invalid={!!errors.units} />
      </Field>
      <Field label="Project area" error={errors.landArea}>
        <TextInput value={d.landArea} maxLength={40} placeholder="e.g. 6.5 Acres" onChange={(e) => set("landArea", e.target.value)} />
      </Field>
      <Field label="Number of towers" error={errors.towers}>
        <TextInput inputMode="numeric" value={d.towers} placeholder="4" onChange={(e) => set("towers", e.target.value)} invalid={!!errors.towers} />
      </Field>
      <Field label="About the project" error={errors.about} className="sm:col-span-3">
        <TextArea rows={6} maxLength={5000} value={d.about} placeholder="Write 2 short paragraphs. Leave a blank line between paragraphs." onChange={(e) => set("about", e.target.value)} />
      </Field>
      <Field label="Highlights (shown as 8 points)" hint="One highlight per line, up to 8." error={errors.highlights} className="sm:col-span-3">
        <TextArea
          rows={5}
          value={d.highlights}
          placeholder={"Mivan aluminium formwork\nDouble-height entrance lobby\nJust 2.8 km from metro station"}
          onChange={(e) => set("highlights", e.target.value)}
        />
      </Field>
    </div>
  );
}, sameStepProps(KEYS));
