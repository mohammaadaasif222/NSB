"use client";

import { Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { adminClient, RequestError } from "@/lib/admin-client";

/** Icon-and-input row from the login design: grey well that turns white with a blue ring on focus. */
const wellClass =
  "flex h-12 items-center gap-2.5 rounded-xl border-[1.5px] border-[#E2E5EE] bg-[#F5F6FA] px-3.5 text-[#64748B] transition-[border-color,box-shadow,background-color] duration-200 focus-within:border-[#1700D6] focus-within:bg-white focus-within:text-[#1700D6] focus-within:shadow-[0_0_0_4px_#EEF0FF]";
const inputClass = "h-full min-w-0 flex-1 bg-transparent text-[15px] font-medium text-[#0F172A] outline-none placeholder:text-[#64748B]/80";
const labelClass = "mb-[7px] block text-[13px] font-semibold";

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
        <label htmlFor="login-password" className={labelClass}>
          Password
        </label>
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

      <button
        type="submit"
        disabled={pending}
        className="flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#1700D6] text-[15px] font-bold text-white transition-[background-color,transform] duration-200 hover:bg-[#12049E] active:scale-[0.99] disabled:cursor-progress disabled:opacity-80"
      >
        {pending && <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />}
        {pending ? "Signing in" : "Login"}
      </button>

      <p role="status" aria-live="polite" className="mt-3 min-h-[18px] text-center text-[13px] font-semibold text-[#DF0709]">
        {error}
      </p>
    </form>
  );
}
