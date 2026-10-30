import type { Metadata } from "next";
import type { AdminSettings } from "@nsb/shared";
import { adminApi } from "@/lib/admin-api";
import { ProjectForm } from "../project-form";
import { editorsOnly } from "@/components/admin/editors-only";

export const metadata: Metadata = { title: "Add real estate listing" };

export default async function NewProjectPage() {
  const notice = await editorsOnly("Real estate listings");
  if (notice) return notice;
  const settings = await adminApi.get<AdminSettings>("/admin/settings");
  return <ProjectForm maxUploadBytes={settings.maxUploadBytes} planPrice={settings.pricing.realEstate} />;
}
