"use client";

import { type FormEvent, useState } from "react";
import type { AdminSettings, ProjectSideAd } from "@nsb/shared";
import { Button, Field, TextArea, TextInput, Toggle } from "@/components/admin/form";
import { ImageUpload, useSessionUploads } from "@/components/admin/image-upload";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { adminClient } from "@/lib/admin-client";

const BLANK: ProjectSideAd = { enabled: true, title: "", text: "", buttonLabel: "Know more", link: "", imageUrl: null };
const ROUTES = ["/schools", "/real-estate", "/wedding", "/brand-stores"];

/**
 * The project page's sponsored card, under the callback box (Real Estate › Sponsors & ads). NSB
 * does not cross-sell real estate, so it is for sponsors that do not compete with the listing.
 */
export function SideAdForm({ ad, maxUploadBytes }: { ad: ProjectSideAd | null; maxUploadBytes: number }) {
  const { run, pending } = useAdminAction();
  const trackUpload = useSessionUploads();
  const [saved, setSaved] = useState(ad);
  const [values, setValues] = useState<ProjectSideAd>(ad ?? BLANK);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof ProjectSideAd>(key: K, value: ProjectSideAd[K]) => setValues((v) => ({ ...v, [key]: value }));

  const save = async (next: ProjectSideAd | null, success: string) => {
    const result = await run(() => adminClient.patch<AdminSettings>("/admin/settings", { projectSideAd: next }), { success });
    if (result.ok) {
      setErrors({});
      // A replaced or removed image is deleted once nothing uses it.
      if (saved?.imageUrl && saved.imageUrl !== next?.imageUrl) adminClient.discardUploads([saved.imageUrl]);
      setSaved(result.data.projectSideAd);
      if (!next) setValues(BLANK);
    } else {
      setErrors(Object.fromEntries(Object.entries(result.error.fieldErrors).map(([path, message]) => [path.replace(/^projectSideAd\./, ""), message])));
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void save(values, "Sidebar ad saved");
  };

  return (
    <form onSubmit={onSubmit} className="a-card flex flex-col gap-4" noValidate>
      <h3 className="mb-0!">
        Project page sidebar ad <span className="a-hs0">below the call back box</span>
      </h3>
      <p className="a-hsub -mt-2">
        We do not cross-sell real estate, so this slot is for sponsors only: a school, a home loan or another service that does not compete with the listing.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title *" error={errors.title} className="sm:col-span-2">
          <TextInput value={values.title} maxLength={80} placeholder="e.g. Admissions open 2027-28" invalid={!!errors.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Text" error={errors.text} className="sm:col-span-2">
          <TextArea value={values.text} maxLength={240} rows={2} placeholder="One or two short lines" onChange={(e) => set("text", e.target.value)} />
        </Field>
        <Field label="Button label" error={errors.buttonLabel}>
          <TextInput value={values.buttonLabel} maxLength={30} placeholder="Know more" onChange={(e) => set("buttonLabel", e.target.value)} />
        </Field>
        <Field label="Where should it go? (link)" hint="A page on this site such as /schools, or a full https:// address" error={errors.link}>
          <TextInput value={values.link} list="side-ad-routes" maxLength={300} placeholder="/schools" invalid={!!errors.link} onChange={(e) => set("link", e.target.value)} />
        </Field>
        <datalist id="side-ad-routes">
          {ROUTES.map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>
      </div>
      <ImageUpload
        label="Image (optional)"
        slot="ad"
        value={values.imageUrl}
        onChange={(url) => set("imageUrl", url)}
        onUploaded={trackUpload}
        maxBytes={maxUploadBytes}
        error={errors.imageUrl}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-4">
        <Toggle label="Show this ad on project pages" showLabel checked={values.enabled} onChange={(v) => set("enabled", v)} />
        <div className="flex gap-2">
          {saved && (
            <Button variant="secondary" onClick={() => void save(null, "Sidebar ad removed")} disabled={pending}>
              Remove ad
            </Button>
          )}
          <Button type="submit" pending={pending}>
            {pending ? "Saving…" : "Save ad"}
          </Button>
        </div>
      </div>
    </form>
  );
}
