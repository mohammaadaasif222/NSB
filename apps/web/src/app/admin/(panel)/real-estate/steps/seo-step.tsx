"use client";

import { memo } from "react";
import { Plus } from "lucide-react";
import { PROJECT_LIMITS, projectSlug, toSlug } from "@nsb/shared";
import { Button, Field, TextArea, TextInput } from "@/components/admin/form";
import { sameStepProps } from "@/components/admin/use-stepped-form";
import type { ProjectStepProps } from "../project-draft";

const KEYS = ["faqs", "slug", "name", "area", "metaTitle", "metaDescription"] as const;

export const SeoStep = memo(function SeoStep({
  values: d,
  hidden,
  errors,
  edit: { set, setRow, addRow, removeRow },
  savedSlug,
}: ProjectStepProps<(typeof KEYS)[number]> & { savedSlug: string | null }) {
  return (
    <div hidden={hidden} className="flex flex-col gap-4">
      <p className="a-info text-sm">Price, possession, RERA and builder questions are created automatically. Add your own below.</p>
      {d.faqs.map((f, i) => (
        <div key={i} className="a-hc">
          <Field label="Question" error={errors[`faqs.${i}.question`]}>
            <TextInput value={f.question} maxLength={200} placeholder="Is there a home loan facility?" onChange={(e) => setRow("faqs", i, { question: e.target.value })} />
          </Field>
          <Field label="Answer" error={errors[`faqs.${i}.answer`]}>
            <TextArea rows={2} maxLength={1000} value={f.answer} placeholder="Yes…" onChange={(e) => setRow("faqs", i, { answer: e.target.value })} />
          </Field>
          <Button variant="secondary" className="self-start" onClick={() => removeRow("faqs", i)}>
            Remove
          </Button>
        </div>
      ))}
      {d.faqs.length < PROJECT_LIMITS.faqs && (
        <Button variant="secondary" className="self-start" onClick={() => addRow("faqs", { question: "", answer: "" })}>
          <Plus className="size-4" aria-hidden /> Add FAQ
        </Button>
      )}
      <h4 className="mt-2 font-extrabold">SEO</h4>
      {savedSlug ? (
        <Field label="URL slug" hint="Fixed when the project was created, so links to the page keep working.">
          <TextInput value={`/real-estate/${savedSlug}`} readOnly />
        </Field>
      ) : (
        <Field
          label="URL slug"
          hint="The page address after /real-estate/. Leave blank to make it from the name and area. It cannot be changed after the project is created."
          error={errors.slug}
        >
          <TextInput
            value={d.slug}
            maxLength={120}
            placeholder={projectSlug(d.name, d.area) || "project-name-area"}
            invalid={!!errors.slug}
            onChange={(e) => set("slug", e.target.value)}
            onBlur={() => set("slug", toSlug(d.slug))}
          />
        </Field>
      )}
      <Field label="Meta title" hint="Leave blank to use the project name and sector." error={errors.metaTitle}>
        <TextInput value={d.metaTitle} maxLength={70} placeholder="Auto-created from the project name" onChange={(e) => set("metaTitle", e.target.value)} />
      </Field>
      <Field label="Meta description" hint="Leave blank to describe the configurations, price and possession." error={errors.metaDescription}>
        <TextArea rows={2} maxLength={170} value={d.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} />
      </Field>
    </div>
  );
}, sameStepProps(KEYS));
