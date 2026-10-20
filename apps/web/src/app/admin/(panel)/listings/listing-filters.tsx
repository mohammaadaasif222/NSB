"use client";

import Form from "next/form";
import Link from "next/link";
import { useRef } from "react";
import { Search } from "lucide-react";
import type { AdminCategory, ListingStatus } from "@nsb/shared";
import { Button, Field, Select, TextInput } from "@/components/admin/form";

export interface ListingFilterValues {
  q: string;
  /** A category or sub-category id. */
  category: string;
  from: string;
  to: string;
  status: ListingStatus | "";
}

/**
 * GET form: filters live in the URL and are applied on the server, as on the enquiries page.
 * Picking a category or a date filters straight away; submitting returns to page 1.
 */
export function ListingFilters({
  categories,
  values,
  pageSize,
  pageSizes,
}: {
  categories: AdminCategory[];
  values: ListingFilterValues;
  pageSize: number;
  pageSizes: readonly number[];
}) {
  const form = useRef<HTMLFormElement>(null);
  const submit = () => form.current?.requestSubmit();
  const tops = categories.filter((c) => !c.parentId);
  const active = Object.values(values).some(Boolean);

  return (
    // key: reset the inputs when the URL changes (e.g. "Clear").
    <Form
      key={JSON.stringify({ values, pageSize })}
      ref={form}
      action="/admin/listings"
      className="mb-4 grid grid-cols-2 gap-3 rounded-lg border border-zinc-200 bg-white p-4 lg:grid-cols-3 xl:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_auto]"
    >
      <Field label="Search" className="col-span-2 lg:col-span-1">
        <TextInput name="q" type="search" defaultValue={values.q} placeholder="Business name, area or locality" maxLength={100} />
      </Field>
      <Field label="Category">
        <Select name="category" defaultValue={values.category} onChange={submit}>
          <option value="">All categories</option>
          {tops.map((top) => (
            <optgroup key={top.id} label={top.name}>
              <option value={top.id}>All of {top.name}</option>
              {categories
                .filter((c) => c.parentId === top.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </Select>
      </Field>
      <Field label="Status">
        <Select name="status" defaultValue={values.status} onChange={submit}>
          <option value="">All</option>
          <option value="live">Live</option>
          <option value="draft">Draft</option>
          <option value="hidden">Hidden</option>
        </Select>
      </Field>
      <Field label="Added from">
        <TextInput name="from" type="date" defaultValue={values.from} max={values.to || undefined} onChange={submit} />
      </Field>
      <Field label="Added to">
        <TextInput name="to" type="date" defaultValue={values.to} min={values.from || undefined} onChange={submit} />
      </Field>
      <Field label="Per page">
        <Select name="pageSize" defaultValue={String(pageSize)} onChange={submit}>
          {pageSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </Select>
      </Field>
      <div className="col-span-2 flex items-end gap-2 sm:col-span-1">
        <Button type="submit">
          <Search className="size-4" aria-hidden /> Filter
        </Button>
        {active && (
          <Link href={pageSize === 10 ? "/admin/listings" : `/admin/listings?pageSize=${pageSize}`} className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100">
            Clear
          </Link>
        )}
      </div>
    </Form>
  );
}
