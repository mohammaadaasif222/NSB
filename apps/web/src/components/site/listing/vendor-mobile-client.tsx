"use client";

import Image from "next/image";
import { Check, ChevronLeft, ChevronRight, ImageIcon, Play } from "lucide-react";
import { createContext, type FormEvent, type ReactNode, useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ListingVideo } from "@nsb/shared";
import { todayInIndia } from "@nsb/shared/client";
import { Honeypot, honeypotValue } from "../honeypot";
import { useModalBehaviour } from "../use-modal-behaviour";
import { type EnquiryErrors, sendEnquiry } from "./send-enquiry";
import { parseClips, thumb, VideoViewer } from "./videos";

/**
 * The interactive parts of the vendor page's phone layout (Makeup-Vendor-Page.html): photo slider and
 * viewer, save and share, Read more, the Get a quote sheet, video reels and the booking bar.
 */

/* ---------- Get a quote sheet ---------- */

interface SheetSetup {
  listingId: string;
  vendorName: string;
  elite: boolean;
  /** Event type chips; none hides them. */
  eventTypes: readonly string[];
  /** Choices for the Service list, after "Not sure yet". */
  services: string[];
}

/** Opens the sheet, with a service preselected when the visitor tapped that service's Enquire. */
const QuoteContext = createContext<(service?: string) => void>(() => {});

export function QuoteProvider({ children, ...setup }: SheetSetup & { children: ReactNode }) {
  const [service, setService] = useState<string | null>(null);
  return (
    <QuoteContext.Provider value={(s) => setService(s ?? "")}>
      {children}
      {service !== null && <QuoteSheet {...setup} service={service} onClose={() => setService(null)} />}
    </QuoteContext.Provider>
  );
}

const NOT_SURE = "Not sure yet";

function QuoteSheet({ listingId, vendorName, elite, eventTypes, services, service, onClose }: SheetSetup & { service: string; onClose: () => void }) {
  const sheet = useModalBehaviour(onClose);
  const [eventType, setEventType] = useState(eventTypes[0] ?? "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const sub = `vm-sub${elite ? " is-elite" : ""}`;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const mobile = String(form.get("mobile") ?? "").trim();
    if (!name) return setError("Please enter your name");
    if (!/^[6-9]\d{9}$/.test(mobile)) return setError("Enter a valid 10 digit mobile number");
    setError("");
    setPending(true);
    const refused: EnquiryErrors | null = await sendEnquiry({
      listingId,
      name,
      mobile,
      preferredDate: form.get("preferredDate"),
      eventType: eventType || undefined,
      // Enquiries need a message: the service picked is what this sheet asks about.
      message: `Service: ${form.get("service") || NOT_SURE}`,
      website: honeypotValue(form),
    });
    setPending(false);
    if (refused) setError(Object.values(refused)[0] ?? "Something went wrong. Please try again.");
    else setSent(true);
  }

  return (
    <div className="vm-ov" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={sheet} className="vm-sheet" role="dialog" aria-modal="true" aria-label="Get a quote">
        <button type="button" className="vm-x" onClick={onClose} aria-label="Close">
          ×
        </button>
        {sent ? (
          <div className="vm-ok" role="status">
            <div className="vm-tick">
              <Check className="size-7" strokeWidth={3} aria-hidden />
            </div>
            <h3>Enquiry sent</h3>
            <p className="vm-sp">{vendorName} will contact you on WhatsApp or call very soon.</p>
            <button type="button" className={sub} onClick={onClose}>
              <span>Done</span>
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <Honeypot />
            <h3>Get a quote</h3>
            <p className="vm-sp">Share your details and {vendorName} will get back to you.</p>
            <label className="vm-f">
              Your name
              <input name="name" autoComplete="name" maxLength={80} placeholder="Full name" />
            </label>
            <label className="vm-f">
              Mobile number
              <input name="mobile" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} placeholder="10 digit mobile number" />
            </label>
            {eventTypes.length > 0 && (
              <>
                <div className="vm-f" id="vm-ev-label">
                  Event type
                </div>
                <div className="vm-ev" role="group" aria-labelledby="vm-ev-label">
                  {eventTypes.map((type) => (
                    <button key={type} type="button" aria-pressed={type === eventType} onClick={() => setEventType(type)}>
                      {type}
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className="vm-two">
              <label className="vm-f">
                Event date
                <input name="preferredDate" type="date" min={todayInIndia()} />
              </label>
              <label className="vm-f">
                Service
                <select name="service" defaultValue={services.includes(service) ? service : NOT_SURE}>
                  <option>{NOT_SURE}</option>
                  {services.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="vm-err" role="alert">
              {error}
            </div>
            <button type="submit" className={sub} disabled={pending}>
              <span>{pending ? "Sending…" : "Send enquiry"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/** A service's Enquire button: opens the sheet with that service chosen. */
export function EnquireService({ service }: { service: string }) {
  const open = useContext(QuoteContext);
  return (
    <button type="button" className="vm-enq" onClick={() => open(service)} aria-label={`Enquire about ${service}`}>
      Enquire
    </button>
  );
}

/* ---------- Booking bar ---------- */

const WhatsAppIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" aria-hidden>
    <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.6c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.4 0 .2 0 .8-.2 1.3Z" />
  </svg>
);

/** Fixed at the bottom: the headline price, Get quote, and WhatsApp (the quote sheet when WhatsApp is not set up). */
export function BookingBar({ label, value, elite, whatsappHref }: { label: string; value: string; elite: boolean; whatsappHref: string | null }) {
  const open = useContext(QuoteContext);
  return (
    <div className="vm-bar">
      <div className="vm-bp">
        <small>{label}</small>
        <b>{value}</b>
      </div>
      <button type="button" className={`vm-go${elite ? " is-elite" : ""}`} onClick={() => open()}>
        <span>Get quote</span>
      </button>
      {whatsappHref ? (
        <a className="vm-wa" href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
          <WhatsAppIcon />
        </a>
      ) : (
        <button type="button" className="vm-wa" aria-label="WhatsApp" onClick={() => open()}>
          <WhatsAppIcon />
        </button>
      )}
    </div>
  );
}

/* ---------- Photos ---------- */

/** Which slide a snap strip is on. */
const slideOf = (el: HTMLElement) => Math.round(el.scrollLeft / Math.max(1, el.clientWidth));

/** Full-width photo slider with dots; a tap opens the viewer at that photo. */
export function HeroSlider({ name, images, badge }: { name: string; images: string[]; badge: ReactNode }) {
  const [slide, setSlide] = useState(0);
  const [viewing, setViewing] = useState<number | null>(null);

  return (
    <div className="vm-ph">
      {images.length === 0 ? (
        <div className="vm-noph">
          <ImageIcon className="size-10" aria-hidden />
        </div>
      ) : (
        <div className="vm-gal" onScroll={(e) => setSlide(slideOf(e.currentTarget))}>
          {images.map((src, i) => (
            <button key={`${src}-${i}`} type="button" onClick={() => setViewing(i)} aria-label={`Open photo ${i + 1} of ${name}`}>
              <Image src={src} alt={`${name} – photo ${i + 1}`} fill fetchPriority={i === 0 ? "high" : "auto"} sizes="(max-width: 480px) 100vw, 448px" />
            </button>
          ))}
        </div>
      )}
      <div className="vm-bdg">{badge}</div>
      {images.length > 1 && (
        <div className="vm-dots" aria-hidden>
          {images.map((src, i) => (
            <i key={`${src}-${i}`} className={i === slide ? "on" : undefined} />
          ))}
        </div>
      )}
      {viewing !== null && <PhotoSlider name={name} images={images} start={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

/** The dark photo viewer: swipe or arrows between photos, thumbnails below, count on top. */
function PhotoSlider({ name, images, start, onClose }: { name: string; images: string[]; start: number; onClose: () => void }) {
  const strip = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(start);
  const go = (i: number, smooth = true) => strip.current?.scrollTo({ left: i * strip.current.clientWidth, behavior: smooth ? "smooth" : "auto" });
  const step = (d: number) => strip.current?.scrollBy({ left: d * strip.current.clientWidth, behavior: "smooth" });
  const dialog = useModalBehaviour(onClose, {
    onKey: (e) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    },
  });

  // Open at the photo that was tapped.
  useEffect(() => go(start, false), [start]);

  return (
    <div ref={dialog} className="vm-ov vm-lb" role="dialog" aria-modal="true" aria-label={`${name} photos`}>
      <div className="vm-lbt">
        <span>
          {index + 1} / {images.length}
        </span>
        <button type="button" className="vm-x" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      <div className="vm-lbm">
        <div ref={strip} className="vm-lbs" onScroll={(e) => setIndex(slideOf(e.currentTarget))}>
          {images.map((src, i) => (
            <div key={`${src}-${i}`}>
              <Image src={src} alt={`${name} – photo ${i + 1}`} width={1000} height={1250} sizes="100vw" />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <>
            <button type="button" className="vm-ln is-p" onClick={() => step(-1)} aria-label="Previous">
              <ChevronLeft className="size-5" strokeWidth={2.6} aria-hidden />
            </button>
            <button type="button" className="vm-ln is-n" onClick={() => step(1)} aria-label="Next">
              <ChevronRight className="size-5" strokeWidth={2.6} aria-hidden />
            </button>
          </>
        )}
      </div>
      <div className="vm-lbth">
        {images.map((src, i) => (
          <button key={`${src}-${i}`} type="button" aria-label={`Photo ${i + 1}`} aria-current={i === index} onClick={() => go(i)}>
            <Image src={src} alt="" width={50} height={50} sizes="50px" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Save, share, read more ---------- */

const SAVED_KEY = "nsb:saved-vendors";
const SAVED_EVENT = "nsb:saved-change";

/** The saved list as stored (a string, so React can compare snapshots); "[]" when storage is blocked. */
function savedSnapshot(): string {
  try {
    return localStorage.getItem(SAVED_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function parseSaved(raw: string): string[] {
  try {
    const v: unknown = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

/** Follows saves from this tab and from other tabs. */
function subscribeSaved(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(SAVED_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SAVED_EVENT, onChange);
  };
}

/** Save (remembered in this browser) and Share (the phone's share sheet, else the link is copied). */
export function SaveShare({ slug, name }: { slug: string; name: string }) {
  const stored = useSyncExternalStore(subscribeSaved, savedSnapshot, () => "[]");
  // Storage blocked: the heart still toggles for this visit.
  const [fallback, setFallback] = useState<boolean | null>(null);
  const saved = fallback ?? parseSaved(stored).includes(slug);
  const [copied, setCopied] = useState(false);

  function toggle() {
    const next = !saved;
    try {
      const rest = parseSaved(savedSnapshot()).filter((s) => s !== slug);
      localStorage.setItem(SAVED_KEY, JSON.stringify(next ? [...rest, slug] : rest));
      window.dispatchEvent(new Event(SAVED_EVENT));
    } catch {
      setFallback(next);
    }
  }

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: name, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Share sheet dismissed, or the clipboard is unavailable.
    }
  }

  return (
    <div className="vm-sa">
      <button type="button" className="vm-sb" aria-label="Save" aria-pressed={saved} onClick={toggle}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
          <path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11Z" />
        </svg>
      </button>
      <button type="button" className="vm-sb" aria-label={copied ? "Link copied" : "Share"} onClick={share}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
        </svg>
      </button>
    </div>
  );
}

/** The about text, four lines until Read more. */
export function AboutText({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 220;
  return (
    <>
      <p className={long && !open ? "vm-clamp" : undefined}>{text}</p>
      {long && (
        <button type="button" className="vm-link" onClick={() => setOpen(!open)}>
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </>
  );
}

/* ---------- Videos ---------- */

/** Video thumbnails in a swipeable row of tall tiles; a tap opens the full-screen player. */
export function Reels({ name, videos }: { name: string; videos: ListingVideo[] }) {
  const [viewing, setViewing] = useState<number | null>(null);
  const { clips } = parseClips(name, videos);
  let videoNo = 0;
  let shortNo = 0;

  return (
    <>
      <div className="vm-reels">
        {clips.map((clip, i) => (
          <button key={`${clip.id}-${i}`} type="button" className="vm-rl" onClick={() => setViewing(i)} aria-label={`Play ${clip.title}`}>
            <Image src={thumb(clip.id)} alt="" fill sizes="128px" />
            <span className="vm-pl">
              <Play className="size-4 fill-current" aria-hidden />
            </span>
            <span className="vm-rt">{clip.short ? `Short ${++shortNo}` : `Video ${++videoNo}`}</span>
          </button>
        ))}
      </div>
      {viewing !== null && <VideoViewer clips={clips} index={viewing} onChange={setViewing} onClose={() => setViewing(null)} name={name} />}
    </>
  );
}
