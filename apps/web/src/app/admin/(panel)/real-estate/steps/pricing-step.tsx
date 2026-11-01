"use client";

import Image from "next/image";
import { memo, useRef } from "react";
import { Loader2, Plus } from "lucide-react";
import { CONFIGURATION_SUGGESTIONS, monthlyEmi, PROJECT_LIMITS } from "@nsb/shared";
import { Affix, Button, Field, TextInput } from "@/components/admin/form";
import { useUploader } from "@/components/admin/image-upload";
import { sameStepProps } from "@/components/admin/use-stepped-form";
import { type ConfigDraft, digits, emptyConfig, priceText, type ProjectStepProps } from "../project-draft";

const KEYS = ["configurations"] as const;

/** A floor plan image: upload, replace or remove. */
function PlanBox({
  label,
  url,
  onChange,
  onUploaded,
  maxBytes,
}: {
  label: string;
  url: string | null;
  onChange: (url: string | null) => void;
  onUploaded: (url: string) => void;
  maxBytes: number;
}) {
  const input = useRef<HTMLInputElement>(null);
  const { upload, pending, error } = useUploader("floor-plan", maxBytes, onUploaded);
  return (
    <div className="a-pbx">
      <div className="a-pth2">{url ? <Image src={url} alt="" fill unoptimized sizes="84px" /> : pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : "No image"}</div>
      <div className="min-w-0">
        <b className="text-sm">{label}</b>
        <div className="mt-1.5 flex gap-1.5">
          <Button variant="secondary" className="px-3! py-1! text-xs!" disabled={pending} onClick={() => input.current?.click()}>
            {url ? "Replace" : "Upload"}
          </Button>
          {url && (
            <Button variant="secondary" className="px-3! py-1! text-xs!" disabled={pending} onClick={() => onChange(null)}>
              Remove
            </Button>
          )}
        </div>
        {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label={`Upload ${label}`}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          const uploaded = await upload(file);
          if (uploaded) onChange(uploaded);
        }}
      />
    </div>
  );
}

/** What the project page will show, from the priced configurations. */
function PricingNote({ configurations }: { configurations: ConfigDraft[] }) {
  const priced = configurations.map((c) => ({ price: Number(digits(c.price)), superArea: Number(digits(c.superArea)) })).filter((c) => c.price > 0);
  if (!priced.length) return <p className="a-info text-sm">Add a price to see the range, rate and EMI.</p>;
  const min = Math.min(...priced.map((c) => c.price));
  const max = Math.max(...priced.map((c) => c.price));
  const rates = priced.filter((c) => c.superArea > 0).map((c) => c.price / c.superArea);
  return (
    <p className="a-info text-sm">
      The page will show: {priceText(min)}
      {max > min && ` – ${priceText(max)}`}
      {rates.length > 0 && ` · ₹${(rates.reduce((a, b) => a + b, 0) / rates.length / 1000).toFixed(1)}K/sq.ft avg`} · EMI from about ₹{Math.round(monthlyEmi(min) / 1000)}K
    </p>
  );
}

export const PricingStep = memo(function PricingStep({
  values: d,
  hidden,
  errors,
  edit: { setRow, addRow, removeRow },
  trackUpload,
  maxUploadBytes,
}: ProjectStepProps<(typeof KEYS)[number]> & { trackUpload: (url: string) => void; maxUploadBytes: number }) {
  return (
    <div hidden={hidden} className="flex flex-col gap-4">
      <p className="text-sm text-zinc-500">Add every configuration. The page shows the price range, rate per sq ft and EMI automatically.</p>
      {errors.configurations && <p className="text-sm text-red-600">{errors.configurations}</p>}
      {d.configurations.map((c, i) => (
        <div key={i} className="a-hc">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Configuration" error={errors[`configurations.${i}.title`]}>
              <TextInput list="config-suggestions" value={c.title} maxLength={40} placeholder="3 BHK" onChange={(e) => setRow("configurations", i, { title: e.target.value })} />
            </Field>
            <Field label="Price (₹)" hint={Number(digits(c.price)) > 0 ? priceText(Number(digits(c.price))) : undefined} error={errors[`configurations.${i}.price`]}>
              <Affix before="₹">
                <TextInput inputMode="numeric" className="pl-8" value={c.price} placeholder="12500000" onChange={(e) => setRow("configurations", i, { price: e.target.value })} />
              </Affix>
            </Field>
            <Field label="Super area (sq ft)" error={errors[`configurations.${i}.superArea`]}>
              <TextInput inputMode="numeric" value={c.superArea} placeholder="1450" onChange={(e) => setRow("configurations", i, { superArea: e.target.value })} />
            </Field>
            <Field label="Carpet area (sq ft)" error={errors[`configurations.${i}.carpetArea`]}>
              <TextInput inputMode="numeric" value={c.carpetArea} placeholder="1080" onChange={(e) => setRow("configurations", i, { carpetArea: e.target.value })} />
            </Field>
          </div>
          <div className="a-pgrid">
            <PlanBox label="2D floor plan" url={c.plan2dUrl} onChange={(url) => setRow("configurations", i, { plan2dUrl: url })} onUploaded={trackUpload} maxBytes={maxUploadBytes} />
            <PlanBox label="3D floor plan" url={c.plan3dUrl} onChange={(url) => setRow("configurations", i, { plan3dUrl: url })} onUploaded={trackUpload} maxBytes={maxUploadBytes} />
          </div>
          {d.configurations.length > 1 && (
            <Button variant="secondary" className="self-start" onClick={() => removeRow("configurations", i)}>
              Remove this configuration
            </Button>
          )}
        </div>
      ))}
      <datalist id="config-suggestions">
        {CONFIGURATION_SUGGESTIONS.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      {d.configurations.length < PROJECT_LIMITS.configurations && (
        <Button variant="secondary" className="self-start" onClick={() => addRow("configurations", emptyConfig())}>
          <Plus className="size-4" aria-hidden /> Add configuration
        </Button>
      )}
      <PricingNote configurations={d.configurations} />
    </div>
  );
}, sameStepProps(KEYS));
