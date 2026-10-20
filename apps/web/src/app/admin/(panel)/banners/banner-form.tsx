"use client";

import { type FormEvent, useState } from "react";
import type { Banner, BannerInput } from "@nsb/shared";
import { Button, Field, TextInput, Toggle } from "@/components/admin/form";
import { ImageUpload, useSessionUploads } from "@/components/admin/image-upload";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { adminClient } from "@/lib/admin-client";

/** Create (no `banner`) or edit a hero banner. Images upload as soon as they are picked. */
export function BannerForm({ banner, maxUploadBytes, onDone }: { banner?: Banner; maxUploadBytes: number; onDone: () => void }) {
  const { run, pending } = useAdminAction();
  const trackUpload = useSessionUploads();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState({
    heading: banner?.heading ?? "",
    subheading: banner?.subheading ?? "",
    ctaLabel: banner?.ctaLabel ?? "",
    ctaLink: banner?.ctaLink ?? "",
    imageUrl: banner?.imageUrl ?? null,
    mobileImageUrl: banner?.mobileImageUrl ?? null,
    isActive: banner?.isActive ?? true,
  });
  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => setValues((v) => ({ ...v, [key]: value }));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    const body: BannerInput = values;
    const result = await run(() => (banner ? adminClient.patch(`/admin/banners/${banner.id}`, body) : adminClient.post("/admin/banners", body)), {
      success: banner ? "Banner saved" : "Banner added",
    });
    if (result.ok) onDone();
    else setErrors(result.error.fieldErrors);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <p className="-mb-1 rounded-md bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
        The home slider shows the image only, with no text or button on it. Put any wording into the image itself. Tapping the slide opens
        the link below.
      </p>
      <Field label="Banner name" hint="Not shown on the image. Used in this list and read out by screen readers." error={errors.heading}>
        <TextInput value={values.heading} onChange={(e) => set("heading", e.target.value)} required maxLength={120} invalid={!!errors.heading} />
      </Field>
      <Field label="Link" hint="Where a tap on the slide goes: a site path such as /wedding, or a full URL" error={errors.ctaLink}>
        <TextInput value={values.ctaLink} onChange={(e) => set("ctaLink", e.target.value)} maxLength={300} placeholder="/wedding" />
      </Field>
      <ImageUpload
        label="Image"
        slot="banner"
        value={values.imageUrl}
        onChange={(url) => set("imageUrl", url)}
        onUploaded={trackUpload}
        maxBytes={maxUploadBytes}
        error={errors.imageUrl}
      />
      <ImageUpload
        label="Mobile image (optional)"
        slot="banner-mobile"
        value={values.mobileImageUrl}
        onChange={(url) => set("mobileImageUrl", url)}
        onUploaded={trackUpload}
        maxBytes={maxUploadBytes}
        error={errors.mobileImageUrl}
      />
      <p className="-mt-2 text-xs text-zinc-500">
        Phones use the desktop image when no mobile image is set. The slide has rounded corners and is cropped to fill, so keep
        important content away from the edges.
      </p>
      <Toggle label="Show on the home page" showLabel checked={values.isActive} onChange={(v) => set("isActive", v)} />
      <div className="flex justify-end gap-2 border-t border-zinc-200 pt-4">
        <Button variant="secondary" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" pending={pending}>
          {pending ? "Saving…" : banner ? "Save banner" : "Add banner"}
        </Button>
      </div>
    </form>
  );
}
