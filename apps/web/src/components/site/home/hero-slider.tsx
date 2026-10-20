"use client";

import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo, type ReactNode, useRef, useState } from "react";
import type { Banner } from "@nsb/shared";

const AUTOPLAY_MS = 6000;
/** Horizontal travel, in px, that counts as a swipe on touch screens. */
const SWIPE_PX = 40;

/** Shown only if no banner is active in the admin panel. */
const FALLBACK: Banner = {
  id: "fallback",
  imageUrl: null,
  mobileImageUrl: null,
  heading: "Discover Noida",
  subheading: "Your complete local marketplace",
  ctaLabel: null,
  ctaLink: "#categories",
  isActive: true,
  sortOrder: 0,
};

/** The whole slide is one link to the banner's link (admin "Button link"); no link, no wrapper. */
function SlideLink({ banner, children }: { banner: Banner; children: ReactNode }) {
  const href = banner.ctaLink;
  const className = "group/slide absolute inset-0 block";
  const label = banner.heading;
  if (!href) return <div className="absolute inset-0">{children}</div>;
  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link href={href} className={className} aria-label={label}>
        {children}
      </Link>
    );
  }
  const external = /^https?:\/\//.test(href);
  return (
    <a href={href} className={className} aria-label={label} {...(external && { target: "_blank", rel: "noopener noreferrer" })}>
      {children}
    </a>
  );
}

/** Matches the slider's own breakpoint: below `sm` the slot is full width × 200px. */
const MOBILE_MEDIA = "(max-width: 639px)";
const DESKTOP_SIZES = "(min-width: 1536px) 1000px, (min-width: 1280px) 830px, (min-width: 1024px) 66vw, 100vw";

/**
 * Banner background. With a mobile image, a <picture> lets the browser download only the image
 * for the current viewport (art direction); otherwise the desktop image is used everywhere.
 */
function BannerImage({ banner, first }: { banner: Banner; first: boolean }) {
  const src = banner.imageUrl ?? banner.mobileImageUrl;
  if (!src) return null;
  if (!banner.mobileImageUrl || banner.mobileImageUrl === src) {
    return <Image src={src} alt="" fill preload={first} sizes={DESKTOP_SIZES} className="object-cover" />;
  }
  // Only one <img> loads, so the first slide can load eagerly without fetching both images.
  const common = { alt: "", fill: true, loading: first ? "eager" : "lazy", fetchPriority: first ? "high" : "auto" } as const;
  const { props: desktop } = getImageProps({ ...common, src, sizes: DESKTOP_SIZES });
  const {
    props: { srcSet: mobileSrcSet },
  } = getImageProps({ ...common, src: banner.mobileImageUrl, sizes: "100vw" });
  return (
    <picture>
      <source media={MOBILE_MEDIA} srcSet={mobileSrcSet} sizes="100vw" />
      <img {...desktop} alt="" className="object-cover" />
    </picture>
  );
}

/** Brand backdrop for a slide without an image: deep teal gradient with soft light and a dot grid. */
function Backdrop() {
  return (
    <span aria-hidden className="absolute inset-0 overflow-hidden bg-linear-135 from-[#00394a] via-hero to-[#0b8aa8]">
      <span className="absolute -top-1/2 -right-[10%] size-[520px] rounded-full bg-[#38bdf8]/20 blur-3xl" />
      <span className="absolute -bottom-2/3 -left-[5%] size-[420px] rounded-full bg-[#00222c]/30 blur-3xl" />
      <span className="absolute inset-y-0 right-0 hidden w-2/5 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] bg-size-[18px_18px] mask-l-from-10% mask-l-to-100% sm:block" />
      <span className="absolute inset-0 ring-1 ring-white/10 ring-inset" />
    </span>
  );
}

/**
 * Memoised so a slide change re-renders only the two slides whose `active` flag flips.
 * A slide shows its image only (no text or button); the banner name is its link label. A slide
 * without an image, such as the fallback, shows its name on the brand backdrop.
 */
const Slide = memo(function Slide({ banner, position, count, active }: { banner: Banner; position: number; count: number; active: boolean }) {
  const hasImage = !!(banner.imageUrl || banner.mobileImageUrl);
  return (
    <div role="group" aria-roledescription="slide" aria-label={`${position + 1} of ${count}`} inert={!active} className="relative h-full min-w-full">
      <SlideLink banner={banner}>
        {hasImage ? (
          <span className="absolute inset-0 transition-transform duration-[1200ms] ease-out group-hover/slide:scale-[1.02]">
            <BannerImage banner={banner} first={position === 0} />
          </span>
        ) : (
          <>
            <Backdrop />
            <span className="relative flex size-full items-center justify-center px-14 text-center">
              <span className="line-clamp-2 font-display text-2xl leading-tight font-bold tracking-tight text-white sm:text-4xl xl:text-5xl">{banner.heading}</span>
            </span>
          </>
        )}
        {hasImage && count > 1 && (
          // Keeps the slide dots readable on light images.
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-black/25 to-transparent" />
        )}
      </SlideLink>
    </div>
  );
});

const arrowClass =
  "absolute top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-sm transition-colors hover:bg-white/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:size-10";

export function HeroSlider({ banners }: { banners: Banner[] }) {
  const slides = banners.length ? banners : [FALLBACK];
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  const go = (step: number) => setIndex((i) => (i + step + count) % count);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Highlights"
      className="group relative isolate h-[200px] overflow-hidden rounded-xl bg-hero sm:h-[250px] sm:rounded-2xl lg:h-[285px] xl:h-[310px] 2xl:h-[370px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        touchX.current = null;
        if (start === null || count < 2) return;
        const dx = e.changedTouches[0].clientX - start;
        if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
      }}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((banner, i) => (
          <Slide key={banner.id} banner={banner} position={i} count={count} active={i === index} />
        ))}
      </div>

      {count > 1 && (
        <>
          <button type="button" aria-label="Previous slide" onClick={() => go(-1)} className={`${arrowClass} left-3 sm:left-4`}>
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button type="button" aria-label="Next slide" onClick={() => go(1)} className={`${arrowClass} right-3 sm:right-4`}>
            <ChevronRight className="size-5" aria-hidden />
          </button>
          {/* Each dot is a track; the current one fills over the autoplay interval, then the slide
              advances (pausing on hover or focus pauses both). No autoplay with reduced motion. */}
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2.5 sm:bottom-4">
            {slides.map((banner, i) => (
              <button
                key={banner.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className="group/dot py-2"
              >
                <span className="block h-[3px] w-5 overflow-hidden rounded-full bg-white/40 transition-all duration-300 group-hover/dot:bg-white/70 group-aria-[current=true]/dot:w-9 sm:w-6 sm:group-aria-[current=true]/dot:w-10">
                  {i === index && (
                    <span
                      key={index}
                      onAnimationEnd={() => go(1)}
                      style={{ animationDuration: `${AUTOPLAY_MS}ms`, animationPlayState: paused ? "paused" : "running" }}
                      className="block h-full origin-left bg-white motion-safe:animate-[hero-progress_linear_both]"
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
