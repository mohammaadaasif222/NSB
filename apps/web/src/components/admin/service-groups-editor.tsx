"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { MAX_SERVICE_GROUPS, type ServiceGroup } from "@nsb/shared";
import { Button, Field, IconButton, TextArea, TextInput } from "./form";

/** One section while editing: the services are one per line, as in the plain Services box. */
export interface ServiceGroupDraft {
  title: string;
  items: string;
}

export const draftFromGroups = (groups: ServiceGroup[]): ServiceGroupDraft[] => groups.map((g) => ({ title: g.title, items: g.items.join("\n") }));

/** Sections with a heading and at least one service; empty rows are dropped. */
export const groupsFromDraft = (rows: ServiceGroupDraft[]): ServiceGroup[] =>
  rows
    .map((r) => ({
      title: r.title.trim(),
      items: r.items
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    }))
    .filter((g) => g.title || g.items.length);

/** Headed service sections (e.g. "Food", "Decor"), shown on the listing page after the plain services. */
export function ServiceGroupsEditor({
  rows,
  onChange,
  errors,
}: {
  rows: ServiceGroupDraft[];
  onChange: (rows: ServiceGroupDraft[]) => void;
  errors: Record<string, string>;
}) {
  const update = (i: number, patch: Partial<ServiceGroupDraft>) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const move = (i: number, d: -1 | 1) => {
    const next = [...rows];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-zinc-500">
        Optional. Group services under headings, for example <b>Food</b>, <b>Decor</b>, <b>Rooms</b>. Each section shows as its own heading with
        an icon list on the listing page. Use the Services box above for anything that needs no heading. A detail after a <b>|</b> shows under
        the name, e.g. <i>Catering | In-house catering only</i>.
      </p>
      {rows.map((row, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-3">
          <div className="flex items-end gap-2">
            <Field label={`Heading ${i + 1}`} error={errors[`serviceGroups.${i}.title`]} className="flex-1">
              <TextInput value={row.title} maxLength={60} placeholder="e.g. Decor" onChange={(e) => update(i, { title: e.target.value })} invalid={!!errors[`serviceGroups.${i}.title`]} />
            </Field>
            <IconButton label={`Move section ${i + 1} up`} onClick={() => move(i, -1)} disabled={i === 0} className="mb-1">
              <ArrowUp className="size-4" aria-hidden />
            </IconButton>
            <IconButton label={`Move section ${i + 1} down`} onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="mb-1">
              <ArrowDown className="size-4" aria-hidden />
            </IconButton>
            <IconButton label={`Remove section ${i + 1}`} onClick={() => onChange(rows.filter((_, j) => j !== i))} className="mb-1 hover:text-red-600">
              <Trash2 className="size-4" aria-hidden />
            </IconButton>
          </div>
          <Field label="Services in this section" hint="One per line" error={errors[`serviceGroups.${i}.items`]}>
            <TextArea value={row.items} rows={3} placeholder={"Floral mandap | Included in rent\nStage lighting | Extra (billed separately)"} onChange={(e) => update(i, { items: e.target.value })} />
          </Field>
        </div>
      ))}
      {rows.length < MAX_SERVICE_GROUPS ? (
        <Button variant="secondary" className="self-start" onClick={() => onChange([...rows, { title: "", items: "" }])}>
          <Plus className="size-4" aria-hidden /> Add section
        </Button>
      ) : (
        <p className="text-xs text-zinc-500">Up to {MAX_SERVICE_GROUPS} sections.</p>
      )}
    </div>
  );
}
