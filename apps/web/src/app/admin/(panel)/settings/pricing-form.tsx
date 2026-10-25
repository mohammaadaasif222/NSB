"use client";

import { type FormEvent, useState } from "react";
import { type AdminCategory, type AdminSettings, DEFAULT_SLOT_PRICE, type Pricing } from "@nsb/shared";
import { Button } from "@/components/admin/form";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { adminClient } from "@/lib/admin-client";

/**
 * Settings › Slot pricing, as in the demo: a 6-month price per wedding sub-category and the real
 * estate plan for a year. The real estate price shows in the project form and on the dashboard.
 */
export function PricingForm({ pricing, subCategories }: { pricing: Pricing; subCategories: AdminCategory[] }) {
  const { run, pending } = useAdminAction();
  const [values, setValues] = useState<Record<string, string>>(() => ({
    ...Object.fromEntries(subCategories.map((c) => [c.slug, String(pricing.categories[c.slug] ?? DEFAULT_SLOT_PRICE)])),
    "real-estate": String(pricing.realEstate),
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const body: Pricing = {
      // Prices of sub-categories no longer listed are kept.
      categories: { ...pricing.categories, ...Object.fromEntries(subCategories.map((c) => [c.slug, Number(values[c.slug] || 0)])) },
      realEstate: Number(values["real-estate"] || 0),
    };
    const result = await run(() => adminClient.patch<AdminSettings>("/admin/settings", { pricing: body }), { success: "Pricing saved" });
    setErrors(result.ok ? {} : result.error.fieldErrors);
  };

  const row = (key: string, label: string, error?: string) => (
    <label key={key} className="a-pr2">
      <span>{label}</span>₹
      <input
        className="a-in"
        inputMode="numeric"
        value={values[key] ?? ""}
        aria-invalid={!!error || undefined}
        onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value.replace(/[^\d]/g, "") }))}
      />
    </label>
  );

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="a-card" noValidate>
      <h3>Slot pricing (6-month wedding season)</h3>
      {subCategories.map((c) => row(c.slug, c.name, errors[`pricing.categories.${c.slug}`]))}
      {row("real-estate", "Real estate project (1 year)", errors["pricing.realEstate"])}
      <div className="mt-3.5">
        <Button type="submit" pending={pending}>
          {pending ? "Saving…" : "Save pricing"}
        </Button>
      </div>
    </form>
  );
}
