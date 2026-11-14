"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { type ProjectConfiguration } from "@nsb/shared";
import { youTubeId } from "@nsb/shared/client";
import { useModalBehaviour } from "../use-modal-behaviour";
import { priceText, sqftText } from "./format";
import { LeadButton, type LeadTarget } from "./lead-dialog";
import { BuildingArt } from "./project-art";

/** The interactive parts of the project page's phone layout (real-esatate-details-page-mobile.html). */

const ICON = { width: 19, height: 19, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/* ---------- lightbox: a zoomable plan, or a video ---------- */

function Lightbox({ onClose, children, zoomable = false }: { onClose: () => void; children: ReactNode; zoomable?: boolean }) {
  const box = useModalBehaviour(onClose);
  const [zoom, setZoom] = useState(false);
  return (
    <div
      ref={box}
      className={`pm-lb${zoom ? " is-z" : ""}`}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        const t = e.target as HTMLElement;
        if (zoomable && t.tagName === "IMG") setZoom((z) => !z);
        else if (!t.closest("iframe")) onClose();
      }}
    >
      <button type="button" className="pm-lbx" onClick={onClose} aria-label="Close">
        ×
      </button>
      {children}
    </div>
  );
}

/* ---------- top: photos, the buttons over them, and the jump pills ---------- */

export function HeroGallery({ name, photos, jumps }: { name: string; photos: string[]; jumps: { id: string; label: string }[] }) {
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const [saved, setSaved] = useState(false);
  const [jump, setJump] = useState(0);

  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: name, url: window.location.href });
      else await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Share sheet dismissed, or the clipboard is unavailable.
    }
  }

  return (
    <div className="pm-gal" id="m-top">
      <div className="pm-sls" onScroll={(e) => setSlide(Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth)))}>
        {photos.length === 0 ? (
          <div className="pm-sl pm-noph">
            <BuildingArt />
          </div>
        ) : (
          photos.map((src, i) => (
            <div key={`${src}-${i}`} className="pm-sl">
              {/* Lazy with a high priority on the first: the desktop gallery is in the page too. */}
              <Image src={src} alt={`${name}, photo ${i + 1}`} fill sizes="(max-width: 480px) 100vw, 480px" fetchPriority={i === 0 ? "high" : "auto"} />
            </div>
          ))
        )}
      </div>

      <div className="pm-bar">
        <button type="button" className="pm-ib" aria-label="Back" onClick={() => (window.history.length > 1 ? router.back() : router.push("/real-estate"))}>
          <svg {...ICON}>
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <span className="pm-bt" />
        <button type="button" className="pm-ib" aria-label="Share" onClick={share}>
          <svg {...ICON}>
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4" />
          </svg>
        </button>
        <button type="button" className={`pm-ib${saved ? " is-on" : ""}`} aria-label="Save" aria-pressed={saved} onClick={() => setSaved((s) => !s)}>
          <svg {...ICON}>
            <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
          </svg>
        </button>
      </div>

      {photos.length > 1 && (
        <>
          <div className="pm-gc">
            {slide + 1}/{photos.length}
          </div>
          <div className="pm-dots" aria-hidden>
            {photos.map((src, i) => (
              <i key={`${src}-${i}`} className={i === slide ? "on" : undefined} />
            ))}
          </div>
        </>
      )}
      {jumps.length > 1 && (
        <div className="pm-mpills">
          {jumps.map((j, i) => (
            <a key={j.id} href={`#${j.id}`} className={`pm-mp${i === jump ? " on" : ""}`} onClick={() => setJump(i)}>
              {j.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- section tabs that follow the scroll ---------- */

export function SectionTabs({ tabs }: { tabs: { id: string; label: string }[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    const sections = tabs.map((t) => document.getElementById(t.id)).filter((s): s is HTMLElement => !!s);
    const onScroll = () => {
      const line = (nav.current?.getBoundingClientRect().bottom ?? 0) + 24;
      let current = tabs[0]?.id ?? "";
      for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s.id;
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [tabs]);

  // Keep the current tab in view in the scrolling strip.
  useEffect(() => {
    const el = nav.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (el && nav.current) nav.current.scrollLeft = el.offsetLeft - 20;
  }, [active]);

  return (
    <nav ref={nav} className="pm-tabs" aria-label="Sections">
      {tabs.map((t) => (
        <a key={t.id} data-id={t.id} href={`#${t.id}`} className={t.id === active ? "on" : undefined} aria-current={t.id === active ? "true" : undefined}>
          {t.label}
        </a>
      ))}
    </nav>
  );
}

/* ---------- show more / read more ---------- */

/** The first `shown` items, then "Show all N …". */
export function ShowMore({ className, items, shown, noun }: { className: string; items: ReactNode[]; shown: number; noun: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className={className}>{open ? items : items.slice(0, shown)}</div>
      {items.length > shown && (
        <button type="button" className="pm-more" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? `Show fewer ${noun}` : `Show all ${items.length} ${noun}`}
        </button>
      )}
    </>
  );
}

export function ReadMore({ paragraphs }: { paragraphs: string[] }) {
  const long = paragraphs.join(" ").length > 240;
  const [clamped, setClamped] = useState(long);
  return (
    <>
      <div className={clamped ? "pm-cl" : undefined}>
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {long && (
        <button type="button" className="pm-rm" onClick={() => setClamped((c) => !c)} aria-expanded={!clamped}>
          {clamped ? "Read more" : "Read less"}
        </button>
      )}
    </>
  );
}

/* ---------- copy ---------- */

export function CopyButton({ text, label = "Copy ID", className }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard unavailable.
        }
      }}
    >
      {copied ? "Copied" : label}
    </button>
  );
}

/* ---------- broker RERA ---------- */

function ReraSheet({ name, firm, reraId, onClose }: { name: string; firm: string; reraId: string; onClose: () => void }) {
  const sheet = useModalBehaviour(onClose);
  return (
    <div className="pm-ov" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={sheet} className="pm-sheet is-c" role="dialog" aria-modal="true" aria-label="Broker RERA details">
        <div className="pm-h" />
        <div className="pm-rv">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
            <path d="M8.5 12l2.5 2.5 4.5-5" />
          </svg>
        </div>
        <h3>Broker RERA details</h3>
        <p>{[name, firm].filter(Boolean).join(" · ")}</p>
        <div className="pm-rbox">
          <span>Broker RERA No.</span>
          <b>{reraId}</b>
        </div>
        <div className="pm-row2">
          <CopyButton text={reraId} className="pm-btn is-o" />
          <a className="pm-btn" href="https://www.up-rera.in" target="_blank" rel="noopener noreferrer">
            Verify on UP RERA ↗
          </a>
        </div>
        <div className="pm-msg">Please verify this number on the official UP RERA website.</div>
        <button type="button" className="pm-more" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export function BrokerRera({ name, firm, reraId }: { name: string; firm: string; reraId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="pm-rbtn" onClick={() => setOpen(true)} aria-label="View broker RERA details">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
          <path d="M8.5 12l2.5 2.5 4.5-5" />
        </svg>
        RERA
      </button>
      {open && <ReraSheet name={name} firm={firm} reraId={reraId} onClose={() => setOpen(false)} />}
    </>
  );
}

/* ---------- videos ---------- */

export interface VideoTile {
  title: string;
  url: string;
}

/** Tall video tiles; a tap plays the video in the lightbox (YouTube loads only then). */
export function VideoTiles({ videos }: { videos: VideoTile[] }) {
  const [playing, setPlaying] = useState<number | null>(null);
  const tiles = videos.flatMap((v) => {
    const id = youTubeId(v.url);
    return id ? [{ ...v, id, short: /youtube\.com\/shorts\//i.test(v.url) }] : [];
  });
  const current = playing === null ? null : tiles[playing];
  return (
    <>
      <div className="pm-shorts">
        {tiles.map((v, i) => (
          <button key={`${v.id}-${i}`} type="button" className="pm-sh" onClick={() => setPlaying(i)} aria-label={`Play ${v.title}`}>
            <Image src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" fill sizes="170px" />
            <span className="pm-shb">{v.short ? "SHORT" : "VIDEO"}</span>
            <span className="pm-shp">
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            </span>
            <span className="pm-sht">
              <b>{v.title}</b>
            </span>
          </button>
        ))}
      </div>
      {current && (
        <Lightbox onClose={() => setPlaying(null)}>
          <div className="pm-vm">
            <iframe
              className={current.short ? "is-short" : undefined}
              src={`https://www.youtube-nocookie.com/embed/${current.id}?autoplay=1&rel=0&playsinline=1`}
              title={current.title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        </Lightbox>
      )}
    </>
  );
}

/* ---------- floor plans ---------- */

const WA = (
  <svg viewBox="0 0 24 24" aria-hidden>
    <path d="M21 12a9 9 0 0 1-13.2 8L3 21l1.1-4.6A9 9 0 1 1 21 12z" />
    <path d="M9 9c0 3 3 6 6 6l1.2-1.4-2-1-1 .8c-.8-.3-1.8-1.3-2.1-2.1l.8-1-1-2z" />
  </svg>
);

/** "3 BHK Villa" → "3 BHK"; titles without a BHK count are their own group. */
const groupOf = (title: string) => {
  const m = title.match(/(\d+)\s*BHK/i);
  return m ? `${m[1]} BHK` : title;
};
const sizes = (n: number) => `${n} ${n === 1 ? "Size" : "Sizes"}`;

/**
 * Plans by BHK, as swipeable cards with the 3D / 2D switch (shown when both exist). A plan opens
 * zoomable; the buttons ask for the price sheet or a callback about that plan.
 */
export function FloorPlanCards({ configurations, possession, lead }: { configurations: ProjectConfiguration[]; possession: string; lead: Omit<LeadTarget, "source"> }) {
  const has3d = configurations.some((c) => c.plan3dUrl);
  const has2d = configurations.some((c) => c.plan2dUrl);
  const [mode, setMode] = useState<"3d" | "2d">(has3d ? "3d" : "2d");
  const [group, setGroup] = useState("all");
  const [slide, setSlide] = useState(0);
  const [zoom, setZoom] = useState<string | null>(null);
  const strip = useRef<HTMLDivElement>(null);

  const groups = [...new Set(configurations.map((c) => groupOf(c.title)))];
  const list = configurations.filter((c) => group === "all" || groupOf(c.title) === group);
  const step = () => (strip.current?.firstElementChild as HTMLElement | null)?.offsetWidth ?? 1;

  const pick = (g: string) => {
    setGroup(g);
    setSlide(0);
    strip.current?.scrollTo({ left: 0 });
  };

  return (
    <>
      <div className="pm-fhead">
        <h2>Floor Plans and Pricing</h2>
        {has3d && has2d && (
          <div className="pm-seg2" role="group" aria-label="Plan view">
            {(["3d", "2d"] as const).map((m) => (
              <button key={m} type="button" className={mode === m ? "on" : undefined} aria-pressed={mode === m} onClick={() => setMode(m)}>
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>
      {groups.length > 1 && (
        <div className="pm-fchips">
          <button type="button" className={group === "all" ? "on" : undefined} onClick={() => pick("all")}>
            All<small>{sizes(configurations.length)}</small>
          </button>
          {groups.map((g) => (
            <button key={g} type="button" className={group === g ? "on" : undefined} onClick={() => pick(g)}>
              {g}
              <small>{sizes(configurations.filter((c) => groupOf(c.title) === g).length)}</small>
            </button>
          ))}
        </div>
      )}
      <div ref={strip} className={`pm-fs${list.length === 1 ? " is-single" : ""}`} onScroll={(e) => setSlide(Math.round(e.currentTarget.scrollLeft / (step() + 12)))}>
        {list.map((c, i) => {
          const plan = mode === "3d" ? (c.plan3dUrl ?? c.plan2dUrl) : (c.plan2dUrl ?? c.plan3dUrl);
          const shownMode = plan === c.plan3dUrl ? "3D" : "2D";
          const rate = c.price && c.superArea ? `₹${((c.price / c.superArea) / 1000).toFixed(1)}K/sq ft` : "";
          return (
            <div key={`${c.title}-${i}`} className="pm-fcd">
              {plan ? (
                <button type="button" className={`pm-fim${shownMode === "2D" ? " is-2d" : ""}`} onClick={() => setZoom(plan)} aria-label={`Zoom ${c.title} floor plan`}>
                  <Image src={plan} alt={`${c.title} ${shownMode} floor plan`} fill sizes="(max-width: 480px) 72vw, 340px" />
                  <span className="pm-t3">{shownMode}</span>
                  <span className="pm-zh">Zoom</span>
                </button>
              ) : (
                <div className="pm-fim pm-pnone">Plan on request</div>
              )}
              <div className="pm-fbd">
                <div className="pm-ftop">
                  <div>
                    <div className="pm-fbhk">{c.title}</div>
                    {/* "Possession by 2027", or "Possession: Immediate" when it is not a date. */}
                    {possession && <div className="pm-fps">{/\d/.test(possession) ? `Possession by ${possession}` : `Possession: ${possession}`}</div>}
                  </div>
                  <div className="pm-fpw">
                    <div className="pm-fpr">{c.price ? priceText(c.price) : "On request"}</div>
                    {rate && <small className="pm-frt">{rate}</small>}
                  </div>
                </div>
                {c.superArea && (
                  <div className="pm-fa2">
                    <span>Super area</span>
                    <b>{sqftText(c.superArea)}</b>
                  </div>
                )}
                {c.carpetArea && (
                  <div className="pm-fa2">
                    <span>Carpet area</span>
                    <b>{sqftText(c.carpetArea)}</b>
                  </div>
                )}
                <div className="pm-fbt">
                  <LeadButton className="pm-wa" {...lead} source="Callback">
                    <span className="sr-only">Request a callback about {c.title}</span>
                    {WA}
                  </LeadButton>
                  <LeadButton className="pm-btn" {...lead} source="Price sheet">
                    Get price details
                  </LeadButton>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {list.length > 1 && (
        <div className="pm-pnav">
          <button type="button" className="pm-ib2" aria-label="Previous" onClick={() => strip.current?.scrollBy({ left: -(step() + 12), behavior: "smooth" })}>
            ‹
          </button>
          <div className="pm-pd" aria-hidden>
            {list.map((c, i) => (
              <i key={`${c.title}-${i}`} className={i === slide ? "on" : undefined} />
            ))}
          </div>
          <button type="button" className="pm-ib2" aria-label="Next" onClick={() => strip.current?.scrollBy({ left: step() + 12, behavior: "smooth" })}>
            ›
          </button>
        </div>
      )}
      {zoom && (
        <Lightbox zoomable onClose={() => setZoom(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element -- full-size plan in the viewer, zoomed by width */}
          <img src={zoom} alt="Floor plan" />
        </Lightbox>
      )}
    </>
  );
}
