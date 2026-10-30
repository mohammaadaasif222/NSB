"use client";

import { type FormEvent, useState } from "react";
import type { AdminSettings, RealEstateAd } from "@nsb/shared";
import { Button, Field, TextInput, Toggle } from "@/components/admin/form";
import { ImageUpload, useSessionUploads } from "@/components/admin/image-upload";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { adminClient } from "@/lib/admin-client";

const BLANK: RealEstateAd = { enabled: true, title: "", text: "", buttonLabel: "Explore now ›", link: "", imageUrl: null, logoUrl: null };
const ROUTES = ["/real-estate", "/schools", "/wedding", "/brand-stores"];

/**
 * The dark ad banner between the project cards on the listing page and on project pages
 * (Real Estate › Sponsors & ads). Until it is saved, the demo banner shows; switched off, none.
 */
export function AdBannerForm({ ad, maxUploadBytes }: { ad: RealEstateAd | null; maxUploadBytes: number }) {
  const { run, pending } = useAdminAction();
  const trackUpload = useSessionUploads();
  const [saved, setSaved] = useState(ad);
  const [values, setValues] = useState<RealEstateAd>(ad ?? BLANK);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof RealEstateAd>(key: K, value: RealEstateAd[K]) => setValues((v) => ({ ...v, [key]: value }));

  const save = async (next: RealEstateAd | null, success: string) => {
    const result = await run(() => adminClient.patch<AdminSettings>("/admin/settings", { realEstateAd: next }), { success });
    if (result.ok) {
      setErrors({});
      // Replaced or removed images are deleted once nothing uses them.
      const dropped = [saved?.imageUrl, saved?.logoUrl].filter((url): url is string => !!url && url !== next?.imageUrl && url !== next?.logoUrl);
      if (dropped.length) adminClient.discardUploads(dropped);
      setSaved(result.data.realEstateAd);
      if (!next) setValues(BLANK);
    } else {
      setErrors(Object.fromEntries(Object.entries(result.error.fieldErrors).map(([path, message]) => [path.replace(/^realEstateAd\./, ""), message])));
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void save(values, "Ad banner saved");
  };

  return (
    <form onSubmit={onSubmit} className="a-card flex flex-col gap-4" noValidate>
      <h3 className="mb-0!">
        Ad banner <span className="a-hs0">between the listing cards and on project pages</span>
      </h3>
      <p className="a-hsub -mt-2">
        {saved
          ? "Your banner is set. Switch it off to hide it, or remove it to show the demo banner again."
          : "The demo banner (Properties in Noida) shows until you save your own."}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title *" error={errors.title} className="sm:col-span-2">
          <TextInput value={values.title} maxLength={60} placeholder="e.g. PROPERTIES IN NOIDA" invalid={!!errors.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Small line under the title" error={errors.text} className="sm:col-span-2">
          <TextInput value={values.text} maxLength={120} placeholder="e.g. Premium living & smart real estate investment" onChange={(e) => set("text", e.target.value)} />
        </Field>
        <Field label="Button label" hint="Leave blank for no button" error={errors.buttonLabel}>
          <TextInput value={values.buttonLabel} maxLength={24} placeholder="Explore now ›" onChange={(e) => set("buttonLabel", e.target.value)} />
        </Field>
        <Field label="Where should it go? (link)" hint="A page on this site such as /real-estate, or a full https:// address" error={errors.link}>
          <TextInput value={values.link} list="ad-banner-routes" maxLength={300} placeholder="https://" invalid={!!errors.link} onChange={(e) => set("link", e.target.value)} />
        </Field>
        <datalist id="ad-banner-routes">
          {ROUTES.map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ImageUpload
          label="Background picture (optional)"
          slot="ad-banner"
          value={values.imageUrl}
          onChange={(url) => set("imageUrl", url)}
          onUploaded={trackUpload}
          maxBytes={maxUploadBytes}
          error={errors.imageUrl}
        />
        <ImageUpload
          label="Sponsor logo (optional)"
          slot="ad-logo"
          value={values.logoUrl}
          onChange={(url) => set("logoUrl", url)}
          onUploaded={trackUpload}
          maxBytes={maxUploadBytes}
          error={errors.logoUrl}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-4">
        <Toggle label="Show this banner" showLabel checked={values.enabled} onChange={(v) => set("enabled", v)} />
        <div className="flex gap-2">
          {saved && (
            <Button variant="secondary" onClick={() => void save(null, "Back to the demo banner")} disabled={pending}>
              Remove banner
            </Button>
          )}
          <Button type="submit" pending={pending}>
            {pending ? "Saving…" : "Save banner"}
          </Button>
        </div>
      </div>
    </form>
  );
}
