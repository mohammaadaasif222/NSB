"use client";

import { type KeyboardEvent, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button, TextInput } from "./form";

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/**
 * Tags as toggle chips: suggested tags in named groups, plus custom tags typed in. Matching
 * ignores case, so "luxury" and "Luxury" are one tag.
 */
export function TagPicker({
  value,
  onChange,
  groups,
  max,
  error,
  hint = "Tags under a heading are the filters visitors click on this category's page.",
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  groups: { title: string; tags: string[] }[];
  max: number;
  error?: string;
  /** Shown after the tag count. */
  hint?: string;
}) {
  const [draft, setDraft] = useState("");
  const has = (tag: string) => value.some((t) => same(t, tag));
  const full = value.length >= max;
  const toggle = (tag: string) => onChange(has(tag) ? value.filter((t) => !same(t, tag)) : full ? value : [...value, tag]);
  const suggested = groups.flatMap((g) => g.tags);
  const custom = value.filter((t) => !suggested.some((s) => same(s, t)));

  const add = () => {
    const tag = draft.trim().slice(0, 40);
    if (!tag || has(tag) || full) return;
    onChange([...value, tag]);
    setDraft("");
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Enter adds the tag instead of moving the form on.
      add();
    }
  };

  const chip = (tag: string, on: boolean) => (
    <button
      key={tag}
      type="button"
      aria-pressed={on}
      disabled={!on && full}
      onClick={() => toggle(tag)}
      // Colors by state, not aria-pressed: variants: admin.css remaps bg-white and the zinc colors
      // outside Tailwind's layers, so those would win over the pressed colors.
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
        on ? "border-[#1700d6] bg-[#1700d6] text-white" : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400"
      }`}
    >
      {tag}
      {on && !suggested.some((s) => same(s, tag)) && <X className="size-3" aria-hidden />}
    </button>
  );

  return (
    <div className="flex flex-col gap-3">
      {groups.map((g) => (
        <div key={g.title} className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-zinc-500">{g.title}</span>
          <div className="flex flex-wrap gap-1.5">{g.tags.map((t) => chip(t, has(t)))}</div>
        </div>
      ))}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-zinc-500">Other tags</span>
        {custom.length > 0 && <div className="flex flex-wrap gap-1.5">{custom.map((t) => chip(t, true))}</div>}
        <div className="flex gap-2">
          <TextInput
            aria-label="New tag"
            value={draft}
            maxLength={40}
            placeholder="e.g. Rooftop, Pure veg"
            disabled={full}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
          />
          <Button variant="secondary" onClick={add} disabled={!draft.trim() || full}>
            <Plus className="size-4" aria-hidden /> Add
          </Button>
        </div>
      </div>
      <span className={`text-xs ${error ? "text-red-600" : "text-zinc-500"}`}>
        {error ?? `${value.length} of ${max} tags. ${hint}`}
      </span>
    </div>
  );
}
