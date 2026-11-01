"use client";

import { memo } from "react";
import { PROJECT_AMENITIES } from "@nsb/shared";
import { Field, TextArea, TextInput } from "@/components/admin/form";
import { sameStepProps } from "@/components/admin/use-stepped-form";
import type { ProjectStepProps } from "../project-draft";

const KEYS = ["amenities", "otherAmenities", "specifications"] as const;

export const AmenitiesStep = memo(function AmenitiesStep({
  values: d,
  hidden,
  errors,
  edit: { set, setSpec },
}: ProjectStepProps<(typeof KEYS)[number]>) {
  return (
    <div hidden={hidden} className="flex flex-col gap-4">
      <label className="flex w-fit items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          className="size-4"
          checked={d.amenities.length === PROJECT_AMENITIES.length}
          // Part-ticked while only some amenities are chosen.
          ref={(el) => {
            if (el) el.indeterminate = d.amenities.length > 0 && d.amenities.length < PROJECT_AMENITIES.length;
          }}
          onChange={(e) => set("amenities", e.target.checked ? [...PROJECT_AMENITIES] : [])}
        />
        Select all amenities
      </label>
      <fieldset className="a-amg2">
        <legend className="sr-only">Amenities</legend>
        {PROJECT_AMENITIES.map((a) => (
          <label key={a} className="a-am2">
            <input
              type="checkbox"
              checked={d.amenities.includes(a)}
              onChange={() => set("amenities", d.amenities.includes(a) ? d.amenities.filter((x) => x !== a) : [...d.amenities, a])}
            />
            {a}
          </label>
        ))}
      </fieldset>
      <Field label="Other amenities (comma separated)" error={errors.amenities}>
        <TextInput value={d.otherAmenities} placeholder="Rooftop lounge, Pet spa" onChange={(e) => set("otherAmenities", e.target.value)} />
      </Field>
      <h4 className="mt-2 font-extrabold">Specifications</h4>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Flooring" hint="One per line as Label: value" error={errors["specifications.flooring"]}>
          <TextArea rows={4} value={d.specifications.flooring} placeholder={"Living/Dining: Vitrified tiles\nBedrooms: Laminated wooden"} onChange={(e) => setSpec("flooring", e.target.value)} />
        </Field>
        <Field label="Fittings" error={errors["specifications.fittings"]}>
          <TextArea rows={4} value={d.specifications.fittings} placeholder={"Toilets: CP fittings, EWC\nKitchen: Granite platform"} onChange={(e) => setSpec("fittings", e.target.value)} />
        </Field>
        <Field label="Walls" error={errors["specifications.walls"]}>
          <TextArea rows={4} value={d.specifications.walls} placeholder={"Interior: Acrylic emulsion\nExterior: Textured paint"} onChange={(e) => setSpec("walls", e.target.value)} />
        </Field>
      </div>
    </div>
  );
}, sameStepProps(KEYS));
