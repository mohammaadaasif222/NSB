"use client";

import Form from "next/form";
import Link from "next/link";
import { useRef } from "react";
import { Search } from "lucide-react";
import type { AdminCategory, EnquiryStatus } from "@nsb/shared";
import { Button, Field, Select, TextInput } from "@/components/admin/form";

export interface FilterValues {
  q: string;
  category: string;
  status: EnquiryStatus | "";
  from: string;
  to: string;
}

/**
 * GET form: filters live in the URL (shareable, back-button friendly) and are applied on the
 * server. next/form navigates client-side; submitting always returns to page 1.
 */
export function EnquiryFilters({ categories, values }: { categories: AdminCategory[]; values: FilterValues }) {
  const form = useRef<HTMLFormElement>(null);
  const submit = () => form.current?.requestSubmit();
  const tops = categories.filter((c) => !c.parentId);
  const active = Object.values(values).some(Boolean);

  return (
    // key: reset the inputs when the URL changes (e.g. the bell link or "Clear").
    <Form
      key={JSON.stringify(values)}
      ref={form}
      action="/admin/enquiries"
      className="mb-4 grid grid-cols-2 gap-3 rounded-lg border border-zinc-200 bg-white p-4 lg:grid-cols-3 xl:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto]"
    >
      <Field label="Search" className="col-span-2 lg:col-span-1">
        <TextInput name="q" type="search" defaultValue={values.q} placeholder="Name, mobile, email or listing" maxLength={100} />
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
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </Select>
      </Field>
      <Field label="Received from">
        <TextInput name="from" type="date" defaultValue={values.from} max={values.to || undefined} onChange={submit} />
      </Field>
      <Field label="Received to">
        <TextInput name="to" type="date" defaultValue={values.to} min={values.from || undefined} onChange={submit} />
      </Field>
      <div className="col-span-2 flex items-end gap-2 sm:col-span-1">
        <Button type="submit">
          <Search className="size-4" aria-hidden /> Filter
        </Button>
        {active && (
          <Link href="/admin/enquiries" className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100">
            Clear
          </Link>
        )}
      </div>
    </Form>
  );
}
