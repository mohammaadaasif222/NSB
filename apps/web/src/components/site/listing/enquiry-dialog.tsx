"use client";

import { CheckCircle2, X } from "lucide-react";
import { createContext, type FormEvent, type ReactNode, useContext, useEffect, useId, useRef, useState } from "react";
import { todayInIndia } from "@nsb/shared/client";
import { Honeypot, honeypotValue } from "../honeypot";
import { useModalBehaviour } from "../use-modal-behaviour";
import { type EnquiryErrors, sendEnquiry } from "./send-enquiry";
import "./enquiry-dialog.css";

/** The listing a card's button enquires about. */
interface EnquiryTarget {
  id: string;
  name: string;
}

const EnquiryContext = createContext<(target: EnquiryTarget) => void>(() => {});

const EVENT_TYPES = ["Wedding", "Engagement", "Other"];
const GUESTS = ["Up to 100", "100–200", "200–300", "300+"];

/** Wraps a listing page so every card's EnquireButton opens the one enquiry dialog. */
export function EnquiryProvider({ wedding, children }: { /** Asks guests and event type too. */ wedding: boolean; children: ReactNode }) {
  const [target, setTarget] = useState<EnquiryTarget | null>(null);
  return (
    <EnquiryContext.Provider value={setTarget}>
      {children}
      {target && <EnquiryDialog listing={target} wedding={wedding} onClose={() => setTarget(null)} />}
    </EnquiryContext.Provider>
  );
}

export function EnquireButton({ id, name }: EnquiryTarget) {
  const open = useContext(EnquiryContext);
  return (
    <button type="button" className="lp-en" aria-label={`Enquire now about ${name}`} onClick={() => open({ id, name })}>
      Enquire Now
    </button>
  );
}

/**
 * The listing page's quick enquiry, after the NSB venue page design. Saved as a lead tagged with this
 * listing (roadmap 4.5). Enquiries need a message, so guests and the WhatsApp choice go in it.
 */
function EnquiryDialog({ listing, wedding, onClose }: { listing: EnquiryTarget; wedding: boolean; onClose: () => void }) {
  const id = useId();
  const dialog = useModalBehaviour(onClose);
  const nameInput = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => nameInput.current?.focus(), []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const guests = form.get("guests");
    const details = [guests && `Guests: ${guests}`, `Notify on WhatsApp: ${form.has("whatsapp") ? "Yes" : "No"}`];
    setErrors({});
    setPending(true);
    const refused = await sendEnquiry({
      listingId: listing.id,
      name: form.get("name"),
      mobile: form.get("mobile"),
      preferredDate: form.get("preferredDate"),
      eventType: form.get("eventType") || undefined,
      message: details.filter(Boolean).join(" · "),
      website: honeypotValue(form),
    });
    setPending(false);
    if (refused) setErrors(refused);
    else setSent(true);
  }

  const field = (name: keyof EnquiryErrors) => ({
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}` : undefined,
  });
  const error = (name: keyof EnquiryErrors) =>
    errors[name] && (
      <p id={`${id}-${name}`} className="eq-er">
        {errors[name]}
      </p>
    );

  return (
    <div className="eq-mo" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialog} className="eq-md" role="dialog" aria-modal="true" aria-labelledby={`${id}-title`}>
        <div className="eq-hd">
          <h2 id={`${id}-title`}>
            Enquire now
            <small>{listing.name}</small>
          </h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X aria-hidden />
          </button>
        </div>

        {sent ? (
          <div className="eq-ok" role="status">
            <CheckCircle2 aria-hidden />
            <p>
              <b>Enquiry sent!</b>
            </p>
            <p>{listing.name} will get in touch with you soon.</p>
            <button type="button" className="eq-sub" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="eq-bd">
            <Honeypot />
            <div>
              <input {...field("name")} ref={nameInput} className="eq-in" required maxLength={80} autoComplete="name" placeholder="Your name" aria-label="Your name" />
              {error("name")}
            </div>
            <div>
              <div className="eq-ph">
                <span>🇮🇳 +91</span>
                <input {...field("mobile")} className="eq-in" required type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="Phone number" aria-label="Phone number" />
              </div>
              {error("mobile")}
            </div>
            <div>
              <div className={wedding ? "eq-r2" : undefined}>
                <input {...field("preferredDate")} className="eq-in" required type="date" min={todayInIndia()} aria-label="Event date" />
                {wedding && (
                  <select name="guests" className="eq-in" defaultValue="" aria-label="Guests">
                    <option value="">Guests</option>
                    {GUESTS.map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                )}
              </div>
              {error("preferredDate")}
            </div>
            {wedding && (
              <fieldset className="eq-rd">
                <legend className="sr-only">Event type</legend>
                {EVENT_TYPES.map((type, i) => (
                  <label key={type}>
                    <input type="radio" name="eventType" value={type} defaultChecked={i === 0} />
                    <span>{type}</span>
                  </label>
                ))}
              </fieldset>
            )}
            <label className="eq-tg">
              Notify me on WhatsApp
              <input type="checkbox" role="switch" name="whatsapp" defaultChecked />
            </label>
            {errors.form && (
              <p role="alert" className="eq-er">
                {errors.form}
              </p>
            )}
            <button type="submit" className="eq-sub" disabled={pending}>
              {pending ? "Sending…" : "Check availability & prices"}
            </button>
            <p className="eq-nt">Free to enquire · Shared only with this vendor and the NSB team</p>
          </form>
        )}
      </div>
    </div>
  );
}
