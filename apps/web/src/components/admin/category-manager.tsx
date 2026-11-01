"use client";

import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { type AdminCategory, LISTING_FORMS } from "@nsb/shared";
import { ConfirmDialog, Modal } from "@/components/admin/dialog";
import { IconButton, Toggle } from "@/components/admin/form";
import { SortableList } from "@/components/admin/sortable-list";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { adminClient } from "@/lib/admin-client";
import { CategoryForm } from "./category-form";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const subCategories = (n: number) => plural(n, "sub-category", "sub-categories");
const listingsCount = (n: number) => plural(n, "listing", "listings");

/**
 * Categories are fixed: each listing form (LISTING_FORMS in @nsb/shared) is defined for known
 * category slugs, so the panel edits, hides, reorders and deletes them but does not add new ones.
 */
export function CategoryManager({ categories, maxUploadBytes }: { categories: AdminCategory[]; maxUploadBytes: number }) {
  const { run, pending } = useAdminAction();
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [deleting, setDeleting] = useState<AdminCategory | null>(null);

  // One pass to group sub-categories under their parents; stable arrays keep SortableList state.
  const { topLevel, childrenOf } = useMemo(() => {
    const childrenOf = new Map<string, AdminCategory[]>();
    for (const c of categories) {
      if (c.parentId) childrenOf.set(c.parentId, [...(childrenOf.get(c.parentId) ?? []), c]);
    }
    return { topLevel: categories.filter((c) => !c.parentId), childrenOf };
  }, [categories]);

  const reorder = async (ids: string[]) =>
    (await run(() => adminClient.put("/admin/categories/order", { ids }), { success: "Order saved" })).ok;

  const toggle = (category: AdminCategory, isActive: boolean) =>
    run(() => adminClient.patch(`/admin/categories/${category.id}`, { isActive }), {
      success: `"${category.name}" is ${isActive ? "shown" : "hidden"}`,
    });

  const remove = async () => {
    if (!deleting) return;
    const result = await run(() => adminClient.delete(`/admin/categories/${deleting.id}`), { success: "Category deleted" });
    if (result.ok) setDeleting(null);
  };

  /**
   * One row as in the NSB Live Demo admin: order, name, Live / Soon, show switch, link, then
   * edit and delete. Live means the category has a listing form (it takes listings now).
   */
  const row = (category: AdminCategory, arrows: ReactNode, parent?: AdminCategory) => {
    const children = childrenOf.get(category.id) ?? [];
    const blocker = children.length
      ? `Move or delete its ${subCategories(children.length)} first`
      : category.listingCount
        ? `Move its ${listingsCount(category.listingCount)} first`
        : null;
    const live = !!LISTING_FORMS[parent?.slug ?? category.slug];
    const path = `/${parent ? `${parent.slug}/${category.slug}` : category.slug}`;
    return (
      <div className={`a-hrow a-crow ${parent ? "a-crow-sub" : ""}`}>
        {arrows}
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-100 text-sm font-semibold text-zinc-500">
            {category.imageUrl ? (
              <Image src={category.imageUrl} alt="" fill sizes="36px" className={parent ? "object-cover" : "object-contain p-1"} />
            ) : (
              category.name.charAt(0)
            )}
          </span>
          <span className="min-w-0">
            <b className="block truncate">{category.name}</b>
            <small className="block truncate text-xs text-zinc-500">
              {!parent && children.length > 0 && `${subCategories(children.length)} · `}
              {category.listingCount > 0 ? (
                <Link href={parent?.slug === "wedding" ? `/admin/wedding?sub=${category.id}` : `/admin/listings?category=${category.id}`} className="hover:underline">
                  {listingsCount(category.listingCount)}
                </Link>
              ) : (
                listingsCount(0)
              )}
            </small>
          </span>
        </div>
        <div className="a-seg" title={live ? "Takes listings now" : "Shows as coming soon until its listing form is added"}>
          <span className={live ? "on lv" : undefined}>Live</span>
          <span className={live ? undefined : "on sn"}>Soon</span>
        </div>
        <div className="a-hct">
          <Toggle label={`Show ${category.name} on the site`} checked={category.isActive} disabled={pending} onChange={(v) => toggle(category, v)} />
          <span className="a-hs0">Show</span>
        </div>
        <div className="a-hlk">
          <label htmlFor={`cat-link-${category.id}`}>Where it goes (link)</label>
          <input id={`cat-link-${category.id}`} value={path} readOnly />
        </div>
        <div className="flex items-center gap-1">
          <IconButton label={`Edit ${category.name}`} onClick={() => setEditing(category)}>
            <Pencil className="size-4" aria-hidden />
          </IconButton>
          <IconButton
            label={blocker ? `Cannot delete: ${blocker.toLowerCase()}` : `Delete ${category.name}`}
            disabled={!!blocker}
            onClick={() => setDeleting(category)}
            className="hover:text-red-600"
          >
            <Trash2 className="size-4" aria-hidden />
          </IconButton>
        </div>
      </div>
    );
  };

  return (
    <>
      {topLevel.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-10 text-center text-sm text-zinc-500">No categories yet.</p>
      ) : (
        <SortableList items={topLevel} getId={(c) => c.id} getLabel={(c) => c.name} onReorder={reorder} disabled={pending} layout="rows">
          {(category, arrows) => {
            const children = childrenOf.get(category.id);
            return (
              <>
                {row(category, arrows)}
                {children && (
                  <details className="a-subs">
                    <summary>
                      {category.name} sub-categories ({children.length})
                    </summary>
                    <SortableList items={children} getId={(c) => c.id} getLabel={(c) => c.name} onReorder={reorder} disabled={pending} layout="rows">
                      {(child, childArrows) => row(child, childArrows, category)}
                    </SortableList>
                  </details>
                )}
              </>
            );
          }}
        </SortableList>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Edit category">
        {editing && (
          <CategoryForm
            key={editing.id}
            category={editing}
            categories={categories}
            maxUploadBytes={maxUploadBytes}
            onDone={() => setEditing(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete category?"
        message={
          <>
            <b>{deleting?.name}</b> will be removed permanently. Leads keep the category name they were saved with. To hide it for now,
            switch it off instead.
          </>
        }
        pending={pending}
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
