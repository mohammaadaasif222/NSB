"use client";

import { type FormEvent, useState } from "react";
import { type AdminSettings, DEFAULT_WHATSAPP_MESSAGE, type WhatsappSettingsInput } from "@nsb/shared";
import { Button, Field, TextArea, TextInput, Toggle } from "@/components/admin/form";
import { Badge } from "@/components/admin/ui";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { adminClient } from "@/lib/admin-client";
import { fieldErrorsFor } from "./cloudinary-form";

/** The "Chat on WhatsApp" button on every listing page: which number it opens and what it pre-fills. */
export function WhatsappForm({ settings }: { settings: AdminSettings }) {
  const saved = settings.whatsapp;
  const { run, pending } = useAdminAction();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState({
    enabled: saved?.enabled ?? true,
    number: saved?.number ?? "",
    message: saved?.message ?? DEFAULT_WHATSAPP_MESSAGE,
  });
  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => setValues((v) => ({ ...v, [key]: value }));

  const digits = values.number.replace(/\D/g, "").slice(-10);
  const preview = `https://wa.me/91${digits}?text=${encodeURIComponent(values.message.replaceAll("{listing}", "The Grand Imperial Banquet"))}`;

  async function save(body: { whatsapp: WhatsappSettingsInput | null }, success: string) {
    setErrors({});
    const result = await run(() => adminClient.patch("/admin/settings", body), { success });
    if (!result.ok) setErrors(fieldErrorsFor("whatsapp", result.error.fieldErrors));
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void save({ whatsapp: values }, "WhatsApp button saved");
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5" noValidate>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold text-zinc-900">WhatsApp button</h2>
        {saved?.enabled ? <Badge tone="good">On</Badge> : <Badge>{saved ? "Off" : "Not set up"}</Badge>}
      </div>
      <p className="-mt-2 text-sm text-zinc-500">
        Shows a &quot;Chat on WhatsApp&quot; button next to the enquiry form on every listing page, and in the phone menu bar. Visitors
        chat with this number directly; these chats are not saved as enquiries.
      </p>

      <Toggle label="Show the WhatsApp button" showLabel checked={values.enabled} onChange={(v) => set("enabled", v)} />

      <Field label="WhatsApp number" hint="10-digit Indian mobile number on WhatsApp, e.g. 98100 12345" error={errors.number}>
        <TextInput type="tel" inputMode="numeric" value={values.number} onChange={(e) => set("number", e.target.value)} maxLength={16} invalid={!!errors.number} />
      </Field>
      <Field label="Pre-filled message" hint="{listing} is replaced by the vendor's name. Visitors can edit it before sending." error={errors.message}>
        <TextArea value={values.message} onChange={(e) => set("message", e.target.value)} rows={3} maxLength={300} />
      </Field>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {digits.length === 10 ? (
          <a href={preview} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-emerald-700 hover:underline">
            Test the chat link →
          </a>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          {saved && (
            <Button variant="secondary" disabled={pending} onClick={() => void save({ whatsapp: null }, "WhatsApp button removed")}>
              Remove
            </Button>
          )}
          <Button type="submit" pending={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}
