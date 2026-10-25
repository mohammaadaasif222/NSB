"use client";

import { type FormEvent, useState } from "react";
import type { AdminUser, ProfileInput } from "@nsb/shared";
import { Button, Field, TextInput } from "@/components/admin/form";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { adminClient } from "@/lib/admin-client";

/** Settings › Admin account: the signed-in admin's own name and sign-in email. */
export function ProfileForm({ admin }: { admin: AdminUser }) {
  const { run, pending } = useAdminAction();
  const [values, setValues] = useState<ProfileInput>({ name: admin.name, email: admin.email });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await run(() => adminClient.patch<AdminUser>("/auth/profile", values), { success: "Profile saved" });
    setErrors(result.ok ? {} : result.error.fieldErrors);
  };

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="a-card flex flex-col gap-3" noValidate>
      <h3 className="mb-0!">Admin account</h3>
      <Field label="Email" hint="You sign in with this address." error={errors.email}>
        <TextInput type="email" autoComplete="email" value={values.email} invalid={!!errors.email} onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))} />
      </Field>
      <Field label="Display name" error={errors.name}>
        <TextInput value={values.name} maxLength={80} invalid={!!errors.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} />
      </Field>
      <div>
        <Button type="submit" variant="secondary" pending={pending} disabled={values.name === admin.name && values.email === admin.email}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
