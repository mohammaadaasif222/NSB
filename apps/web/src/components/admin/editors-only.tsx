import { ADMIN_ROLE_LABELS, type AdminUser, canDo } from "@nsb/shared";
import { adminApi } from "@/lib/api";

/**
 * For editing pages: null when the signed-in admin may edit, else the notice to show instead
 * (the API refuses their changes anyway). Server components only.
 */
export async function editorsOnly(what: string) {
  const admin = await adminApi.get<AdminUser>("/auth/me");
  if (canDo(admin.role, "edit")) return null;
  return (
    <div className="a-card">
      <h3>{what}</h3>
      <p className="text-zinc-500">
        {ADMIN_ROLE_LABELS[admin.role]} accounts can view the site and the reports but cannot change {what.toLowerCase()}. Ask a Super Admin to change
        your role.
      </p>
    </div>
  );
}
