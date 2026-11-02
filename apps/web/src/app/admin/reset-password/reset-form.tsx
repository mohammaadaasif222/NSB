"use client";

import { Lock } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { authLinkClass, inputClass, labelClass, submitClass, wellClass } from "@/components/admin/auth-page";
import { adminClient, RequestError } from "@/lib/admin-client";

const fieldErrorClass = "mt-1.5 text-[13px] font-semibold text-[#DF0709]";

export function ResetForm({ token }: { token: string }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      await adminClient.post("/auth/reset-password", { token, newPassword: form.get("newPassword"), confirmPassword: form.get("confirmPassword") });
      setDone(true);
    } catch (err) {
      if (err instanceof RequestError && err.status === 429) setErrors({ form: "Too many attempts. Please wait a minute and try again." });
      else if (err instanceof RequestError && err.issues.length) setErrors(err.fieldErrors);
      else setErrors({ form: err instanceof RequestError ? err.message : "Could not reset your password. Please try again." });
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div role="status">
        <p className="mb-4 rounded-xl bg-[#EEF0FF] px-4 py-3 text-sm font-medium">Your password has been changed, and every device has been signed out.</p>
        <Link href="/admin/login" className={submitClass}>
          Go to login
        </Link>
      </div>
    );
  }

  const field = (name: string, label: string, autoFocus = false) => (
    <div className="mb-4">
      <label htmlFor={`reset-${name}`} className={labelClass}>
        {label}
      </label>
      <div className={wellClass}>
        <Lock className="size-[18px] shrink-0" strokeWidth={1.8} aria-hidden />
        <input
          id={`reset-${name}`}
          name={name}
          type={showPassword ? "text" : "password"}
          required
          autoFocus={autoFocus}
          autoComplete="new-password"
          aria-invalid={errors[name] ? true : undefined}
          aria-describedby={errors[name] ? `reset-${name}-error` : undefined}
          className={inputClass}
        />
        <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide passwords" : "Show passwords"} className="px-0.5 py-1.5 text-xs font-bold text-[#1700D6]">
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
      {errors[name] && (
        <p id={`reset-${name}-error`} className={fieldErrorClass}>
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate>
      {field("newPassword", "New password", true)}
      {field("confirmPassword", "Confirm new password")}

      <button type="submit" disabled={pending} className={`${submitClass} mt-1`}>
        {pending && <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />}
        {pending ? "Saving" : "Set new password"}
      </button>

      {(errors.token || errors.form) && (
        <p role="alert" className={`${fieldErrorClass} text-center`}>
          {errors.token ?? errors.form}
        </p>
      )}
      {errors.token && (
        <p className="mt-2 text-center">
          <Link href="/admin/forgot-password" className={authLinkClass}>
            Request a new link
          </Link>
        </p>
      )}
    </form>
  );
}
