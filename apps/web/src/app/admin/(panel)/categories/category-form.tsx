"use client";

import { type FormEvent, useState } from "react";
import { type AdminCategory, type CategoryUpdate, LISTING_FORMS } from "@nsb/shared";
import { Button, Field, Select, TextArea, TextInput, Toggle } from "@/components/admin/form";
import { ImageUpload, useSessionUploads } from "@/components/admin/image-upload";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { adminClient } from "@/lib/admin-client";

/**
 * Edit a category. Categories are two levels: a sub-category's parent must be top-level, and a
 * category that has sub-categories stays top-level. A category with a listing form keeps its
 * slug and parent, because the form is found by them.
 */
export function CategoryForm({
  category,
  categories,
  maxUploadBytes,
  onDone,
}: {
  category: AdminCategory;
  categories: AdminCategory[];
  maxUploadBytes: number;
  onDone: () => void;
}) {
  const { run, pending } = useAdminAction();
  const trackUpload = useSessionUploads();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState({
    parentId: category.parentId ?? "",
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    imageUrl: category.imageUrl,
    isActive: category.isActive,
  });
  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => setValues((v) => ({ ...v, [key]: value }));

  const hasChildren = categories.some((c) => c.parentId === category.id);
  const parents = categories.filter((c) => !c.parentId && c.id !== category.id);
  const parentSlug = categories.find((c) => c.id === category.parentId)?.slug;
  const hasForm = parentSlug ? !!LISTING_FORMS[parentSlug]?.subcategories[category.slug] : !!LISTING_FORMS[category.slug];

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErrors({});
    const { slug, parentId, ...rest } = values;
    const body: CategoryUpdate = hasForm ? rest : { ...rest, slug, parentId: parentId || null };
    const result = await run(() => adminClient.patch(`/admin/categories/${category.id}`, body), { success: "Category saved" });
    if (result.ok) onDone();
    else if (result.error.status === 409) setErrors({ slug: result.error.message });
    else setErrors(result.error.fieldErrors);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Field
        label="Parent category"
        hint={
          hasForm
            ? "Fixed: this category has a listing form."
            : hasChildren
              ? "This category has sub-categories, so it stays top-level."
              : "Top-level categories appear on the home page."
        }
        error={errors.parentId}
      >
        <Select value={values.parentId} onChange={(e) => set("parentId", e.target.value)} disabled={hasChildren || hasForm}>
          <option value="">None (top-level)</option>
          {parents.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" error={errors.name}>
          <TextInput
            value={values.name}
            maxLength={80}
            required
            invalid={!!errors.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>
        <Field label="URL slug" hint={hasForm ? "Fixed: the listing form is linked to it" : "Lowercase letters, numbers and hyphens"} error={errors.slug}>
          <TextInput
            value={values.slug}
            maxLength={120}
            required
            readOnly={hasForm}
            className={hasForm ? "bg-zinc-50 text-zinc-500" : ""}
            invalid={!!errors.slug}
            onChange={(e) => set("slug", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Description" error={errors.description}>
        <TextArea value={values.description} onChange={(e) => set("description", e.target.value)} maxLength={500} />
      </Field>
      {/* key: switching level changes the size checks, so reset any upload error. */}
      <ImageUpload
        key={values.parentId ? "sub" : "top"}
        label={values.parentId ? "Card image" : "Icon"}
        slot={values.parentId ? "category" : "category-icon"}
        value={values.imageUrl}
        onChange={(url) => set("imageUrl", url)}
        onUploaded={trackUpload}
        maxBytes={maxUploadBytes}
        error={errors.imageUrl}
      />
      <Toggle
        label={values.parentId ? "Show on the site" : "Show on the site (hiding it also hides its sub-categories and listings)"}
        showLabel
        checked={values.isActive}
        onChange={(v) => set("isActive", v)}
      />
      <div className="flex justify-end gap-2 border-t border-zinc-200 pt-4">
        <Button variant="secondary" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" pending={pending}>
          {pending ? "Saving…" : "Save category"}
        </Button>
      </div>
    </form>
  );
}
