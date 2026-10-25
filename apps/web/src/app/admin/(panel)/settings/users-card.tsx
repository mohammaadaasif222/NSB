"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Plus } from "lucide-react";
import {
  ADMIN_ROLE_LABELS,
  ADMIN_ROLES,
  type AdminRole,
  type AdminUserInput,
  type AdminUserRow,
  canDo,
  MIN_PASSWORD_LENGTH,
  ROLE_TABLE,
} from "@nsb/shared";
import { ConfirmDialog, Modal } from "@/components/admin/dialog";
import { Button, Field, PasswordInput, Select, TextInput } from "@/components/admin/form";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { adminClient } from "@/lib/admin-client";

const EMPTY: AdminUserInput = { name: "", email: "", role: "admin", password: "" };

/** Settings › Users and roles (Super Admins): who can sign in, what each role may do. */
export function UsersCard({ users, currentId }: { users: AdminUserRow[]; currentId: string }) {
  const router = useRouter();
  const { run, pending } = useAdminAction();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<AdminUserInput>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [removing, setRemoving] = useState<AdminUserRow | null>(null);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    const result = await run(() => adminClient.post<AdminUserRow>("/admin/users", draft), { success: "User added" });
    if (result.ok) {
      setAdding(false);
      setDraft(EMPTY);
      setErrors({});
    } else {
      setErrors(result.error.fieldErrors);
    }
  };

  const setRole = (user: AdminUserRow, role: AdminRole) =>
    run(() => adminClient.patch(`/admin/users/${user.id}`, { role }), { success: `${user.name} is now ${ADMIN_ROLE_LABELS[role]}` });

  const remove = async () => {
    if (!removing) return;
    const result = await run(() => adminClient.delete(`/admin/users/${removing.id}`), { success: "User removed" });
    if (result.ok) setRemoving(null);
  };

  return (
    <div className="a-card mt-4">
      <h3>
        Users and roles
        <Button className="a-btn s" onClick={() => setAdding(true)}>
          <Plus size={15} aria-hidden /> Add user
        </Button>
      </h3>
      <div className="a-tw">
        <table className="a-t" style={{ minWidth: 560 }}>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const self = u.id === currentId;
              return (
                <tr key={u.id}>
                  <td>
                    <b>{u.name}</b>
                    {self && <small className="block text-zinc-500">You</small>}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      className="a-sel"
                      value={u.role}
                      disabled={self || pending}
                      title={self ? "You cannot change your own role" : undefined}
                      aria-label={`Role of ${u.name}`}
                      onChange={(e) => void setRole(u, e.target.value as AdminRole)}
                    >
                      {ADMIN_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ADMIN_ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="text-right">
                    {!self && (
                      <Button variant="secondary" className="a-btn g s" onClick={() => setRemoving(u)}>
                        Remove
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h3 className="mt-5">What each role can do</h3>
      <div className="a-tw">
        <table className="a-t" style={{ minWidth: 560 }}>
          <thead>
            <tr>
              <th scope="col">
                <span className="sr-only">Permission</span>
              </th>
              {ADMIN_ROLES.map((r) => (
                <th key={r} scope="col">
                  {ADMIN_ROLE_LABELS[r]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROLE_TABLE.map(([label, permission]) => (
              <tr key={label}>
                <td>{label}</td>
                {ADMIN_ROLES.map((r) => (
                  <td key={r}>
                    {canDo(r, permission) ? (
                      <span className="font-extrabold text-(--admin-ok)" aria-label="Yes">
                        ✓
                      </span>
                    ) : (
                      <span className="text-zinc-500" aria-label="No">
                        –
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="a-hsub mt-3">A role change or a removed user takes effect on their next click. Nobody can change their own role or remove themselves.</p>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add user" size="sm">
        <form onSubmit={(e) => void add(e)} className="flex flex-col gap-3" noValidate>
          <p className="text-sm text-zinc-500">Choose what this person can do. Give them the first password; they can change it in Settings.</p>
          <Field label="Name" error={errors.name}>
            <TextInput value={draft.name} maxLength={80} invalid={!!errors.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
          </Field>
          <Field label="Email" error={errors.email}>
            <TextInput type="email" value={draft.email} invalid={!!errors.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} />
          </Field>
          <Field label="Role" error={errors.role}>
            <Select value={draft.role} onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value as AdminRole }))}>
              {ADMIN_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ADMIN_ROLE_LABELS[r]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="First password" hint={`At least ${MIN_PASSWORD_LENGTH} characters.`} error={errors.password}>
            <PasswordInput autoComplete="new-password" value={draft.password} invalid={!!errors.password} onChange={(e) => setDraft((d) => ({ ...d, password: e.target.value }))} />
          </Field>
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button type="submit" pending={pending}>
              Add user
            </Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={removing !== null}
        title="Remove user?"
        message={
          <>
            <b>{removing?.name}</b> will no longer be able to sign in to the admin panel.
          </>
        }
        confirmLabel="Remove"
        pending={pending}
        onConfirm={() => void remove().then(() => router.refresh())}
        onClose={() => setRemoving(null)}
      />
    </div>
  );
}
