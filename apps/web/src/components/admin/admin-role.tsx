"use client";

import { createContext, type ReactNode, useContext } from "react";
import { type AdminPermission, type AdminUser, canDo } from "@nsb/shared";

const AdminContext = createContext<AdminUser | null>(null);

/** The signed-in admin, for showing only what their role can use. The API enforces the same rules. */
export function AdminProvider({ admin, children }: { admin: AdminUser; children: ReactNode }) {
  return <AdminContext.Provider value={admin}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminUser {
  const admin = useContext(AdminContext);
  if (!admin) throw new Error("useAdmin() outside AdminProvider");
  return admin;
}

export const useCan = (permission: AdminPermission) => canDo(useAdmin().role, permission);

/** Renders its children only for roles with the permission. */
export function Can({ permission, children }: { permission: AdminPermission; children: ReactNode }) {
  return useCan(permission) ? children : null;
}
