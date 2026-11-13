"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BuildingArt } from "./project-art";

/** The interactive parts of a phone project card (real-estate-listing-mobile-page.html). */

/** Swipeable photos with a "1 / 3" counter; each photo opens the project. */
export function CardGallery({ name, href, photos, eager }: { name: string; href: string; photos: string[]; eager: boolean }) {
  const [slide, setSlide] = useState(0);
  if (photos.length === 0) {
    return (
      <Link href={href} className="rl-gal" aria-label={name} tabIndex={-1}>
        <BuildingArt />
      </Link>
    );
  }
  return (
    <>
      <div className="rl-gal" onScroll={(e) => setSlide(Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth)))}>
        {photos.map((src, i) => (
          <Link key={`${src}-${i}`} href={href} tabIndex={i ? -1 : undefined} aria-label={i ? undefined : name}>
            {/* Lazy with a high priority on the first cards: the desktop layout is in the page too. */}
            <Image src={src} alt={i ? "" : name} fill sizes="(max-width: 480px) 100vw, 448px" fetchPriority={eager && i === 0 ? "high" : "auto"} />
          </Link>
        ))}
      </div>
      {photos.length > 1 && (
        <span className="rl-pcount" aria-hidden>
          {slide + 1} / {photos.length}
        </span>
      )}
    </>
  );
}

/** Save (for this visit, like the desktop card's heart) and Share (the share sheet, else the link is copied). */
export function CardActions({ name, href }: { name: string; href: string }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = new URL(href, window.location.origin).toString();
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
    <div className="rl-acts">
      <button type="button" className="rl-act" aria-label={`Save ${name}`} aria-pressed={saved} onClick={() => setSaved((s) => !s)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
          <path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11Z" />
        </svg>
      </button>
      <button type="button" className="rl-act" aria-label={copied ? "Link copied" : `Share ${name}`} onClick={share}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
        </svg>
      </button>
    </div>
  );
}
