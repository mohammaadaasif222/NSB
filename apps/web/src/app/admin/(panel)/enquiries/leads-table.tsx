"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { Phone } from "lucide-react";
import { type Enquiry, LEAD_STATUSES, type LeadStatus, PROJECT_TYPE_LABELS } from "@nsb/shared";
import { useCan } from "@/components/admin/admin-role";
import { Modal } from "@/components/admin/dialog";
import { Button } from "@/components/admin/form";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { adminClient } from "@/lib/admin-client";
import { formatDate, formatDateTime } from "@/lib/format";

const STATUS_LABEL: Record<LeadStatus, string> = { new: "New", contacted: "Contacted", won: "Won", lost: "Lost" };

/** A site visit's second date, from its message line (written by the API's project-lead-message.ts). */
const otherVisitDate = (e: Enquiry) => (e.source === "Site visit" ? (/^Other preferred date: (.+)$/m.exec(e.message)?.[1] ?? null) : null);
/** Pill colours from the demo: new blue, contacted amber, won green, lost red. */
const STATUS_PILL: Record<LeadStatus, string> = { new: "new", contacted: "draft", won: "live", lost: "hidden" };

const mask = (mobile: string) => `${mobile.slice(0, 2)}XXXXXX${mobile.slice(-2)}`;

function ago(iso: string) {
  const m = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 60_000));
  return m < 60 ? `${m}m ago` : m < 1440 ? `${Math.floor(m / 60)}h ago` : `${Math.floor(m / 1440)}d ago`;
}

/** Where a lead came from, linked to its listing or project while it exists. */
function SourceLink({ e }: { e: Enquiry }) {
  const href = e.projectId ? `/admin/real-estate/${e.projectId}` : e.listingId ? `/admin/listings/${e.listingId}` : null;
  return href ? (
    <Link href={href} className="hover:text-(--admin-accent)" onClick={(ev) => ev.stopPropagation()}>
      {e.listingName}
    </Link>
  ) : (
    <>{e.listingName}</>
  );
}

/**
 * The demo's leads table: phone hidden until "Reveal", the listing, its sub-category or property
 * type, the source, when, and the follow-up status. Clicking a row opens the lead and marks it read.
 */
export function LeadsTable({ leads, section, empty }: { leads: Enquiry[]; section: "real-estate" | "wedding"; empty: string }) {
  const router = useRouter();
  const { run, pending } = useAdminAction();
  const canEdit = useCan("edit");
  const canSeeNumbers = useCan("leadContacts");
  const [rows, setRows] = useState(leads);
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());
  const [open, setOpen] = useState<Enquiry | null>(null);

  const patch = async (lead: Enquiry, body: { read?: boolean; leadStatus?: LeadStatus }, success?: string) => {
    const result = await run(() => adminClient.patch<Enquiry>(`/admin/enquiries/${lead.id}`, body), { success, refresh: false });
    if (!result.ok) return null;
    // The update has no project join; keep the row's property type.
    const updated = { ...result.data, projectType: lead.projectType };
    setRows((all) => all.map((r) => (r.id === updated.id ? updated : r)));
    setOpen((current) => (current?.id === updated.id ? updated : current));
    router.refresh(); // the tab counts and the unread badge
    return updated;
  };

  const view = (lead: Enquiry) => {
    setOpen(lead);
    if (!lead.readAt) void patch(lead, { read: true });
  };

  return (
    <>
      <div className="a-tw">
        <table className="a-t">
          <thead>
            <tr>
              <th scope="col">Lead</th>
              <th scope="col">Phone</th>
              <th scope="col">Listing</th>
              <th scope="col">{section === "wedding" ? "Sub-category" : "Property type"}</th>
              <th scope="col">Source</th>
              <th scope="col">When</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((e) => (
                <tr key={e.id} onClick={() => view(e)} className="cursor-pointer" style={e.readAt ? undefined : { fontWeight: 600 }}>
                  <td>
                    <button type="button" className="flex items-center gap-2 text-left font-bold" onClick={(ev) => (ev.stopPropagation(), view(e))}>
                      {!e.readAt && <span className="size-2 shrink-0 rounded-full bg-(--admin-accent)" aria-label="unread" />}
                      {e.name}
                    </button>
                  </td>
                  <td className="whitespace-nowrap tabular-nums" onClick={(ev) => ev.stopPropagation()}>
                    {canSeeNumbers && revealed.has(e.id) ? (
                      <a href={`tel:+91${e.mobile}`} className="hover:text-(--admin-accent)">
                        {e.mobile}
                      </a>
                    ) : (
                      <>
                        {mask(e.mobile)}{" "}
                        {canSeeNumbers && (
                          <button type="button" className="font-semibold text-(--admin-accent)" onClick={() => setRevealed((s) => new Set(s).add(e.id))}>
                            Reveal
                          </button>
                        )}
                      </>
                    )}
                  </td>
                  <td>
                    <SourceLink e={e} />
                    <small className="block text-zinc-500">{e.categoryName}</small>
                  </td>
                  <td>{section === "wedding" ? e.categoryName : e.projectType ? PROJECT_TYPE_LABELS[e.projectType] : "—"}</td>
                  <td>
                    {e.source ?? "Enquiry form"}
                    {e.source === "Site visit" && e.preferredDate && (
                      <small className="block whitespace-nowrap text-zinc-500">Visit: {formatDate(e.preferredDate)}</small>
                    )}
                  </td>
                  <td className="whitespace-nowrap" title={formatDateTime(e.createdAt)}>
                    {ago(e.createdAt)}
                  </td>
                  <td onClick={(ev) => ev.stopPropagation()}>
                    {canEdit ? (
                      <select
                        className="a-sel"
                        value={e.leadStatus}
                        disabled={pending}
                        aria-label={`Status of the lead from ${e.name}`}
                        onChange={(ev) => void patch(e, { leadStatus: ev.target.value as LeadStatus }, "Lead updated")}
                      >
                        {LEAD_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={`a-pl ${STATUS_PILL[e.leadStatus]}`}>{STATUS_LABEL[e.leadStatus]}</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-10 text-center text-zinc-500">
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open !== null} onClose={() => setOpen(null)} title={open ? `Lead from ${open.name}` : "Lead"}>
        {open && (
          <LeadDetails
            enquiry={open}
            pending={pending}
            canSeeNumbers={canSeeNumbers}
            onUnread={async () => (await patch(open, { read: false }, "Marked as unread")) && setOpen(null)}
          />
        )}
      </Modal>
    </>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-2 py-2 sm:grid-cols-[8rem_minmax(0,1fr)]">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="min-w-0 text-zinc-900">{children}</dd>
    </div>
  );
}

function LeadDetails({ enquiry: e, pending, canSeeNumbers, onUnread }: { enquiry: Enquiry; pending: boolean; canSeeNumbers: boolean; onUnread: () => void }) {
  return (
    <div className="flex flex-col gap-4 text-sm">
      {canSeeNumbers ? (
        <a href={`tel:+91${e.mobile}`} className="inline-flex items-center gap-2 self-start rounded-md bg-zinc-900 px-3 py-2 font-medium text-white hover:bg-zinc-800">
          <Phone className="size-4" aria-hidden /> Call +91 {e.mobile}
        </a>
      ) : (
        <p className="a-info">Your role cannot see lead numbers. Phone: {e.mobile}</p>
      )}
      <dl className="divide-y divide-zinc-100">
        {e.email && (
          <Row label="Email">
            <a href={`mailto:${e.email}`} className="break-all underline-offset-2 hover:underline">
              {e.email}
            </a>
          </Row>
        )}
        <Row label="Status">{STATUS_LABEL[e.leadStatus]}</Row>
        {e.eventType && <Row label="Event">{e.eventType}</Row>}
        {e.preferredDate && <Row label={e.source === "Site visit" ? "Visit date" : "Preferred date"}>{formatDate(e.preferredDate)}</Row>}
        {otherVisitDate(e) && <Row label="Other preferred date">{otherVisitDate(e)}</Row>}
        {e.source ? <Row label="Lead type">{e.source}</Row> : <Row label="Budget">{e.budget || "Not given"}</Row>}
        <Row label={e.source ? "Project" : "Listing"}>
          <SourceLink e={e} />
          {!e.projectId && !e.listingId && !e.source && <span className="text-zinc-500"> (listing deleted)</span>}
        </Row>
        <Row label="Category">{e.categoryName}</Row>
        <Row label="Received">{formatDateTime(e.createdAt)}</Row>
        <Row label="Read">{e.readAt ? formatDateTime(e.readAt) : "Not yet"}</Row>
      </dl>
      <div>
        <p className="mb-1 text-zinc-500">Message</p>
        <p className="rounded-md bg-zinc-50 p-3 whitespace-pre-line text-zinc-900">{e.message}</p>
      </div>
      {e.readAt && (
        <div className="flex justify-end border-t border-zinc-200 pt-4">
          <Button variant="secondary" onClick={onUnread} pending={pending}>
            Mark as unread
          </Button>
        </div>
      )}
    </div>
  );
}
