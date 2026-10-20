"use client";

import { type FormEvent, useState } from "react";
import type { AdminSettings, SettingsUpdateInput } from "@nsb/shared";
import { Button, Field, TextInput } from "@/components/admin/form";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { adminClient } from "@/lib/admin-client";
import { StatusBadge, TestConnectionButton } from "./storage-status";

/** Field errors arrive as "cloudinary.apiKey"; keep the part after the provider. */
export const fieldErrorsFor = (prefix: string, errors: Record<string, string>) =>
  Object.fromEntries(Object.entries(errors).flatMap(([k, v]) => (k.startsWith(`${prefix}.`) ? [[k.slice(prefix.length + 1), v]] : [])));

export function CloudinaryForm({ settings }: { settings: AdminSettings }) {
  const status = settings.cloudinary;
  const { run, pending } = useAdminAction();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState({
    cloudName: status.cloudName ?? "",
    apiKey: status.apiKey ?? "",
    apiSecret: "",
    folder: status.folder,
  });
  const set = (key: keyof typeof values, value: string) => setValues((v) => ({ ...v, [key]: value }));
  const hasSaved = status.source === "admin";

  async function save(body: SettingsUpdateInput, success: string) {
    setErrors({});
    const result = await run(() => adminClient.patch("/admin/settings", body), { success });
    if (result.ok) set("apiSecret", "");
    else setErrors(fieldErrorsFor("cloudinary", result.error.fieldErrors));
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void save({ cloudinary: { ...values, apiSecret: values.apiSecret || undefined } }, "Cloudinary credentials saved");
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5" noValidate>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold text-zinc-900">Cloudinary</h2>
        <StatusBadge status={status} />
      </div>
      <p className="-mt-2 text-sm text-zinc-500">
        From the Cloudinary console › Settings › API Keys.
        {status.source === "env" && " The server's CLOUDINARY_* variables are in use; credentials saved here take precedence."}
      </p>
      {status.problem && <p className="text-sm text-red-600">{status.problem}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cloud name" error={errors.cloudName}>
          <TextInput value={values.cloudName} onChange={(e) => set("cloudName", e.target.value)} autoComplete="off" />
        </Field>
        <Field label="API key" error={errors.apiKey}>
          <TextInput value={values.apiKey} onChange={(e) => set("apiKey", e.target.value)} inputMode="numeric" autoComplete="off" />
        </Field>
        <Field label="API secret" hint={hasSaved ? "Saved. Leave blank to keep it." : "Stored encrypted; never shown again."} error={errors.apiSecret}>
          <TextInput
            type="password"
            value={values.apiSecret}
            onChange={(e) => set("apiSecret", e.target.value)}
            placeholder={hasSaved ? "••••••••••" : ""}
            autoComplete="new-password"
          />
        </Field>
        <Field label="Folder" hint="Uploads go under this folder, e.g. nsb/banners" error={errors.folder}>
          <TextInput value={values.folder} onChange={(e) => set("folder", e.target.value)} autoComplete="off" />
        </Field>
      </div>
      <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-200 pt-4">
        {hasSaved && (
          <Button variant="danger-ghost" className="mr-auto" disabled={pending} onClick={() => save({ cloudinary: null }, "Saved Cloudinary credentials removed")}>
            Remove saved credentials
          </Button>
        )}
        <TestConnectionButton provider="cloudinary" disabled={!status.configured} />
        <Button type="submit" pending={pending}>
          {pending ? "Saving…" : "Save credentials"}
        </Button>
      </div>
    </form>
  );
}
