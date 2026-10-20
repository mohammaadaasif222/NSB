"use client";

import { type FormEvent, useId, useState } from "react";
import type { AdminSettings, SettingsUpdateInput } from "@nsb/shared";
import { Button, Field, TextInput } from "@/components/admin/form";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { adminClient } from "@/lib/admin-client";
import { fieldErrorsFor } from "./cloudinary-form";
import { StatusBadge, TestConnectionButton } from "./storage-status";

interface KeyFile {
  text: string;
  clientEmail: string;
  projectId: string;
}

/** Reads a service account key file in the browser, just to show which account it is. */
async function readKeyFile(file: File): Promise<KeyFile | string> {
  if (file.size > 20_000) return "This file is too large to be a service account key.";
  const text = await file.text();
  try {
    const json = JSON.parse(text) as Record<string, unknown>;
    if (json.type !== "service_account" || typeof json.client_email !== "string") return "This is not a service account key file.";
    return { text, clientEmail: json.client_email, projectId: String(json.project_id ?? "") };
  } catch {
    return "This file is not valid JSON.";
  }
}

export function FirebaseForm({ settings }: { settings: AdminSettings }) {
  const status = settings.firebase;
  const fileId = useId();
  const { run, pending } = useAdminAction();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bucket, setBucket] = useState(status.bucket ?? "");
  const [folder, setFolder] = useState(status.folder);
  const [keyFile, setKeyFile] = useState<KeyFile | null>(null);
  const hasSaved = status.source === "admin";

  async function save(body: SettingsUpdateInput, success: string) {
    setErrors({});
    const result = await run(() => adminClient.patch("/admin/settings", body), { success });
    if (result.ok) setKeyFile(null);
    else setErrors(fieldErrorsFor("firebase", result.error.fieldErrors));
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void save({ firebase: { bucket, folder, serviceAccount: keyFile?.text } }, "Firebase credentials saved");
  };

  const account = keyFile ?? (status.clientEmail ? { clientEmail: status.clientEmail, projectId: status.projectId ?? "" } : null);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5" noValidate>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold text-zinc-900">Firebase Storage</h2>
        <StatusBadge status={status} />
      </div>
      <p className="-mt-2 text-sm text-zinc-500">
        In the Firebase console, open Project settings › Service accounts › Generate new private key, and upload that JSON file here. The
        bucket is shown on the Storage page.
      </p>
      {status.problem && <p className="text-sm text-red-600">{status.problem}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Bucket" hint="e.g. your-project.firebasestorage.app" error={errors.bucket}>
          <TextInput value={bucket} onChange={(e) => setBucket(e.target.value)} autoComplete="off" />
        </Field>
        <Field label="Folder" hint="Uploads go under this folder, e.g. nsb/banners" error={errors.folder}>
          <TextInput value={folder} onChange={(e) => setFolder(e.target.value)} autoComplete="off" />
        </Field>
      </div>
      <div className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        <label htmlFor={fileId}>Service account key file</label>
        <input
          id={fileId}
          type="file"
          accept="application/json,.json"
          className="text-sm font-normal file:mr-3 file:rounded-md file:border file:border-zinc-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-zinc-100"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            const result = await readKeyFile(file);
            setErrors((x) => ({ ...x, serviceAccount: typeof result === "string" ? result : "" }));
            if (typeof result !== "string") setKeyFile(result);
          }}
        />
        <span className="text-xs font-normal text-zinc-500">
          {account
            ? `${keyFile ? "Selected" : "Saved"}: ${account.clientEmail}${account.projectId ? ` (project ${account.projectId})` : ""}.${keyFile ? "" : " Choose a file only to replace it."}`
            : "The private key is stored encrypted and never shown again."}
        </span>
        {errors.serviceAccount && <span className="text-xs font-normal text-red-600">{errors.serviceAccount}</span>}
      </div>
      <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-200 pt-4">
        {hasSaved && (
          <Button variant="danger-ghost" className="mr-auto" disabled={pending} onClick={() => save({ firebase: null }, "Firebase credentials removed")}>
            Remove credentials
          </Button>
        )}
        <TestConnectionButton provider="firebase" disabled={!status.configured} />
        <Button type="submit" pending={pending}>
          {pending ? "Saving…" : "Save credentials"}
        </Button>
      </div>
    </form>
  );
}
