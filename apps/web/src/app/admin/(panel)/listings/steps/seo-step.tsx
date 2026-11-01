"use client";

import { memo } from "react";
import type { AdminCategory } from "@nsb/shared";
import { Field, TextInput } from "@/components/admin/form";
import { FormSection } from "@/components/admin/listing-fields";
import { sameStepProps } from "@/components/admin/use-stepped-form";
import type { ListingStepProps } from "../listing-draft";

const KEYS = ["slug"] as const;

export const SeoStep = memo(function SeoStep({
  values,
  hidden,
  errors,
  set,
  top,
  sub,
  setSlugEdited,
}: ListingStepProps<(typeof KEYS)[number]> & { top?: AdminCategory; sub?: AdminCategory; setSlugEdited: (edited: boolean) => void }) {
  return (
    <div hidden={hidden} className="flex flex-col gap-5">
      <FormSection title="SEO">
        <Field
          label="URL slug *"
          hint={`Lowercase letters, numbers and hyphens. Page address: /${top?.slug ?? "wedding"}/${sub?.slug ?? "…"}/${values.slug || "…"}`}
          error={errors.slug}
        >
          <TextInput
            value={values.slug}
            maxLength={120}
            required
            invalid={!!errors.slug}
            onChange={(e) => {
              setSlugEdited(true);
              set("slug", e.target.value);
            }}
          />
        </Field>
      </FormSection>
    </div>
  );
}, sameStepProps(KEYS));
