import type { Metadata } from "next";
import type { AdminSettings } from "@nsb/shared";
import { PageHeader } from "@/components/admin/ui";
import { adminApi } from "@/lib/api";
import { CloudinaryForm } from "./cloudinary-form";
import { EmailForm } from "./email-form";
import { FirebaseForm } from "./firebase-form";
import { PasswordForm } from "./password-form";
import { ListingSidebarForm } from "./listing-sidebar-form";
import { SettingsForm } from "./settings-form";
import { WhatsappForm } from "./whatsapp-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const settings = await adminApi.get<AdminSettings>("/admin/settings");
  return (
    <>
      <PageHeader title="Settings" />
      <div className="flex max-w-2xl flex-col gap-6">
        <SettingsForm settings={settings} />
        {/* key: reset the forms to the saved values after each save. */}
        <CloudinaryForm key={JSON.stringify(settings.cloudinary)} settings={settings} />
        <FirebaseForm key={JSON.stringify(settings.firebase)} settings={settings} />
        <EmailForm key={JSON.stringify(settings.email)} settings={settings} />
        <WhatsappForm key={JSON.stringify(settings.whatsapp)} settings={settings} />
        {/* <ListingSidebarForm key={JSON.stringify(settings.listingSidebar)} settings={settings} /> */}
        <PasswordForm />
      </div>
    </>
  );
}
