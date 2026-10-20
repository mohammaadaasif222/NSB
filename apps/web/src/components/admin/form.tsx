"use client";

import {
  type ButtonHTMLAttributes,
  createContext,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  useContext,
  useId,
  useState,
} from "react";
import { Eye, EyeOff } from "lucide-react";

export const inputClass =
  "w-full rounded-[10px] border-[1.5px] border-zinc-300 bg-zinc-50 px-3 py-2.5 text-base text-zinc-900 outline-none transition-[border-color,box-shadow] sm:text-sm focus:border-zinc-900 focus:bg-white focus:ring-[3px] focus:ring-[#eef0ff] disabled:opacity-70 aria-[invalid=true]:border-red-500";

/** Ids that a Field hands to the control inside it, so the label and hint are linked by id. */
const FieldContext = createContext<{ id: string; describedBy?: string; invalid: boolean } | null>(null);

/** Label, control, hint and error for one form field. */
export function Field({
  label,
  hint,
  error,
  children,
  className = "",
  hideLabel = false,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
  /** Keep the label for screen readers only, e.g. in a row where the context makes it obvious. */
  hideLabel?: boolean;
}) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`flex flex-col gap-1.5 text-[13px] font-semibold text-zinc-900 ${className}`}>
      <label htmlFor={id} className={hideLabel ? "sr-only" : undefined}>
        {label}
      </label>
      <FieldContext.Provider value={{ id, describedBy, invalid: !!error }}>{children}</FieldContext.Provider>
      {hint && (
        <span id={`${id}-hint`} className="text-xs font-normal text-zinc-500">
          {hint}
        </span>
      )}
      {error && (
        <span id={`${id}-error`} className="text-xs font-normal text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}

/** id, aria-describedby and aria-invalid from the surrounding Field, unless set directly. */
function useFieldProps(invalid: boolean | undefined) {
  const field = useContext(FieldContext);
  return {
    id: field?.id,
    "aria-describedby": field?.describedBy,
    "aria-invalid": invalid || field?.invalid || undefined,
  };
}

export function TextInput({ invalid, className = "", ...props }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input {...useFieldProps(invalid)} {...props} className={`${inputClass} ${className}`} />;
}

/**
 * Text inside an input's edge, e.g. "₹" before a price or "guests" after a number. Give the
 * input room for it: pl-10 for `before`, pr-24 for `after`.
 */
export function Affix({ before, after, children }: { before?: string; after?: string; children: ReactNode }) {
  return (
    <div className="relative">
      {before && <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-zinc-500">{before}</span>}
      {children}
      {after && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-zinc-500">{after}</span>}
    </div>
  );
}

/** Password field with a button that shows or hides what was typed. */
export function PasswordInput({ invalid, className = "", ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { invalid?: boolean }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input {...useFieldProps(invalid)} {...props} type={visible ? "text" : "password"} className={`${inputClass} pr-10 ${className}`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        title={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-zinc-500 hover:text-zinc-900 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-zinc-900"
      >
        {visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
      </button>
    </div>
  );
}

export function TextArea({ invalid, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return <textarea rows={3} {...useFieldProps(invalid)} {...props} className={inputClass} />;
}

export function Select({ invalid, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return <select {...useFieldProps(invalid)} {...props} className={inputClass} />;
}

/** On/off switch. Used inline in tables (with `label` as the accessible name) and in forms. */
export function Toggle({
  checked,
  onChange,
  label,
  showLabel = false,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  showLabel?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-zinc-700 has-disabled:cursor-not-allowed has-disabled:opacity-60">
      <input
        type="checkbox"
        role="switch"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={showLabel ? undefined : label}
      />
      <span
        aria-hidden
        className="relative h-5 w-9 rounded-full bg-zinc-300 transition-colors peer-checked:bg-[#1700d6] peer-focus-visible:ring-2 peer-focus-visible:ring-zinc-900 peer-focus-visible:ring-offset-1 after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4"
      />
      {showLabel && label}
    </label>
  );
}

const variants = {
  primary: "border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800",
  secondary: "border border-zinc-300 bg-white text-zinc-900 hover:border-zinc-400 hover:text-[#1700d6]",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
  "danger-ghost": "text-red-600 hover:bg-red-50",
};

export function Button({
  variant = "primary",
  pending,
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants; pending?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || pending}
      aria-busy={pending || undefined}
      className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

/** Small square icon button for row actions. */
export function IconButton({
  label,
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...props}
      className={`rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-[#1700d6] disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

/** Lowercase, hyphenated slug from a name, e.g. "Makeup & Beauty" → "makeup-beauty". */
export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
