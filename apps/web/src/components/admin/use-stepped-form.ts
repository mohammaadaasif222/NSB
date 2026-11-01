"use client";

import { useCallback, useState } from "react";

export const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

/**
 * A long admin form split into steps: which step is shown, and the field errors from the last save.
 * `stepOfError` names the step holding the field an error belongs to.
 */
export function useSteppedForm(stepCount: number, stepOfError: (path: string) => number) {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const goTo = useCallback(
    (i: number) => {
      setStep(Math.max(0, Math.min(stepCount - 1, i)));
      scrollToTop();
    },
    [stepCount],
  );

  /** Shows these errors and moves to the first step that has one. */
  const showErrors = useCallback(
    (next: Record<string, string>) => {
      setErrors(next);
      if (Object.keys(next).length) goTo(Math.min(...Object.keys(next).map(stepOfError)));
    },
    [goTo, stepOfError],
  );

  const stepsWithErrors = [...new Set(Object.keys(errors).map(stepOfError))];

  return { step, goTo, errors, setErrors, showErrors, stepsWithErrors };
}

const sameKeys = (a: object, b: object, keys: readonly string[]) => keys.every((key) => Object.is(a[key as keyof typeof a], b[key as keyof typeof b]));

/**
 * memo() comparison for a step given the whole form state as `values`: it re-renders only when one
 * of `keys` or another prop changes, so typing in one step leaves the others alone. List every key
 * in the step's `Pick` of `values`, which keeps the step from reading a key this does not compare.
 */
export const sameStepProps = (keys: readonly string[]) => (a: { values: object }, b: { values: object }) =>
  sameKeys(a, b, Object.keys(a).filter((key) => key !== "values")) && sameKeys(a.values, b.values, keys);
