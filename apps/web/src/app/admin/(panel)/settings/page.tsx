import type { Metadata } from "next";
import { type AdminCategory, type AdminSettings, type AdminUser, type AdminUserRow, canDo } from "@nsb/shared";
import { adminApi } from "@/lib/admin-api";
import { EmailForm } from "./email-form";
import { PasswordForm } from "./password-form";
import { PricingForm } from "./pricing-form";
import { ProfileForm } from "./profile-form";
import { SettingsForm } from "./settings-form";
import { UsersCard } from "./users-card";
import { WhatsappForm } from "./whatsapp-form";

export const metadata: Metadata = { title: "Settings" };

/**
 * As in the demo: slot pricing beside the admin account and password, then users and roles.
 * Below them, the site settings the live site needs (image storage, email alerts, WhatsApp).
 * Roles other than Super Admin see only their own account and password.
 */
export default async function SettingsPage() {
  const admin = await adminApi.get<AdminUser>("/auth/me");
  const manage = canDo(admin.role, "manage");
  const [settings, categories, users] = manage
    ? await Promise.all([
        adminApi.get<AdminSettings>("/admin/settings"),
        adminApi.get<AdminCategory[]>("/admin/categories"),
        adminApi.get<AdminUserRow[]>("/admin/users"),
      ])
    : [null, [], []];
  const wedding = categories.find((c) => !c.parentId && c.slug === "wedding");
  const subCategories = wedding ? categories.filter((c) => c.parentId === wedding.id) : [];

  return (
    <>
      <div className="a-hd">
        <div>
          <h2>Settings</h2>
          <p>{manage ? "Pricing, admin account and security." : "Your admin account and password."}</p>
        </div>
      </div>

      <div className="a-set">
        {settings && <PricingForm key={JSON.stringify(settings.pricing)} pricing={settings.pricing} subCategories={subCategories} />}
        <div className="grid gap-4 self-start">
          <ProfileForm key={`${admin.name}|${admin.email}`} admin={admin} />
          <PasswordForm />
        </div>
      </div>

      {settings && (
        <>
          <UsersCard users={users} currentId={admin.id} />
          <div className="a-hd mt-8">
            <div>
              <h2>Site settings</h2>
              <p>Image storage, lead alert emails and the WhatsApp button.</p>
            </div>
          </div>
          <div className="flex max-w-2xl flex-col gap-6">
            <SettingsForm settings={settings} />
            {/* key: reset the forms to the saved values after each save. */}
            <EmailForm key={JSON.stringify(settings.email)} settings={settings} />
            <WhatsappForm key={JSON.stringify(settings.whatsapp)} settings={settings} />
          </div>
        </>
      )}
    </>
  );
}
