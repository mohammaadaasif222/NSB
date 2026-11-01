"use client";

import Image from "next/image";
import { useState } from "react";
import { Plus, Smartphone } from "lucide-react";
import type { Banner } from "@nsb/shared";
import { ConfirmDialog, Modal } from "@/components/admin/dialog";
import { Toggle } from "@/components/admin/form";
import { SortableList } from "@/components/admin/sortable-list";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { adminClient } from "@/lib/admin-client";
import { BannerForm } from "./banner-form";

type Editing = { mode: "new" } | { mode: "edit"; banner: Banner } | null;

export function BannerManager({ banners, maxUploadBytes }: { banners: Banner[]; maxUploadBytes: number }) {
  const { run, pending } = useAdminAction();
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<Banner | null>(null);
  const live = banners.filter((b) => b.isActive).length;

  const reorder = async (ids: string[]) =>
    (await run(() => adminClient.put("/admin/banners/order", { ids }), { success: "Order saved" })).ok;

  const toggle = (banner: Banner, isActive: boolean) =>
    run(() => adminClient.patch(`/admin/banners/${banner.id}`, { isActive }), {
      success: isActive ? `"${banner.heading}" is live` : `"${banner.heading}" is hidden`,
    });

  const remove = async () => {
    if (!deleting) return;
    const result = await run(() => adminClient.delete(`/admin/banners/${deleting.id}`), { success: "Banner deleted" });
    if (result.ok) setDeleting(null);
  };

  /** Saves the link typed into a row, when it changed. */
  const saveLink = (banner: Banner, value: string) => {
    const ctaLink = value.trim();
    if (ctaLink === (banner.ctaLink ?? "")) return;
    void run(() => adminClient.patch(`/admin/banners/${banner.id}`, { ctaLink }), { success: "Link saved" });
  };

  // Rows follow the NSB Live Demo admin: preview, name and image, link, then show / order / remove.
  return (
    <>
      {banners.length === 0 ? (
        <p className="mb-3 rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-10 text-center text-sm text-zinc-500">
          No banners yet. The home page shows a default banner.
        </p>
      ) : (
        <div className="mb-3">
          {live === 0 && <p className="mb-3 text-sm text-zinc-500">No banner is live: the home page shows a default banner.</p>}
          <SortableList items={banners} getId={(b) => b.id} getLabel={(b) => b.heading} onReorder={reorder} disabled={pending} layout="rows">
            {(banner, arrows) => {
              const n = banners.findIndex((b) => b.id === banner.id) + 1;
              return (
                <div className="a-hrow a-hrow-4">
                  <div className="a-hth relative overflow-hidden">
                    {banner.imageUrl ? (
                      <Image src={banner.imageUrl} alt="" fill sizes="150px" className="object-cover" />
                    ) : (
                      <span>{banner.heading}</span>
                    )}
                  </div>
                  <div className="a-hmid min-w-0">
                    <b className="truncate">Banner {n}</b>
                    <small className="truncate">
                      {banner.imageUrl ? "Your image" : "Default design"} · {banner.heading}
                      {banner.mobileImageUrl && (
                        <>
                          {" "}
                          · <Smartphone className="inline size-3" aria-label="Has a mobile image" />
                        </>
                      )}
                    </small>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <button type="button" className="a-btn g s" onClick={() => setEditing({ mode: "edit", banner })}>
                        {banner.imageUrl ? "Replace image" : "Upload image"}
                      </button>
                      <button type="button" className="a-btn g s" onClick={() => setEditing({ mode: "edit", banner })}>
                        Edit text
                      </button>
                    </div>
                  </div>
                  <div className="a-hlk">
                    <label htmlFor={`banner-link-${banner.id}`}>Where should it go? (link)</label>
                    <input
                      id={`banner-link-${banner.id}`}
                      key={banner.ctaLink ?? ""}
                      defaultValue={banner.ctaLink ?? ""}
                      placeholder="/wedding or https://…"
                      maxLength={300}
                      list="home-routes"
                      disabled={pending}
                      onBlur={(e) => saveLink(banner, e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                    />
                  </div>
                  <div className="a-hct">
                    <Toggle label={`Show "${banner.heading}" on the home page`} checked={banner.isActive} disabled={pending} onChange={(v) => toggle(banner, v)} />
                    <span className="a-hs0">Show</span>
                    {arrows}
                    <button type="button" className="a-btn g s" onClick={() => setDeleting(banner)}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            }}
          </SortableList>
        </div>
      )}
      <button type="button" className="a-btn" onClick={() => setEditing({ mode: "new" })}>
        <Plus className="size-4" aria-hidden /> Add banner
      </button>
      <datalist id="home-routes">
        {["/wedding", "/wedding/wedding-venues", "/wedding/makeup-beauty", "/wedding/catering-halwai", "/wedding/photography-films", "/wedding/cards-invitations", "/"].map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing?.mode === "edit" ? "Edit banner" : "Add banner"} size="lg">
        {editing && (
          <BannerForm
            key={editing.mode === "edit" ? editing.banner.id : "new"}
            banner={editing.mode === "edit" ? editing.banner : undefined}
            maxUploadBytes={maxUploadBytes}
            onDone={() => setEditing(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete banner?"
        message={
          <>
            <b>{deleting?.heading}</b> will be removed permanently, with its images. To take it off the home page for now, switch it off
            instead.
          </>
        }
        pending={pending}
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
