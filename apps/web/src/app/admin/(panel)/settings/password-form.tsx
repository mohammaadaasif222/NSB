"use client";

import { type FormEvent, useState } from "react";
import { type ChangePasswordInput, MIN_PASSWORD_LENGTH } from "@nsb/shared";
import { Button, Field, PasswordInput } from "@/components/admin/form";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { adminClient } from "@/lib/admin-client";

const EMPTY: ChangePasswordInput = { currentPassword: "", newPassword: "", confirmPassword: "" };

/** The signed-in admin's own password. Other sessions stay signed in until they expire. */
export function PasswordForm() {
  const { run, pending } = useAdminAction();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState(EMPTY);
  const set = (key: keyof ChangePasswordInput, value: string) => setValues((v) => ({ ...v, [key]: value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = await run(() => adminClient.post("/auth/password", values), { success: "Password changed", refresh: false });
    if (result.ok) setValues(EMPTY);
    else setErrors(result.error.fieldErrors);
  };

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5" noValidate>
      <div>
        <h2 className="text-base font-semibold text-zinc-900">Change password</h2>
        <p className="mt-1 text-sm text-zinc-500">The password you use to sign in to this admin panel.</p>
      </div>

      <Field label="Current password" error={errors.currentPassword}>
        <PasswordInput
          autoComplete="current-password"
          value={values.currentPassword}
          onChange={(e) => set("currentPassword", e.target.value)}
          maxLength={200}
        />
      </Field>
      <Field label="New password" hint={`At least ${MIN_PASSWORD_LENGTH} characters.`} error={errors.newPassword}>
        <PasswordInput
          autoComplete="new-password"
          value={values.newPassword}
          onChange={(e) => set("newPassword", e.target.value)}
          maxLength={200}
        />
      </Field>
      <Field label="Confirm new password" error={errors.confirmPassword}>
        <PasswordInput
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={(e) => set("confirmPassword", e.target.value)}
          maxLength={200}
        />
      </Field>

      <div className="flex justify-end">
        <Button type="submit" pending={pending} disabled={!values.currentPassword || !values.newPassword || !values.confirmPassword}>
          {pending ? "Saving…" : "Change password"}
        </Button>
      </div>
    </form>
  );
}
