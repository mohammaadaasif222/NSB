"use client";

import { useRef, useState } from "react";
import { HomeLink, Icon } from "./bits";
import { ICON } from "./content";

/** An image slide is one link; a slide without an image shows its text on a gradient (`cls`). */
export interface HeroSlide {
  key: string;
  image: string | null;
  cls: string;
  tag: string | null;
  heading: string;
  text: string | null;
  cta: string | null;
  link: string;
}

/** Scroll-snap slider from the demo: swipe or use the arrows and dots. */
export function HeroSlides({ slides }: { slides: HeroSlide[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    const next = (i + slides.length) % slides.length;
    setCurrent(next);
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="hs">
      <div
        className="slides"
        ref={track}
        onScroll={(e) => setCurrent(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
      >
        {slides.map((s) =>
          s.image ? (
            <HomeLink
              key={s.key}
              className="slide"
              href={s.link}
              aria-label={s.heading}
              style={{ background: `url("${s.image}") center/cover no-repeat` }}
            />
          ) : (
            <div key={s.key} className={`slide ${s.cls}`}>
              {s.tag && <small>{s.tag}</small>}
              <h2>{s.heading}</h2>
              {s.text && <p>{s.text}</p>}
              {s.cta && (
                <HomeLink className="btn" href={s.link}>
                  {s.cta}
                </HomeLink>
              )}
            </div>
          ),
        )}
      </div>
      <div className="dots">
        {slides.map((s, i) => (
          <i key={s.key} className={i === current ? "on" : undefined} onClick={() => go(i)} />
        ))}
      </div>
      <div className="nv">
        <button type="button" aria-label="Previous" onClick={() => go(current - 1)}>
          <Icon d={ICON.chevronLeft} size={18} />
        </button>
        <button type="button" aria-label="Next" onClick={() => go(current + 1)}>
          <Icon d={ICON.chevronRight} size={18} />
        </button>
      </div>
    </div>
  );
}
