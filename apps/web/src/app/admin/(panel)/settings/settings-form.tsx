"use client";

import { useState } from "react";
import type { AdminSettings, ImageStorageProvider } from "@nsb/shared";
import { Button } from "@/components/admin/form";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { adminClient } from "@/lib/admin-client";
import { StatusBadge } from "./storage-status";

const OPTIONS: { value: ImageStorageProvider; label: string; description: string }[] = [
  { value: "cloudinary", label: "Cloudinary", description: "Image CDN. Add your Cloudinary API keys below." },
  { value: "firebase", label: "Firebase Storage", description: "Your Firebase project's storage bucket. Add a service account key below." },
  { value: "local", label: "This server", description: "The API server's disk (UPLOAD_DIR). Keep that folder on a backed-up volume." },
];

/** Which provider receives new uploads. Only configured providers can be chosen. */
export function SettingsForm({ settings }: { settings: AdminSettings }) {
  const { run, pending } = useAdminAction();
  const [storage, setStorage] = useState(settings.imageStorage);
  const status = (p: ImageStorageProvider) => (p === "local" ? null : settings[p]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void run(() => adminClient.patch("/admin/settings", { imageStorage: storage }), { success: "Image storage saved" });
      }}
      className="rounded-lg border border-zinc-200 bg-white p-5"
    >
      <fieldset>
        <legend className="text-base font-semibold text-zinc-900">Image storage</legend>
        <p className="mt-1 text-sm text-zinc-500">
          Where new uploads go. Existing images keep working from wherever they were stored, and are not moved.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {OPTIONS.map((o) => {
            const s = status(o.value);
            return (
              <label
                key={o.value}
                className="flex cursor-pointer gap-3 rounded-md border border-zinc-200 p-3 has-checked:border-zinc-900 has-disabled:cursor-not-allowed has-disabled:opacity-60"
              >
                <input
                  type="radio"
                  name="imageStorage"
                  value={o.value}
                  checked={storage === o.value}
                  disabled={s ? !s.configured : false}
                  onChange={() => setStorage(o.value)}
                  className="mt-1"
                />
                <span className="flex-1">
                  <span className="flex flex-wrap items-center gap-2 text-sm font-medium text-zinc-900">
                    {o.label}
                    {s && <StatusBadge status={s} />}
                    {settings.imageStorage === o.value && <span className="text-xs font-normal text-zinc-500">(current)</span>}
                  </span>
                  <span className="block text-xs text-zinc-500">{o.description}</span>
                </span>
              </label>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-zinc-500">Uploads are limited to {Math.round(settings.maxUploadBytes / 1024 / 1024)} MB (UPLOAD_MAX_MB).</p>
      </fieldset>
      <div className="mt-5 flex justify-end">
        <Button type="submit" pending={pending} disabled={storage === settings.imageStorage}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
