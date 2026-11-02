"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { authLinkClass, inputClass, labelClass, submitClass, wellClass } from "@/components/admin/auth-page";
import { adminClient, RequestError } from "@/lib/admin-client";

export function ForgotForm({ minutes }: { minutes: number }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      await adminClient.post("/auth/forgot-password", { email: form.get("email") });
      setSent(true);
    } catch (err) {
      if (err instanceof RequestError && err.status === 429) setError("Too many attempts. Please wait a minute and try again.");
      else if (err instanceof RequestError && err.status === 400) setError("Enter a valid email address.");
      else setError(err instanceof RequestError ? err.message : "Could not send the link. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const back = (
    <p className="mt-2 text-center">
      <Link href="/admin/login" className={authLinkClass}>
        ← Back to login
      </Link>
    </p>
  );

  // The same message for any address, so this page never reveals who is an admin.
  if (sent) {
    return (
      <div role="status">
        <p className="mb-3 rounded-xl bg-[#EEF0FF] px-4 py-3 text-sm font-medium">
          If that email belongs to an admin, a reset link is on its way. It works for {minutes} minutes, so check your inbox and spam folder.
        </p>
        {back}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="mb-5">
        <label htmlFor="forgot-email" className={labelClass}>
          Email Address
        </label>
        <div className={wellClass}>
          <Mail className="size-[18px] shrink-0" strokeWidth={1.8} aria-hidden />
          <input id="forgot-email" name="email" type="email" required autoFocus autoComplete="username" inputMode="email" placeholder="admin@noidasuperbazaar.com" className={inputClass} />
        </div>
      </div>

      <button type="submit" disabled={pending} className={submitClass}>
        {pending && <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />}
        {pending ? "Sending" : "Send reset link"}
      </button>

      <p role="status" aria-live="polite" className="mt-3 min-h-[18px] text-center text-[13px] font-semibold text-[#DF0709]">
        {error}
      </p>
      {back}
    </form>
  );
}
