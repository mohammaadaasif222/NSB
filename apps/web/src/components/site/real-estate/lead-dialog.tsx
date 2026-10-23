"use client";

import { createContext, type FormEvent, type ReactNode, useContext, useEffect, useId, useRef, useState } from "react";
import { type ApiErrorBody, BUY_WITHIN, type ProjectEnquiryResult, type ProjectLeadSource } from "@nsb/shared";

/** Who the visitor wants to reach, and which button they pressed. */
export interface LeadTarget {
  /** Omit for "Get a callback" from the NSB team. */
  projectId?: string;
  /** Shown as "Share your details to view …'s number". */
  advertiser: string;
  advertiserType?: "builder" | "broker";
  source: ProjectLeadSource;
}

const LeadContext = createContext<(target: LeadTarget) => void>(() => {});

const TITLES: Record<ProjectLeadSource, string> = {
  "View Number": "View number",
  "Site visit": "Schedule a site visit",
  Callback: "Request a callback",
  "Price sheet": "Request price sheet",
  Brochure: "Download brochure",
};

/** Wraps a real estate page so any LeadButton on it opens the one View Number dialog. */
export function LeadProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<LeadTarget | null>(null);
  return (
    <LeadContext.Provider value={setTarget}>
      {children}
      {target && <LeadDialog target={target} onClose={() => setTarget(null)} />}
    </LeadContext.Provider>
  );
}

export function LeadButton({ className = "re-btn", children, ...target }: LeadTarget & { className?: string; children: ReactNode }) {
  const open = useContext(LeadContext);
  return (
    <button type="button" className={className} onClick={() => open(target)}>
      {children}
    </button>
  );
}

const MOBILE = /^[6-9]\d{9}$/;
/** "9810012345" → "98100 12345". */
const spaced = (phone: string) => `${phone.slice(0, 5)} ${phone.slice(5)}`;

/**
 * The demo's View Number form: dealer, name, phone, buying timeline, loan and site visit interest,
 * consent. Saved as a lead in Admin › Enquiries; the visitor then sees the advertiser's number.
 */
function LeadDialog({ target, onClose }: { target: LeadTarget; onClose: () => void }) {
  const id = useId();
  const nameInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [invalid, setInvalid] = useState<"name" | "mobile" | null>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ProjectEnquiryResult | null>(null);

  useEffect(() => {
    nameInput.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const mobile = String(form.get("mobile") ?? "").replace(/\D/g, "");
    setInvalid(null);
    if (!name) {
      setInvalid("name");
      return setError("Please enter your name.");
    }
    if (!MOBILE.test(mobile)) {
      setInvalid("mobile");
      return setError("Enter a valid 10-digit mobile number.");
    }
    if (!form.get("agreed")) return setError("Please accept the Terms and Privacy Policy.");
    setError("");
    setPending(true);
    try {
      const res = await fetch("/api/enquiries/project", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          projectId: target.projectId,
          source: target.source,
          name,
          mobile,
          isDealer: form.get("dealer") === "yes",
          buyWithin: form.get("buyWithin") || undefined,
          homeLoan: form.has("homeLoan"),
          siteVisit: form.has("siteVisit"),
          agreed: true,
        }),
      });
      if (res.ok) {
        setResult((await res.json()) as ProjectEnquiryResult);
        return;
      }
      const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
      setError(
        body?.issues?.[0]?.message ??
          (res.status === 404 ? "This project is no longer listed." : res.status === 429 ? "Too many requests. Please try again shortly." : "Something went wrong. Please try again."),
      );
    } catch {
      setError("Could not send your details. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  const who = target.advertiserType === "broker" ? "Broker" : target.projectId ? "Builder" : "NSB team";
  return (
    <div className="re-mo" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="re-md" role="dialog" aria-modal="true" aria-labelledby={`${id}-title`}>
        <button type="button" className="re-x" onClick={onClose} aria-label="Close">
          ×
        </button>
        {result ? (
          <div className="re-nm" role="status">
            <h3 id={`${id}-title`}>{who} contact</h3>
            {result.phone ? (
              <>
                <b>
                  <a href={`tel:+91${result.phone}`}>+91 {spaced(result.phone)}</a>
                </b>
                <p>Your enquiry has been shared with {result.advertiserName ?? target.advertiser}.</p>
              </>
            ) : (
              <p style={{ marginTop: 10 }}>Thank you. The NSB team will call you back shortly.</p>
            )}
            {result.brochureUrl && target.source === "Brochure" && (
              <a className="re-btn" href={result.brochureUrl} target="_blank" rel="noopener noreferrer">
                Download brochure
              </a>
            )}
            <button type="button" className="re-btn o" onClick={onClose} style={{ marginLeft: 8 }}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <h3 id={`${id}-title`}>{TITLES[target.source]}</h3>
            <p className="ps">Share your details to {target.projectId ? `view ${target.advertiser}’s number` : "get a call from the NSB team"}</p>
            <fieldset className="re-fl">
              <legend className="t">Are you a property dealer?</legend>
              <div className="re-op">
                <label>
                  <input type="radio" name="dealer" value="yes" /> Yes
                </label>
                <label>
                  <input type="radio" name="dealer" value="no" defaultChecked /> No
                </label>
              </div>
            </fieldset>
            <div className="re-fl">
              <label className="t" htmlFor={`${id}-name`}>
                Name
              </label>
              <input ref={nameInput} id={`${id}-name`} name="name" className="re-in" placeholder="Your name" maxLength={80} autoComplete="name" aria-invalid={invalid === "name" || undefined} />
            </div>
            <div className="re-fl">
              <label className="t" htmlFor={`${id}-mobile`}>
                Phone
              </label>
              <div className="re-ph">
                <span>+91</span>
                <input
                  id={`${id}-mobile`}
                  name="mobile"
                  className="re-in"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="tel-national"
                  placeholder="10-digit mobile number"
                  aria-invalid={invalid === "mobile" || undefined}
                />
              </div>
            </div>
            <fieldset className="re-fl">
              <legend className="t">Planning to buy in?</legend>
              <div className="re-op">
                {BUY_WITHIN.map((w) => (
                  <label key={w}>
                    <input type="radio" name="buyWithin" value={w} /> {w}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="re-ck">
              <input type="checkbox" name="homeLoan" /> I’m interested in a home loan
            </label>
            <label className="re-ck">
              <input type="checkbox" name="siteVisit" defaultChecked={target.source !== "Price sheet"} /> I’m interested in site visits
            </label>
            <label className="re-ck">
              <input type="checkbox" name="agreed" /> I agree to the <b>Terms</b> and <b>Privacy Policy</b>
            </label>
            <p className="re-er" role="alert">
              {error}
            </p>
            <button type="submit" className="re-btn" style={{ width: "100%", padding: 12 }} disabled={pending}>
              {pending ? "Sending…" : target.source === "View Number" ? "View Number" : "Submit"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
