import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { redirect } from "next/navigation";
import type { AdminUser, ProjectStats, UnreadCount } from "@nsb/shared";
import { AdminProvider } from "@/components/admin/admin-role";
import { AdminShell } from "@/components/admin/admin-shell";
import { ToastProvider } from "@/components/admin/toast";
import { UnreadEnquiriesProvider } from "@/components/admin/unread-enquiries";
import { adminApi, ApiError } from "@/lib/api";
import "./admin.css";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { template: "%s · NSB Admin", default: "NSB Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  let admin: AdminUser;
  let unread: UnreadCount;
  let projects: ProjectStats;
  try {
    [admin, unread, projects] = await Promise.all([
      adminApi.get<AdminUser>("/auth/me"),
      adminApi.get<UnreadCount>("/admin/enquiries/unread-count"),
      adminApi.get<ProjectStats>("/admin/projects/stats"),
    ]);
  } catch (err) {
    // Expired or invalid session (or a removed account): clear the cookie, then go to sign in.
    if (err instanceof ApiError && err.status === 401) redirect("/admin/logout");
    throw err;
  }

  return (
    <ToastProvider>
      <AdminProvider admin={admin}>
        <UnreadEnquiriesProvider initial={unread.unread}>
          <div className={jakarta.variable}>
            <AdminShell admin={admin} expiringSoon={projects.expiringSoon}>
              {children}
            </AdminShell>
          </div>
        </UnreadEnquiriesProvider>
      </AdminProvider>
    </ToastProvider>
  );
}
