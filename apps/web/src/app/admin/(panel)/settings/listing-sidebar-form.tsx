"use client";

import { useState } from "react";
import type { AdminSettings, ListingSidebarSettings } from "@nsb/shared";
import { Button, Toggle } from "@/components/admin/form";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { adminClient } from "@/lib/admin-client";

/** Which side cards the category listing page shows beside list view on desktops. */
export function ListingSidebarForm({ settings }: { settings: AdminSettings }) {
  const { run, pending } = useAdminAction();
  const [values, setValues] = useState<ListingSidebarSettings>(settings.listingSidebar);
  const set = (key: keyof ListingSidebarSettings, value: boolean) => setValues((v) => ({ ...v, [key]: value }));
  const changed = JSON.stringify(values) !== JSON.stringify(settings.listingSidebar);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void run(() => adminClient.patch("/admin/settings", { listingSidebar: values }), { success: "Listing page sidebar saved" });
      }}
      className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5"
    >
      <div>
        <h2 className="text-base font-semibold text-zinc-900">Listing page sidebar</h2>
        <p className="mt-1 text-sm text-zinc-500">
          The photo cards beside the vendor list on category pages (for example &quot;Venues by budget&quot;). They show in list view on desktops.
        </p>
      </div>
      <Toggle label="Show the sidebar" showLabel checked={values.enabled} onChange={(v) => set("enabled", v)} />
      <div className={`flex flex-col gap-3 border-l-2 border-zinc-100 pl-4 ${values.enabled ? "" : "pointer-events-none opacity-50"}`}>
        <Toggle label='"By budget" card (Budget Friendly, Value For Money, Premium, Luxury)' showLabel checked={values.budget} onChange={(v) => set("budget", v)} disabled={!values.enabled} />
        <Toggle label='"By type" card (e.g. Banquet Halls, Hotels, Lawns)' showLabel checked={values.type} onChange={(v) => set("type", v)} disabled={!values.enabled} />
      </div>
      <div className="flex justify-end">
        <Button type="submit" pending={pending} disabled={!changed}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
