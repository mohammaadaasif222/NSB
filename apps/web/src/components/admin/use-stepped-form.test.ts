import { describe, expect, it } from "vitest";
import { sameStepProps } from "./use-stepped-form";

describe("sameStepProps", () => {
  const same = sameStepProps(["name"]);
  const errors = {};
  const props = (values: object, stepErrors: object = errors) => ({ values, errors: stepErrors });

  it("ignores changes to values the step does not read", () => {
    expect(same(props({ name: "a", about: "x" }), props({ name: "a", about: "y" }))).toBe(true);
  });

  it("sees changes to the keys it was given", () => {
    expect(same(props({ name: "a" }), props({ name: "b" }))).toBe(false);
  });

  it("sees changes to any other prop", () => {
    expect(same(props({ name: "a" }), props({ name: "a" }, {}))).toBe(false);
  });
});
