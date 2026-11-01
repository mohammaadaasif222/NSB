"use client";

/** The error summary above a stepped admin form. `shown` are the errors to spell out by path. */
export function StepErrors({
  errors,
  shown,
  labels,
  steps,
}: {
  errors: Record<string, string>;
  shown: [path: string, message: string][];
  labels: readonly string[];
  /** The steps with errors, in the order to name them. */
  steps: number[];
}) {
  if (Object.keys(errors).length === 0) return null;
  return (
    <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
      Please fix the highlighted fields in {steps.map((i) => labels[i]).join(", ")}.
      {shown.map(([path, message]) => (
        <span key={path} className="block text-xs">
          {path}: {message}
        </span>
      ))}
    </div>
  );
}

/** The numbered step buttons of a stepped admin form, marking steps with errors. */
export function StepNav({
  labels,
  step,
  stepsWithErrors,
  goTo,
}: {
  labels: readonly string[];
  step: number;
  stepsWithErrors: number[];
  goTo: (i: number) => void;
}) {
  return (
    <nav className="a-stp" aria-label="Form steps">
      {labels.map((label, i) => (
        <button key={label} type="button" aria-current={i === step ? "step" : undefined} onClick={() => goTo(i)}>
          {i + 1}. {label}
          {stepsWithErrors.includes(i) && <span className="a-stp-err" aria-label="has errors" />}
        </button>
      ))}
    </nav>
  );
}
