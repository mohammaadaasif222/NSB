"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExternalLink, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { type AdminProjectRow, type ListingStatus, PROJECT_TYPE_LABELS } from "@nsb/shared";
import { useCan } from "@/components/admin/admin-role";
import { ConfirmDialog } from "@/components/admin/dialog";
import { BulkBar, BulkDeleteDialog } from "@/components/admin/bulk-bar";
import { ListingThumb } from "@/components/admin/listing-thumb";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { useBulkActions } from "@/components/admin/use-bulk-actions";
import { adminClient } from "@/lib/admin-client";
import { formatDate } from "@/lib/format";
import { sitePath } from "@/lib/admin-links";

const STATUS_LABEL: Record<ListingStatus, string> = { live: "Live", draft: "Draft", hidden: "Hidden" };
type Row = AdminProjectRow & { daysLeft: number };

export function ProjectsTable({ projects, empty }: { projects: Row[]; empty: string }) {
  const canEdit = useCan("edit");
  const bulk = useBulkActions(projects, "/admin/projects");

  return (
    <>
      {canEdit && <BulkBar bulk={bulk} />}
      <div className="a-tw">
        <table className="a-t">
          <thead>
            <tr>
              <th scope="col" className="w-10">
                <input
                  type="checkbox"
                  className="a-listing-select"
                  hidden={!canEdit}
                  checked={bulk.allSelected}
                  disabled={bulk.pending}
                  onChange={(e) => bulk.selectAll(e.currentTarget.checked)}
                  aria-label="Select all listings on this page"
                />
              </th>
              <th scope="col">Listing</th>
              <th scope="col">Property type</th>
              <th scope="col">Location</th>
              <th scope="col">Term</th>
              <th scope="col">Status</th>
              <th scope="col">Leads</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.length ? (
              projects.map((p) => (
                <tr key={p.id}>
                  <td>
                    <input
                      type="checkbox"
                      className="a-listing-select"
                  hidden={!canEdit}
                      checked={bulk.selected.has(p.id)}
                      disabled={bulk.pending}
                      onChange={(e) => bulk.selectOne(p.id, e.currentTarget.checked)}
                      aria-label={`Select ${p.name}`}
                    />
                  </td>
                  <td>
                    <div className="a-nm">
                      <ListingThumb name={p.name} imageUrl={p.coverImageUrl} />
                      <div className="min-w-0">
                        <Link href={`/admin/real-estate/${p.id}`} className="hover:text-(--admin-accent)">
                          <b>{p.name}</b>
                        </Link>
                        <small>
                          {p.builder}
                          {p.advertiserType === "broker" && ` · via ${p.advertiserName}`}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>{PROJECT_TYPE_LABELS[p.type]}</td>
                  <td>{p.area}</td>
                  <td className="whitespace-nowrap">
                    {formatDate(p.termStart)}
                    <br />
                    <small className={p.daysLeft <= 30 ? "text-(--admin-red)" : "text-zinc-500"}>{p.daysLeft > 0 ? `${p.daysLeft} days left` : "Ended"}</small>
                  </td>
                  <td>
                    <span className={`a-pl ${p.status}`}>{STATUS_LABEL[p.status]}</span>
                  </td>
                  <td>
                    {p.leadCount > 0 ? (
                      <Link href={`/admin/enquiries?section=real-estate&project=${p.id}`} className="font-semibold hover:text-(--admin-accent)" title="Open these leads">
                        {p.leadCount}
                      </Link>
                    ) : (
                      <span className="text-zinc-500">0</span>
                    )}
                  </td>
                  <td>
                    <div className="a-ac">
                      {p.status === "live" && (
                        <a href={sitePath(`/real-estate/${p.slug}`)} target="_blank" rel="noreferrer" title="View on site" aria-label={`View ${p.name} on the site`}>
                          <ExternalLink size={15} aria-hidden />
                        </a>
                      )}
                      {canEdit && (
                        <>
                        <Link href={`/admin/real-estate/${p.id}`} title="Edit" aria-label={`Edit ${p.name}`}>
                          <Pencil size={15} aria-hidden />
                        </Link>
                        <StatusButton id={p.id} name={p.name} status={p.status} />
                        <DeleteProjectButton id={p.id} name={p.name} />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-10 text-center text-zinc-500">
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <BulkDeleteDialog
        bulk={bulk}
        message={`This will permanently delete ${bulk.selected.size} selected project${bulk.selected.size === 1 ? "" : "s"} and their photos. Their leads are kept.`}
      />
    </>
  );
}

/** Publish (Draft or Hidden → Live) or unpublish (Live → Draft). */
function StatusButton({ id, name, status }: { id: string; name: string; status: ListingStatus }) {
  const { run, pending } = useAdminAction();
  const next: ListingStatus = status === "live" ? "draft" : "live";
  return (
    <button
      type="button"
      aria-label={status === "live" ? `Unpublish ${name}` : `Publish ${name}`}
      title={status === "live" ? "Unpublish" : "Publish"}
      disabled={pending}
      onClick={() => run(() => adminClient.patch(`/admin/projects/${id}`, { status: next }), { success: next === "live" ? "Listing published" : "Listing moved to draft" })}
    >
      {status === "live" ? <EyeOff size={15} aria-hidden /> : <Eye size={15} aria-hidden />}
    </button>
  );
}

/** Delete with confirmation. `redirectTo` navigates away afterwards (used on the edit page). */
export function DeleteProjectButton({ id, name, redirectTo, label }: { id: string; name: string; redirectTo?: string; label?: string }) {
  const router = useRouter();
  const { run, pending } = useAdminAction();
  const [open, setOpen] = useState(false);

  const remove = async () => {
    const result = await run(() => adminClient.delete(`/admin/projects/${id}`), { success: "Listing deleted", refresh: !redirectTo });
    if (!result.ok) return;
    setOpen(false);
    if (redirectTo) router.push(redirectTo);
  };

  return (
    <>
      <button
        type="button"
        className={label ? "a-btn g" : "dl"}
        aria-label={`Delete ${name}`}
        title="Delete"
        onClick={() => setOpen(true)}
      >
        <Trash2 size={15} aria-hidden />
        {label}
      </button>
      <ConfirmDialog
        open={open}
        title="Delete listing?"
        message={
          <>
            <b>{name}</b> and its photos and floor plans will be removed permanently. Its leads are kept.
          </>
        }
        pending={pending}
        onConfirm={remove}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
