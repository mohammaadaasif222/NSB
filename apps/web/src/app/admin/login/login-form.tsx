"use client";

import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { authLinkClass, inputClass, labelClass, submitClass, wellClass } from "@/components/admin/auth-page";
import { adminClient, RequestError } from "@/lib/admin-client";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      await adminClient.login(String(form.get("email")), String(form.get("password")));
      router.replace(next);
      router.refresh();
    } catch (err) {
      const message = err instanceof RequestError ? err.message : "Sign in failed";
      // A locked account says how long to wait; the per-minute rate limit does not.
      setError(err instanceof RequestError && err.status === 429 && !message.startsWith("Too many wrong passwords") ? "Too many attempts. Please wait a minute and try again." : message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="mb-4 [@media(max-height:700px)]:mb-3">
        <label htmlFor="login-email" className={labelClass}>
          Email Address
        </label>
        <div className={wellClass}>
          <Mail className="size-[18px] shrink-0" strokeWidth={1.8} aria-hidden />
          <input
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="username"
            inputMode="email"
            placeholder="admin@noidasuperbazaar.com"
            className={inputClass}
          />
        </div>
      </div>
      <div className="mb-5">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="login-password" className={labelClass}>
            Password
          </label>
          <Link href="/admin/forgot-password" className={authLinkClass}>
            Forgot password?
          </Link>
        </div>
        <div className={wellClass}>
          <Lock className="size-[18px] shrink-0" strokeWidth={1.8} aria-hidden />
          <input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="px-0.5 py-1.5 text-xs font-bold text-[#1700D6]"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <button type="submit" disabled={pending} className={submitClass}>
        {pending && <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />}
        {pending ? "Signing in" : "Login"}
      </button>

      <p role="status" aria-live="polite" className="mt-3 min-h-[18px] text-center text-[13px] font-semibold text-[#DF0709]">
        {error}
      </p>
    </form>
  );
}
