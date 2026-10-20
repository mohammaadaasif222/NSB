"use client";

import { CalendarDays, CheckCircle2, ChevronDown, MessageCircle } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import type { ApiErrorBody, QuickInfoItem } from "@nsb/shared";
import { ServiceIcon } from "./service-icon";

type Field = "name" | "mobile" | "email" | "preferredDate" | "budget" | "message" | "eventType";
type Errors = Partial<Record<Field | "form", string>>;

const todayInIndia = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

const inputClass =
  "w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2.5 text-base text-ink sm:text-sm outline-none placeholder:text-muted focus:border-brand aria-[invalid=true]:border-red-500";

/** Fields only the second step needs; a server error on one of them opens that step. */
const DETAIL_FIELDS: Field[] = ["name", "mobile", "email", "budget", "message"];

/**
 * Enquiry card on the vendor page, laid out after the ezweddingz booking card: the vendor's
 * headline price and key facts, event type and date, then a large "Enquire now" button that opens
 * the contact fields, with WhatsApp beside it. Saved as a lead tagged with this listing (roadmap 4.5).
 */
export function EnquiryCard({
  listingId,
  vendorName,
  keyInfo,
  eventTypes,
  whatsappHref,
}: {
  listingId: string;
  vendorName: string;
  keyInfo: QuickInfoItem[];
  /** Event type choices for this vertical; none hides the field. */
  eventTypes: readonly string[];
  whatsappHref: string | null;
}) {
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(false);

  // The phone "Enquire Now" bar links to #enquire: open the contact fields when it is used.
  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === "#enquire") setOpen(true);
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const [price, ...facts] = keyInfo;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!open) {
      setOpen(true);
      return;
    }
    const formEl = event.currentTarget;
    const data = Object.fromEntries(new FormData(formEl)) as Record<Field, string>;
    setErrors({});
    setPending(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, budget: data.budget || undefined, email: data.email || undefined, eventType: data.eventType || undefined, listingId }),
      });
      if (res.ok) {
        formEl.reset();
        setSent(true);
        setOpen(false);
        return;
      }
      const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
      const fieldErrors: Errors = {};
      for (const issue of body?.issues ?? []) fieldErrors[issue.path as Field] ??= issue.message;
      if (!body?.issues?.length) {
        fieldErrors.form = res.status === 429 ? "Too many enquiries. Please try again shortly." : "Something went wrong. Please try again.";
      }
      setErrors(fieldErrors);
      if (DETAIL_FIELDS.some((f) => fieldErrors[f])) setOpen(true);
    } catch {
      setErrors({ form: "Could not send your enquiry. Check your connection and try again." });
    } finally {
      setPending(false);
    }
  }

  const field = (name: Field) => ({
    name,
    id: `enquiry-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `enquiry-${name}-error` : undefined,
  });
  const error = (name: Field) =>
    errors[name] && (
      <p id={`enquiry-${name}-error`} className="mt-1 text-xs text-red-600">
        {errors[name]}
      </p>
    );
  const label = (name: Field, text: string, optional = false) => (
    <label htmlFor={`enquiry-${name}`} className="mb-1.5 block text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
      {text}
      {optional && <span className="font-normal tracking-normal normal-case"> (optional)</span>}
    </label>
  );

  const whatsapp = whatsappHref && (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-12 items-center justify-center gap-2 rounded-lg border border-[#25d366] bg-[#25d366]/10 text-[15px] font-semibold text-[#128c7e] transition-colors hover:bg-[#25d366]/20"
    >
      <MessageCircle className="size-[18px]" aria-hidden /> WhatsApp
    </a>
  );

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-[0px_10px_30px_-12px_rgba(0,0,0,0.18)] sm:p-6">
      <h2 className="text-xl leading-snug font-semibold text-ink">{vendorName}</h2>
      {facts.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-x-3.5 gap-y-1 text-xs text-muted">
          {facts.slice(0, 3).map((item) => (
            <li key={item.label} className="flex items-center gap-1">
              <ServiceIcon text={item.label} className="size-3.5 shrink-0 text-ink-soft" strokeWidth={1.75} />
              {item.label} <span className="font-semibold text-ink-soft">{item.value}</span>
            </li>
          ))}
        </ul>
      )}

      {price && (
        <div className="mt-4 border-t border-line pt-4">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">{price.label}</p>
          <p className="mt-0.5 text-[26px] leading-tight font-bold text-ink">{price.value}</p>
        </div>
      )}

      {sent ? (
        <div className="mt-5 flex flex-col items-center gap-3 rounded-xl bg-emerald-50 p-6 text-center" role="status">
          <CheckCircle2 className="size-10 text-emerald-600" aria-hidden />
          <p className="font-semibold text-ink">Enquiry sent!</p>
          <p className="text-sm text-ink-soft">{vendorName} will get in touch with you soon.</p>
          <button type="button" onClick={() => setSent(false)} className="text-sm font-semibold text-brand hover:underline">
            Send another enquiry
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="mt-5 flex flex-col gap-4">
          {eventTypes.length > 0 && (
            <div>
              {label("eventType", "Event type")}
              <div className="relative sm:max-w-[60%]">
                <select {...field("eventType")} defaultValue={eventTypes[0]} className={`${inputClass} appearance-none pr-9`}>
                  {eventTypes.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
              </div>
              {error("eventType")}
            </div>
          )}
          <div>
            {label("preferredDate", "Event date")}
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
              <input {...field("preferredDate")} required type="date" min={todayInIndia()} className={`${inputClass} pl-9`} />
            </div>
            {error("preferredDate")}
          </div>

          {open && (
            <>
              <div>
                {label("name", "Your name")}
                <input {...field("name")} required maxLength={80} autoComplete="name" placeholder="Full name" className={inputClass} autoFocus />
                {error("name")}
              </div>
              <div>
                {label("mobile", "Mobile number")}
                <input {...field("mobile")} required type="tel" inputMode="numeric" autoComplete="tel" placeholder="10-digit mobile number" className={inputClass} />
                {error("mobile")}
              </div>
              <div>
                {label("email", "Email", true)}
                <input {...field("email")} type="email" inputMode="email" autoComplete="email" maxLength={200} placeholder="you@example.com" className={inputClass} />
                {error("email")}
              </div>
              <div>
                {label("budget", "Budget", true)}
                <input {...field("budget")} maxLength={60} placeholder="e.g. ₹5 lakh" className={inputClass} />
                {error("budget")}
              </div>
              <div>
                {label("message", "Requirement")}
                <textarea {...field("message")} required maxLength={1000} rows={3} placeholder="Guests, function, timings…" className={inputClass} />
                {error("message")}
              </div>
            </>
          )}

          {errors.form && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {errors.form}
            </p>
          )}

          {/* Enquire and WhatsApp side by side in one row, as on ezweddingz. */}
          <div className={`grid gap-3 ${whatsapp ? "grid-cols-2" : ""}`}>
            <button
              type="submit"
              disabled={pending}
              className="h-12 rounded-lg bg-brand px-2 text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-brand-dark disabled:opacity-60 sm:text-[15px]"
            >
              {pending ? "Sending…" : open ? "Send enquiry" : "Enquire now"}
            </button>
            {whatsapp}
          </div>
          <p className="text-center text-xs text-muted">Free to enquire · Shared only with this vendor and the NSB team</p>
        </form>
      )}
    </div>
  );
}
