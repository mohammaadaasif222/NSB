"use client";

import { memo } from "react";
import { LISTING_AREAS, POSSESSION_STATUSES, PROJECT_LIMITS, PROJECT_TAG_SUGGESTIONS, PROJECT_TYPE_LABELS, PROJECT_TYPES, type ProjectDuplicate } from "@nsb/shared";
import { Field, Select, TextInput, Toggle } from "@/components/admin/form";
import { TagPicker } from "@/components/admin/tag-picker";
import { sameStepProps } from "@/components/admin/use-stepped-form";
import type { Draft, ProjectStepProps } from "../project-draft";

const KEYS = ["type", "area", "name", "builder", "locality", "reraId", "possessionStatus", "possessionDate", "launchDate", "isPremium", "isFeatured", "tags"] as const;

export const BasicsStep = memo(function BasicsStep({
  values: d,
  hidden,
  errors,
  edit: { set },
  duplicate,
}: ProjectStepProps<(typeof KEYS)[number]> & { duplicate: ProjectDuplicate | null }) {
  return (
    <div hidden={hidden} className="grid gap-4 sm:grid-cols-2">
      {duplicate && (
        <p className="a-info e text-sm sm:col-span-2" role="alert">
          <b>Already listed.</b> {duplicate.name} in {duplicate.area} is listed by {duplicate.advertiserName} ({duplicate.status}). One project can have
          only one listing.
        </p>
      )}
      <Field label="Property type" error={errors.type}>
        <Select value={d.type} onChange={(e) => set("type", e.target.value as Draft["type"])}>
          {PROJECT_TYPES.map((t) => (
            <option key={t} value={t}>
              {PROJECT_TYPE_LABELS[t]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Location" error={errors.area}>
        <Select value={d.area} onChange={(e) => set("area", e.target.value as Draft["area"])}>
          {LISTING_AREAS.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </Select>
      </Field>
      <Field label="Project name *" hint="One project can be listed only once on NSB." error={errors.name}>
        <TextInput value={d.name} maxLength={120} placeholder="e.g. Skyline Heights" invalid={!!errors.name || !!duplicate} onChange={(e) => set("name", e.target.value)} />
      </Field>
      <Field label="Builder name *" error={errors.builder}>
        <TextInput value={d.builder} maxLength={120} placeholder="The builder of this project" invalid={!!errors.builder} onChange={(e) => set("builder", e.target.value)} />
      </Field>
      <Field label="Sector / address *" error={errors.locality}>
        <TextInput value={d.locality} maxLength={120} placeholder="e.g. Sector 150" invalid={!!errors.locality} onChange={(e) => set("locality", e.target.value)} />
      </Field>
      <Field label="RERA ID" error={errors.reraId}>
        <TextInput value={d.reraId} maxLength={60} placeholder="UPRERAPRJ…" onChange={(e) => set("reraId", e.target.value)} />
      </Field>
      <Field label="Possession status" error={errors.possessionStatus}>
        <Select value={d.possessionStatus} onChange={(e) => set("possessionStatus", e.target.value as Draft["possessionStatus"])}>
          {POSSESSION_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
      </Field>
      <Field label="Possession date" error={errors.possessionDate}>
        <TextInput value={d.possessionDate} maxLength={40} placeholder="e.g. Dec 2028" onChange={(e) => set("possessionDate", e.target.value)} />
      </Field>
      <Field label="Launch date" error={errors.launchDate}>
        <TextInput value={d.launchDate} maxLength={40} placeholder="e.g. Jan 2025" onChange={(e) => set("launchDate", e.target.value)} />
      </Field>
      <div className="flex flex-col gap-2 text-[13px] font-semibold">
        Listing page
        <Toggle label="Show as Premium (top of the listing page)" showLabel checked={d.isPremium} onChange={(v) => set("isPremium", v)} />
        <Toggle label="Show Featured badge (any number of projects)" showLabel checked={d.isFeatured} onChange={(v) => set("isFeatured", v)} />
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <span className="text-[13px] font-semibold">Tags</span>
        <TagPicker
          value={d.tags}
          onChange={(tags) => set("tags", tags)}
          groups={[{ title: "Suggested", tags: [...PROJECT_TAG_SUGGESTIONS] }]}
          max={PROJECT_LIMITS.tags}
          error={errors.tags}
          hint="Visitors find this project by searching any of its tags."
        />
      </div>
    </div>
  );
}, sameStepProps(KEYS));
