import type { Metadata } from "next";
import type { AdminSettings } from "@nsb/shared";
import { adminApi } from "@/lib/api";
import { ProjectForm } from "../project-form";

export const metadata: Metadata = { title: "Add real estate listing" };

export default async function NewProjectPage() {
  const settings = await adminApi.get<AdminSettings>("/admin/settings");
  return <ProjectForm maxUploadBytes={settings.maxUploadBytes} />;
}
