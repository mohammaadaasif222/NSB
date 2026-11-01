"use client";

import { useState } from "react";
import type { AdminSettings } from "@nsb/shared";
import { adminClient } from "@/lib/admin-client";
import { useAdminAction } from "./use-admin-action";

/** Maps an API error path to the name a form shows the error under. */
type FieldName = (path: string, section: string) => string;

/** "footer.about" → "about"; list rows keep their index ("homeCards.0.title" → "0.title"). */
const withoutSection: FieldName = (path, section) => (path.startsWith(`${section}.`) ? path.slice(section.length + 1) : path);

/** For a section keyed by slug, where one form edits one entry: "eliteBanners.mehendi.title" → "title". */
export const lastSegment: FieldName = (path) => path.split(".").pop()!;

/**
 * Saves one key of Admin › Settings and keeps its field errors, by field name. `save` resolves to
 * the saved settings, or to null when the save failed (the toast and field errors are already up).
 */
export function useSettingsSection<K extends keyof AdminSettings>(key: K, fieldName: FieldName = withoutSection) {
  const { run, pending } = useAdminAction();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = async (value: AdminSettings[K], success: string) => {
    const result = await run(() => adminClient.patch<AdminSettings>("/admin/settings", { [key]: value }), { success });
    if (result.ok) {
      setErrors({});
      return result.data;
    }
    setErrors(Object.fromEntries(Object.entries(result.error.fieldErrors).map(([path, message]) => [fieldName(path, key), message])));
    return null;
  };

  return { save, pending, errors };
}
