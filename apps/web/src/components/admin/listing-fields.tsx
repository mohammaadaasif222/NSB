"use client";

import { useState, type ReactNode } from "react";
import type { ListingDetails, ListingField } from "@nsb/shared";
import { Affix, Button, Field, Select, TextInput, Toggle } from "./form";

/**
 * Renders a structured listing form from its field definitions (LISTING_FORMS in @nsb/shared),
 * so every category and sub-category form is the same few controls.
 */

/** Form state: what the inputs hold. Numbers stay text while typing. */
export type DetailsDraft = Record<string, string | boolean | string[]>;

export function draftFromDetails(details: ListingDetails): DetailsDraft {
  return Object.fromEntries(Object.entries(details).map(([key, value]) => [key, typeof value === "number" ? String(value) : value]));
}

/** The answers to save: only this form's fields, blanks left out, numbers as numbers. */
export function detailsFromDraft(fields: readonly ListingField[], draft: DetailsDraft): ListingDetails {
  const details: ListingDetails = {};
  for (const field of fields) {
    const value = draft[field.key];
    if (value === undefined || value === false || value === "" || (Array.isArray(value) && value.length === 0)) continue;
    if (field.type === "number" || field.type === "price") {
      const n = Number(value);
      if (typeof value === "string" && value.trim() !== "" && Number.isFinite(n)) details[field.key] = n;
    } else {
      details[field.key] = typeof value === "string" ? value.trim() : value;
    }
  }
  return details;
}

/** A titled block of the listing form, with an optional tag saying who it applies to. */
export function FormSection({ title, tag, children }: { title: string; tag?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-extrabold text-zinc-900">{title}</h2>
        {tag && <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">{tag}</span>}
      </div>
      {children}
    </section>
  );
}

/** One section of structured fields; switches are grouped at the end. */
export function DetailsSection({
  title,
  tag,
  fields,
  draft,
  errors,
  onChange,
}: {
  title: string;
  tag: string;
  fields: readonly ListingField[];
  draft: DetailsDraft;
  /** API errors keyed by path, e.g. "details.maxGuests". */
  errors: Record<string, string>;
  onChange: (key: string, value: DetailsDraft[string]) => void;
}) {
  if (fields.length === 0) return null;
  const switches = fields.filter((f) => f.type === "bool");
  return (
    <FormSection title={title} tag={tag}>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields
          .filter((f) => f.type !== "bool")
          .map((field) => (
            <DetailField key={field.key} field={field} value={draft[field.key]} error={errorFor(errors, field.key)} onChange={(v) => onChange(field.key, v)} />
          ))}
      </div>
      {switches.length > 0 && (
        <div className="flex flex-wrap gap-x-6 gap-y-3 border-t border-zinc-100 pt-4">
          {switches.map((field) => (
            <Toggle key={field.key} label={field.label} showLabel checked={draft[field.key] === true} onChange={(v) => onChange(field.key, v)} />
          ))}
        </div>
      )}
    </FormSection>
  );
}

/** The error for a field, including ones on a single choice of a multi-select ("details.cuisines.0"). */
function errorFor(errors: Record<string, string>, key: string) {
  const path = `details.${key}`;
  return errors[path] ?? Object.entries(errors).find(([p]) => p.startsWith(`${path}.`))?.[1];
}

const label = (field: ListingField) => (field.required ? `${field.label} *` : field.label);

function DetailField({
  field,
  value,
  error,
  onChange,
}: {
  field: Exclude<ListingField, { type: "bool" }>;
  value: DetailsDraft[string] | undefined;
  error?: string;
  onChange: (value: DetailsDraft[string]) => void;
}) {
  const text = typeof value === "string" ? value : "";
  switch (field.type) {
    case "text":
      return (
        <Field label={label(field)} error={error}>
          <TextInput value={text} placeholder={field.placeholder} maxLength={200} invalid={!!error} onChange={(e) => onChange(e.target.value)} />
        </Field>
      );
    case "number":
    case "price": {
      const before = field.type === "price" ? "₹" : undefined;
      const after = field.type === "price" ? field.suffix : field.unit;
      return (
        <Field label={label(field)} error={error}>
          <Affix before={before} after={after}>
            <TextInput
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={text}
              placeholder={field.type === "price" ? "e.g. 85000" : undefined}
              invalid={!!error}
              className={`${before ? "pl-8" : ""} ${after ? "pr-24" : ""}`}
              onChange={(e) => onChange(e.target.value)}
            />
          </Affix>
        </Field>
      );
    }
    case "select":
      return (
        <Field label={label(field)} error={error}>
          <Select value={text} invalid={!!error} onChange={(e) => onChange(e.target.value)}>
            <option value="">Choose…</option>
            {field.options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
        </Field>
      );
    case "multi":
      return <MultiField field={field} chosen={Array.isArray(value) ? value : []} error={error} onChange={onChange} />;
  }
}

const chip = "rounded-full border px-3 py-1.5 text-sm select-none";
const chipOn = "border-zinc-900 bg-zinc-900 text-white";

/** Chips to tick, plus a box to add one that is not listed. An added chip is ticked straight away. */
function MultiField({
  field,
  chosen,
  error,
  onChange,
}: {
  field: Extract<ListingField, { type: "multi" }>;
  chosen: string[];
  error?: string;
  onChange: (value: string[]) => void;
}) {
  const [extra, setExtra] = useState("");
  const predefined = field.options;
  const custom = chosen.filter((o) => !predefined.includes(o));
  const toggle = (option: string) => onChange(chosen.includes(option) ? chosen.filter((o) => o !== option) : [...chosen, option]);
  const addExtra = () => {
    const typed = extra.trim();
    setExtra("");
    if (!typed) return;
    // Typing a listed option ("mac") ticks that chip rather than adding a near-duplicate.
    const same = (o: string) => o.toLowerCase() === typed.toLowerCase();
    const option = predefined.find(same) ?? chosen.find(same) ?? typed;
    if (!chosen.includes(option)) onChange([...chosen, option]);
  };
  return (
    <fieldset className="flex flex-col gap-2 sm:col-span-2" aria-invalid={!!error || undefined}>
      <legend className="mb-1 text-sm font-medium text-zinc-700">
        {label(field)} <span className="text-xs font-normal text-zinc-500">Pick all that apply, or add your own</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {predefined.map((option) => (
          <label
            key={option}
            className={`${chip} cursor-pointer border-zinc-300 text-zinc-700 has-checked:border-zinc-900 has-checked:bg-zinc-900 has-checked:text-white has-focus-visible:ring-2 has-focus-visible:ring-zinc-900 has-focus-visible:ring-offset-1`}
          >
            <input type="checkbox" className="sr-only" checked={chosen.includes(option)} onChange={() => toggle(option)} />
            {option}
          </label>
        ))}
        {custom.map((option) => (
          <span key={option} className={`${chip} ${chipOn} inline-flex items-center gap-1.5`}>
            {option}
            <button
              type="button"
              aria-label={`Remove ${option}`}
              onClick={() => toggle(option)}
              className="rounded-full leading-none text-zinc-300 hover:text-white"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <TextInput
          value={extra}
          placeholder="Not listed? Type it and press Enter"
          maxLength={120}
          invalid={!!error}
          onChange={(e) => setExtra(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault(); // Enter would otherwise submit the whole listing form.
            addExtra();
          }}
        />
        <Button variant="secondary" onClick={addExtra} disabled={!extra.trim()}>
          Add
        </Button>
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </fieldset>
  );
}
