"use client";

import { getImageProps } from "next/image";
import { useRef, useState } from "react";
import { HomeLink, Icon } from "./bits";
import { ICON } from "./content";

/** An image slide is one link; a slide without an image shows its text on a gradient (`cls`). */
export interface HeroSlide {
  key: string;
  image: string | null;
  /** Shown instead of `image` on phones, when set. */
  mobileImage: string | null;
  cls: string;
  tag: string | null;
  heading: string;
  text: string | null;
  cta: string | null;
  link: string;
}

/** The slider's width at each screen size, so the browser picks a file that fits. */
const SLIDE_SIZES = "(max-width: 960px) 100vw, 800px";

/** An optimized slide photo. <picture> downloads only the one for this screen; the first loads first. */
function SlideImage({ desktop, mobile, first }: { desktop: string; mobile: string | null; first: boolean }) {
  const common = { alt: "", fill: true, loading: first ? "eager" : "lazy", fetchPriority: first ? "high" : "auto", className: "object-cover" } as const;
  const { props } = getImageProps({ ...common, src: desktop, sizes: SLIDE_SIZES });
  const phone = mobile && mobile !== desktop ? getImageProps({ ...common, src: mobile, sizes: "100vw" }).props.srcSet : null;
  return (
    <picture>
      {phone && <source media="(max-width: 600px)" srcSet={phone} sizes="100vw" />}
      <img {...props} alt="" />
    </picture>
  );
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
        {slides.map((s, i) =>
          s.image ? (
            <HomeLink key={s.key} className="slide img" href={s.link} aria-label={s.heading}>
              <SlideImage desktop={s.image} mobile={s.mobileImage} first={i === 0} />
            </HomeLink>
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
          <i
            key={s.key}
            role="button"
            tabIndex={0}
            aria-label={`Slide ${i + 1}`}
            className={i === current ? "on" : undefined}
            onClick={() => go(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                go(i);
              }
            }}
          />
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
