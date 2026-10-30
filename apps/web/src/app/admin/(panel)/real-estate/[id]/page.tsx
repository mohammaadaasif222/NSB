import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { AdminProject, AdminSettings } from "@nsb/shared";
import { adminApi, isUuid } from "@/lib/admin-api";
import { ApiError } from "@/lib/api";
import { ProjectForm } from "../project-form";
import { DeleteProjectButton } from "../projects-table";
import { editorsOnly } from "@/components/admin/editors-only";

export const metadata: Metadata = { title: "Edit real estate listing" };

async function getProject(id: string) {
  if (!isUuid(id)) notFound();
  try {
    return await adminApi.get<AdminProject>(`/admin/projects/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}

export default async function EditProjectPage({ params }: PageProps<"/admin/real-estate/[id]">) {
  const notice = await editorsOnly("Real estate listings");
  if (notice) return notice;
  const { id } = await params;
  const [project, settings] = await Promise.all([getProject(id), adminApi.get<AdminSettings>("/admin/settings")]);
  return (
    <ProjectForm
      key={project.updatedAt}
      project={project}
      maxUploadBytes={settings.maxUploadBytes}
      planPrice={settings.pricing.realEstate}
      actions={<DeleteProjectButton id={project.id} name={project.name} redirectTo="/admin/real-estate" label="Delete" />}
    />
  );
}
