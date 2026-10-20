"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, ImageIcon, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

/** Photo collage (one large + two small, as on ezweddingz) with a popup viewer in the same style. */
export function Gallery({ name, images }: { name: string; images: string[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const [touchX, setTouchX] = useState<number | null>(null);
  const count = images.length;
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + count) % count)), [count]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, step]);

  if (count === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-2xl bg-[#e5e7eb] text-muted">
        <ImageIcon className="size-10" aria-hidden />
      </div>
    );
  }

  const [main, ...rest] = images;
  const side = rest.slice(0, 2);
  const hidden = count - 1 - side.length;

  return (
    <>
      <div className={`grid h-[240px] gap-2.5 sm:h-[300px] ${side.length ? "sm:grid-cols-[2fr_1fr]" : ""}`}>
        <button
          type="button"
          onClick={() => setOpen(0)}
          className="group relative overflow-hidden rounded-2xl bg-[#e5e7eb] sm:row-span-2"
          aria-label={`Open photos of ${name}`}
        >
          <Image src={main} alt={name} fill priority sizes="(min-width: 1024px) 560px, (min-width: 640px) 66vw, 100vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
          <span className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white">
            <Expand className="size-3.5" aria-hidden /> Click to expand
          </span>
          <span className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-medium whitespace-nowrap text-white">
            <ImageIcon className="size-4" aria-hidden /> {count} Photos →
          </span>
        </button>
        {side.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setOpen(i + 1)}
            className="group relative hidden overflow-hidden rounded-2xl bg-[#e5e7eb] sm:block"
            aria-label={`Open photo ${i + 2}`}
          >
            <Image src={src} alt="" fill sizes="280px" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
            {i === side.length - 1 && hidden > 0 && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-base font-semibold text-white">
                +{hidden} more
              </span>
            )}
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${name} photos`}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-3 sm:p-6"
          onClick={(e) => e.target === e.currentTarget && setOpen(null)}
        >
          {/* A centred dark panel over the dimmed page, as on ezweddingz. Swipe left/right on phones. */}
          <div
            className="relative aspect-4/3 max-h-[75dvh] w-full max-w-[1024px] overflow-hidden rounded-2xl bg-[#111] shadow-2xl sm:aspect-auto sm:h-[min(80dvh,640px)]"
            onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX === null || count < 2) return;
              const dx = e.changedTouches[0].clientX - touchX;
              if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
              setTouchX(null);
            }}
          >
            <Image key={images[open]} src={images[open]} alt={`${name} photo ${open + 1}`} fill sizes="(min-width: 1024px) 1024px, 100vw" className="object-contain" />
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="absolute top-3 right-3 flex size-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              <X className="size-5" aria-hidden />
            </button>
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous photo"
                  className="absolute top-1/2 left-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                >
                  <ChevronLeft className="size-6" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next photo"
                  className="absolute top-1/2 right-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                >
                  <ChevronRight className="size-6" aria-hidden />
                </button>
              </>
            )}
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white tabular-nums">
              {open + 1} / {count}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
