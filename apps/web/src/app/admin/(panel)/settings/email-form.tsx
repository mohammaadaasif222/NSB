"use client";

import { type FormEvent, useState } from "react";
import type { AdminSettings, EmailSettingsInput, SmtpSecurity, StorageTestResult } from "@nsb/shared";
import { Button, Field, Select, TextArea, TextInput, Toggle } from "@/components/admin/form";
import { Badge } from "@/components/admin/ui";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { adminClient } from "@/lib/admin-client";
import { fieldErrorsFor } from "./cloudinary-form";

const DEFAULT_PORTS: Record<SmtpSecurity, number> = { tls: 465, starttls: 587, none: 25 };

/** One address per line or comma-separated. */
const parseEmails = (text: string) =>
  text
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

/** SMTP server for enquiry alerts: who gets them, sent from where. */
export function EmailForm({ settings }: { settings: AdminSettings }) {
  const saved = settings.email;
  const { run, pending } = useAdminAction();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [testTo, setTestTo] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<StorageTestResult | null>(null);
  const [values, setValues] = useState({
    enabled: saved.host ? saved.enabled : true,
    host: saved.host ?? "",
    port: String(saved.port),
    security: saved.security,
    username: saved.username,
    password: "",
    fromEmail: saved.fromEmail ?? "",
    fromName: saved.fromName,
    adminRecipients: saved.adminRecipients.join("\n"),
    notifyVendor: saved.notifyVendor,
  });
  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => setValues((v) => ({ ...v, [key]: value }));
  const isSaved = !!saved.host;

  async function save(body: { email: EmailSettingsInput | null }, success: string) {
    setErrors({});
    const result = await run(() => adminClient.patch("/admin/settings", body), { success });
    if (!result.ok) {
      // "adminRecipients.0" → show on the recipients field.
      const errs = fieldErrorsFor("email", result.error.fieldErrors);
      setErrors(Object.fromEntries(Object.entries(errs).map(([k, v]) => [k.split(".")[0], v])));
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void save(
      {
        email: {
          ...values,
          port: Number(values.port),
          password: values.password || undefined,
          adminRecipients: parseEmails(values.adminRecipients),
        },
      },
      "Email settings saved",
    );
  };

  const sendTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      setTestResult(await adminClient.post<StorageTestResult>("/admin/notifications/test-email", testTo ? { to: testTo } : {}));
    } catch (err) {
      setTestResult({ ok: false, message: err instanceof Error ? err.message : "Test failed" });
    } finally {
      setTesting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5" noValidate>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold text-zinc-900">Enquiry email alerts</h2>
        {saved.problem ? (
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">Needs attention</span>
        ) : saved.active ? (
          <Badge tone="good">On</Badge>
        ) : (
          <Badge>{isSaved ? "Off" : "Not configured"}</Badge>
        )}
      </div>
      <p className="-mt-2 text-sm text-zinc-500">
        Every new enquiry is emailed through your SMTP server (for example Zoho Mail, Google Workspace or your host&apos;s mail
        server). Enquiries are always saved here, even if an email fails.
      </p>
      {saved.problem && <p className="text-sm text-red-600">{saved.problem}</p>}

      <Toggle label="Send email alerts for new enquiries" showLabel checked={values.enabled} onChange={(v) => set("enabled", v)} />

      <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
        <Field label="SMTP server" hint="e.g. smtp.zoho.in" error={errors.host}>
          <TextInput value={values.host} onChange={(e) => set("host", e.target.value)} autoComplete="off" />
        </Field>
        <Field label="Security" error={errors.security}>
          <Select
            value={values.security}
            onChange={(e) => {
              const security = e.target.value as SmtpSecurity;
              // Follow the usual port for the chosen security unless a custom one was typed.
              setValues((v) => ({
                ...v,
                security,
                port: Object.values(DEFAULT_PORTS).map(String).includes(v.port) ? String(DEFAULT_PORTS[security]) : v.port,
              }));
            }}
          >
            <option value="tls">SSL/TLS</option>
            <option value="starttls">STARTTLS</option>
            <option value="none">None (local only)</option>
          </Select>
        </Field>
        <Field label="Port" error={errors.port}>
          <TextInput value={values.port} onChange={(e) => set("port", e.target.value)} inputMode="numeric" />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Username" hint="Usually the full email address. Leave empty if no login is needed." error={errors.username}>
          <TextInput value={values.username} onChange={(e) => set("username", e.target.value)} autoComplete="off" />
        </Field>
        <Field
          label="Password"
          hint={saved.hasPassword ? "Saved. Leave blank to keep it." : "Stored encrypted; never shown again. Use an app password if your provider offers one."}
          error={errors.password}
        >
          <TextInput
            type="password"
            value={values.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder={saved.hasPassword ? "••••••••••" : ""}
            autoComplete="new-password"
          />
        </Field>
        <Field label="From address" hint="Usually must match the login" error={errors.fromEmail}>
          <TextInput type="email" value={values.fromEmail} onChange={(e) => set("fromEmail", e.target.value)} autoComplete="off" />
        </Field>
        <Field label="From name" error={errors.fromName}>
          <TextInput value={values.fromName} onChange={(e) => set("fromName", e.target.value)} maxLength={80} />
        </Field>
      </div>
      <Field label="Send enquiries to" hint="NSB team addresses, one per line (up to 10)" error={errors.adminRecipients}>
        <TextArea value={values.adminRecipients} onChange={(e) => set("adminRecipients", e.target.value)} rows={2} />
      </Field>
      <Toggle
        label="Also email the vendor whose listing received the enquiry"
        showLabel
        checked={values.notifyVendor}
        onChange={(v) => set("notifyVendor", v)}
      />

      <div className="flex flex-wrap items-end justify-end gap-2 border-t border-zinc-200 pt-4">
        {isSaved && (
          <Button variant="danger-ghost" className="mr-auto" disabled={pending} onClick={() => save({ email: null }, "Email settings removed")}>
            Remove
          </Button>
        )}
        <Button type="submit" pending={pending}>
          {pending ? "Saving…" : "Save email settings"}
        </Button>
      </div>

      {isSaved && (
        <div className="flex flex-wrap items-end gap-2 rounded-md bg-zinc-50 p-3">
          <Field label="Send a test email to" hint="Uses the saved settings. Leave empty to send it to yourself." className="min-w-56 flex-1">
            <TextInput type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} />
          </Field>
          <Button variant="secondary" onClick={sendTest} pending={testing} className="mb-5">
            {testing ? "Sending…" : "Send test email"}
          </Button>
          {testResult && (
            <p role="status" className={`basis-full text-xs ${testResult.ok ? "text-emerald-700" : "text-red-600"}`}>
              {testResult.message}
            </p>
          )}
        </div>
      )}
    </form>
  );
}
