"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { type AdminCategory, type AdminSettings, DEFAULT_SLOT_PRICE, type Pricing } from "@nsb/shared";
import { useCan } from "@/components/admin/admin-role";
import { Modal } from "@/components/admin/dialog";
import { Button, slugify } from "@/components/admin/form";
import { useToast } from "@/components/admin/toast";
import { adminClient, RequestError } from "@/lib/admin-client";

/** A typed price; ₹0 is a real price, only a blank box falls back to the default. */
const priceOf = (typed: string) => (typed.trim() === "" ? DEFAULT_SLOT_PRICE : Number(typed));

interface Row {
  id: string;
  name: string;
  isActive: boolean;
  price: string;
}

/**
 * The demo's "Manage sub-categories": rename, show or hide, set the 6-month slot price (Super
 * Admins), or add a sub-category. A new one gets the Wedding fields only, until it has its own form.
 */
export function ManageSubcategories({ weddingId, subs, pricing }: { weddingId: string; subs: AdminCategory[]; pricing: Pricing }) {
  const router = useRouter();
  const toast = useToast();
  const canPrice = useCan("manage");
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const initial = () => subs.map((c) => ({ id: c.id, name: c.name, isActive: c.isActive, price: String(pricing.categories[c.slug] ?? DEFAULT_SLOT_PRICE) }));
  const [rows, setRows] = useState<Row[]>(initial);
  const [added, setAdded] = useState({ name: "", price: "" });
  const setRow = (i: number, patch: Partial<Row>) => setRows((all) => all.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      const prices: Record<string, number> = { ...pricing.categories };
      for (const [i, row] of rows.entries()) {
        const sub = subs[i]!;
        const name = row.name.trim() || sub.name;
        if (name !== sub.name || row.isActive !== sub.isActive) await adminClient.patch(`/admin/categories/${sub.id}`, { name, isActive: row.isActive });
        prices[sub.slug] = priceOf(row.price);
      }
      const newName = added.name.trim();
      if (newName) {
        const slug = slugify(newName);
        await adminClient.post("/admin/categories", { name: newName, slug, parentId: weddingId, isActive: true });
        prices[slug] = priceOf(added.price);
      }
      if (canPrice) await adminClient.patch<AdminSettings>("/admin/settings", { pricing: { ...pricing, categories: prices } });
      toast.success("Sub-categories saved");
      setOpen(false);
      setAdded({ name: "", price: "" });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof RequestError ? err.message : "Could not save. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="a-btn g"
        onClick={() => {
          setRows(initial());
          setOpen(true);
        }}
      >
        Manage sub-categories
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Wedding sub-categories" size="md">
        <form onSubmit={(e) => void save(e)} noValidate>
          <p className="mb-3 text-sm text-zinc-500">
            Rename, {canPrice ? "set the 6-month slot price, " : ""}or hide a sub-category. Hidden ones and their listings leave the site.
          </p>
          {rows.map((row, i) => (
            <div key={row.id} className="a-pr2">
              <label className="sw-label flex items-center" title={row.isActive ? "Shown on the site" : "Hidden"}>
                <input type="checkbox" className="a-listing-select" checked={row.isActive} onChange={(e) => setRow(i, { isActive: e.target.checked })} aria-label={`Show ${row.name}`} />
              </label>
              <input className="a-in flex-1 text-left!" style={{ width: "auto" }} value={row.name} maxLength={80} aria-label="Name" onChange={(e) => setRow(i, { name: e.target.value })} />
              {canPrice && (
                <>
                  ₹
                  <input className="a-in" style={{ width: 100 }} inputMode="numeric" value={row.price} aria-label={`${row.name} slot price`} onChange={(e) => setRow(i, { price: e.target.value.replace(/\D/g, "") })} />
                </>
              )}
            </div>
          ))}
          <div className="a-pr2">
            <span style={{ flex: "0 0 16px" }} />
            <input className="a-in flex-1 text-left!" style={{ width: "auto" }} value={added.name} maxLength={80} placeholder="Add a new sub-category" onChange={(e) => setAdded((a) => ({ ...a, name: e.target.value }))} />
            {canPrice && (
              <>
                ₹
                <input className="a-in" style={{ width: 100 }} inputMode="numeric" value={added.price} placeholder="Price" onChange={(e) => setAdded((a) => ({ ...a, price: e.target.value.replace(/\D/g, "") }))} />
              </>
            )}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" pending={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
