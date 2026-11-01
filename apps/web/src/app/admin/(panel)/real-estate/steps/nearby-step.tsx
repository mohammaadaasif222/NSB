"use client";

import { memo } from "react";
import { Plus } from "lucide-react";
import { ADVERTISER_TYPES, PROJECT_LIMITS } from "@nsb/shared";
import { Button, Field, Select, TextArea, TextInput } from "@/components/admin/form";
import { sameStepProps } from "@/components/admin/use-stepped-form";
import type { Draft, ProjectStepProps } from "../project-draft";

const KEYS = ["nearby", "advertiser"] as const;

export const NearbyStep = memo(function NearbyStep({
  values: d,
  hidden,
  errors,
  edit: { setRow, addRow, removeRow, setAdvertiser },
}: ProjectStepProps<(typeof KEYS)[number]>) {
  const isBroker = d.advertiser.type === "broker";

  return (
    <div hidden={hidden} className="flex flex-col gap-4">
      {d.nearby.map((n, i) => (
        <div key={i} className="a-hc">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Place or landmark" error={errors[`nearby.${i}.name`]}>
              <TextInput value={n.name} maxLength={80} placeholder="e.g. Kidzee School, Sector 148 Metro" onChange={(e) => setRow("nearby", i, { name: e.target.value })} />
            </Field>
            <Field label="Minutes by car" error={errors[`nearby.${i}.minutes`]}>
              <TextInput inputMode="numeric" value={n.minutes} placeholder="6" onChange={(e) => setRow("nearby", i, { minutes: e.target.value })} />
            </Field>
            <Field label="Distance (km)" error={errors[`nearby.${i}.km`]}>
              <TextInput inputMode="decimal" value={n.km} placeholder="2.5" onChange={(e) => setRow("nearby", i, { km: e.target.value })} />
            </Field>
          </div>
          <Button variant="secondary" className="self-start" onClick={() => removeRow("nearby", i)}>
            Remove
          </Button>
        </div>
      ))}
      {d.nearby.length < PROJECT_LIMITS.nearby && (
        <Button variant="secondary" className="self-start" onClick={() => addRow("nearby", { name: "", type: "", minutes: "", km: "" })}>
          <Plus className="size-4" aria-hidden /> Add place
        </Button>
      )}
      <div className="mt-3 flex flex-col gap-1 border-t border-zinc-200 pt-4">
        <h4 className="font-extrabold">Who is advertising this project?</h4>
        <p className="text-[13px] leading-snug text-zinc-500">
          Shown on the project page under “Listed by”. A broker can list many projects, but each project has only one advertiser.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Advertiser type" className="sm:col-span-2">
          <Select value={d.advertiser.type} onChange={(e) => setAdvertiser({ type: e.target.value as Draft["advertiser"]["type"] })}>
            {ADVERTISER_TYPES.map((t) => (
              <option key={t} value={t}>
                {t === "builder" ? "Builder (the builder is advertising)" : "Broker (a broker is advertising)"}
              </option>
            ))}
          </Select>
        </Field>
        {isBroker ? (
          <>
            <Field label="Broker name *" error={errors["advertiser.name"]}>
              <TextInput value={d.advertiser.name} maxLength={120} placeholder="Name of the broker" invalid={!!errors["advertiser.name"]} onChange={(e) => setAdvertiser({ name: e.target.value })} />
            </Field>
            <Field label="Firm or agency" error={errors["advertiser.firm"]}>
              <TextInput value={d.advertiser.firm} maxLength={120} placeholder="e.g. Prime Estates" onChange={(e) => setAdvertiser({ firm: e.target.value })} />
            </Field>
            <Field label="Experience (years)" error={errors["advertiser.experienceYears"]}>
              <TextInput inputMode="numeric" value={d.advertiser.experienceYears} placeholder="8" onChange={(e) => setAdvertiser({ experienceYears: e.target.value })} />
            </Field>
            <Field label="Broker RERA ID" error={errors["advertiser.reraId"]}>
              <TextInput value={d.advertiser.reraId} maxLength={60} placeholder="UPRERAAGT…" onChange={(e) => setAdvertiser({ reraId: e.target.value })} />
            </Field>
          </>
        ) : (
          <>
            <Field label="Established (year)" error={errors["advertiser.established"]}>
              <TextInput inputMode="numeric" value={d.advertiser.established} placeholder="2005" onChange={(e) => setAdvertiser({ established: e.target.value })} />
            </Field>
            <Field label="Projects delivered" error={errors["advertiser.projectsDelivered"]}>
              <TextInput inputMode="numeric" value={d.advertiser.projectsDelivered} placeholder="9" onChange={(e) => setAdvertiser({ projectsDelivered: e.target.value })} />
            </Field>
          </>
        )}
        <Field label={isBroker ? "About the broker" : "About the builder"} error={errors["advertiser.about"]} className="sm:col-span-2">
          <TextArea
            rows={3}
            maxLength={1000}
            value={d.advertiser.about}
            placeholder={isBroker ? "Short description of the broker…" : "Short description of the builder…"}
            onChange={(e) => setAdvertiser({ about: e.target.value })}
          />
        </Field>
      </div>
    </div>
  );
}, sameStepProps(KEYS));
