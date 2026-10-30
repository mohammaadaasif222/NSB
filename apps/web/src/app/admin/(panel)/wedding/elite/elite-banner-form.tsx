"use client";

import { type FormEvent, useState } from "react";
import { type AdminCategory, type AdminSettings, defaultEliteBanner, type EliteBanner as Banner, type EliteBanners } from "@nsb/shared";
import { Button, Field, TextArea, TextInput, Toggle } from "@/components/admin/form";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { EliteBanner } from "@/components/site/listing/elite-banner";
import { adminClient } from "@/lib/admin-client";

/** One sub-category's black banner, with a live preview. */
export function EliteBannerForm({ category, banners }: { category: AdminCategory; banners: EliteBanners }) {
  const { run, pending } = useAdminAction();
  const [values, setValues] = useState<Banner>(banners[category.slug] ?? defaultEliteBanner(category.name));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof Banner>(key: K, value: Banner[K]) => setValues((v) => ({ ...v, [key]: value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const eliteBanners = { ...banners, [category.slug]: values };
    const result = await run(() => adminClient.patch<AdminSettings>("/admin/settings", { eliteBanners }), { success: "Banner saved" });
    setErrors(result.ok ? {} : Object.fromEntries(Object.entries(result.error.fieldErrors).map(([path, message]) => [path.split(".").pop()!, message])));
  };

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="a-card flex flex-col gap-4" noValidate>
      <h3 className="mb-0!">Black banner for {category.name}</h3>
      <p className="a-hsub -mt-2">Shows above the listings on the first page only, while that page has an Elite listing. Phones show just the crown and the gold line.</p>
      <Toggle label="Show the banner" showLabel checked={values.enabled} onChange={(v) => set("enabled", v)} />
      {values.title && <EliteBanner banner={values} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Gold line" error={errors.eyebrow}>
          <TextInput value={values.eyebrow} maxLength={30} placeholder="THE ELITE 10" onChange={(e) => set("eyebrow", e.target.value)} />
        </Field>
        <Field label="Title *" error={errors.title}>
          <TextInput value={values.title} maxLength={80} invalid={!!errors.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Text" error={errors.text} className="sm:col-span-2">
          <TextArea value={values.text} maxLength={160} rows={2} onChange={(e) => set("text", e.target.value)} />
        </Field>
        <Field label="Button label" hint="Blank hides the button" error={errors.buttonLabel}>
          <TextInput value={values.buttonLabel} maxLength={24} onChange={(e) => set("buttonLabel", e.target.value)} />
        </Field>
        <Field label="Button link" hint="Blank scrolls to the listings. Or a page such as /wedding, or a full https:// address" error={errors.link}>
          <TextInput value={values.link} maxLength={300} invalid={!!errors.link} onChange={(e) => set("link", e.target.value)} />
        </Field>
      </div>
      <div className="flex justify-end">
        <Button type="submit" pending={pending}>
          {pending ? "Saving…" : "Save banner"}
        </Button>
      </div>
    </form>
  );
}
