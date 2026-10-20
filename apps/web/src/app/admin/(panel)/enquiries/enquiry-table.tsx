"use client";

import Link from "next/link";
import { type ReactNode, useState } from "react";
import { Phone } from "lucide-react";
import type { Enquiry } from "@nsb/shared";
import { Modal } from "@/components/admin/dialog";
import { Button } from "@/components/admin/form";
import { DataTable } from "@/components/admin/ui";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { adminClient } from "@/lib/admin-client";
import { formatDate, formatDateTime } from "@/lib/format";

/** Enquiry list; clicking a row (or "View") opens the details and marks the enquiry read. */
export function EnquiryTable({ enquiries, empty }: { enquiries: Enquiry[]; empty: string }) {
  const { run, pending } = useAdminAction();
  const [open, setOpen] = useState<Enquiry | null>(null);

  const setRead = async (enquiry: Enquiry, read: boolean) => {
    const result = await run(() => adminClient.patch<Enquiry>(`/admin/enquiries/${enquiry.id}`, { read }), {
      success: read ? undefined : "Marked as unread",
    });
    return result.ok ? result.data : null;
  };

  const view = async (enquiry: Enquiry) => {
    setOpen(enquiry);
    if (!enquiry.readAt) {
      const updated = await setRead(enquiry, true);
      if (updated) setOpen((current) => (current?.id === updated.id ? updated : current));
    }
  };

  return (
    <>
      <DataTable
        rows={enquiries}
        rowKey={(e) => e.id}
        empty={empty}
        onRowClick={view}
        rowClassName={(e) => (e.readAt ? "" : "bg-sky-50/60 [&_td]:text-zinc-900")}
        columns={[
          {
            header: "Received",
            className: "whitespace-nowrap",
            cell: (e) => (
              <span className="flex items-center gap-2">
                <span className={`size-2 shrink-0 rounded-full ${e.readAt ? "bg-transparent" : "bg-sky-500"}`} aria-hidden />
                {formatDateTime(e.createdAt)}
                {!e.readAt && <span className="sr-only">(unread)</span>}
              </span>
            ),
          },
          {
            header: "Name",
            cell: (e) => <span className={e.readAt ? "font-medium text-zinc-900" : "font-semibold text-zinc-900"}>{e.name}</span>,
          },
          { header: "Mobile", cell: (e) => <span className="whitespace-nowrap tabular-nums">{e.mobile}</span> },
          // { header: "Email", cell: (e) => (e.email ? <span className="break-all">{e.email}</span> : <span className="text-zinc-400">—</span>) },
          {
            header: "Source",
            cell: (e) => (
              <>
                {e.listingName}
                <span className="block text-zinc-500">{e.categoryName}</span>
              </>
            ),
          },
          { header: "Date", cell: (e) => formatDate(e.preferredDate), className: "whitespace-nowrap" },
          { header: "Message", cell: (e) => <p className="line-clamp-2 max-w-xs">{e.message}</p> },
          {
            header: "",
            className: "w-16 text-right",
            cell: (e) => (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void view(e);
                }}
                className="rounded px-2 py-1 text-xs font-medium text-zinc-700 underline-offset-2 hover:underline"
                aria-label={`View enquiry from ${e.name}`}
              >
                View
              </button>
            ),
          },
        ]}
      />

      <Modal open={open !== null} onClose={() => setOpen(null)} title={open ? `Enquiry from ${open.name}` : "Enquiry"}>
        {open && <EnquiryDetails enquiry={open} pending={pending} onUnread={async () => (await setRead(open, false)) && setOpen(null)} />}
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

function EnquiryDetails({ enquiry: e, pending, onUnread }: { enquiry: Enquiry; pending: boolean; onUnread: () => void }) {
  return (
    <div className="flex flex-col gap-4 text-sm">
      <a
        href={`tel:+91${e.mobile}`}
        className="inline-flex items-center gap-2 self-start rounded-md bg-zinc-900 px-3 py-2 font-medium text-white hover:bg-zinc-800"
      >
        <Phone className="size-4" aria-hidden /> Call +91 {e.mobile}
      </a>
      <dl className="divide-y divide-zinc-100">
        {e.email && (
          <Row label="Email">
            <a href={`mailto:${e.email}`} className="break-all underline-offset-2 hover:underline">
              {e.email}
            </a>
          </Row>
        )}
        {e.eventType && <Row label="Event">{e.eventType}</Row>}
        <Row label="Preferred date">{formatDate(e.preferredDate)}</Row>
        <Row label="Budget">{e.budget || "Not given"}</Row>
        <Row label="Listing">
          {e.listingId ? (
            <Link href={`/admin/listings/${e.listingId}`} className="underline-offset-2 hover:underline">
              {e.listingName}
            </Link>
          ) : (
            <>
              {e.listingName} <span className="text-zinc-500">(listing deleted)</span>
            </>
          )}
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
