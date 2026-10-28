"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * The two photo popups shared by the wedding and real estate pages: desktops get the viewer (one
 * photo at a time, from the wedding gallery), phones the scrolling list of every photo (from the
 * real estate gallery).
 */

/** Phones open the list; wider screens the viewer. Matches Tailwind's `sm` breakpoint. */
export const opensPhotoList = () => window.matchMedia("(max-width: 639.98px)").matches;

/** Escape closes, the page behind stops scrolling, and any other keys go to `onKey`. */
function useModalKeys(onClose: () => void, onKey?: (e: KeyboardEvent) => void) {
  // The latest handlers, so the listener and scroll lock are set up once per opening.
  const handlers = useRef({ onClose, onKey });
  useEffect(() => {
    handlers.current = { onClose, onKey };
  });
  useEffect(() => {
    const handle = (e: KeyboardEvent) => (e.key === "Escape" ? handlers.current.onClose() : handlers.current.onKey?.(e));
    document.addEventListener("keydown", handle);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handle);
      document.body.style.overflow = overflow;
    };
  }, []);
}

/** A centred dark panel over the dimmed page, as on ezweddingz; arrows, arrow keys and swipes step through. */
export function PhotoViewer({ name, images, index, onIndex, onClose }: { name: string; images: string[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const [touchX, setTouchX] = useState<number | null>(null);
  const count = images.length;
  const step = (d: number) => onIndex((index + d + count) % count);
  useModalKeys(onClose, (e) => {
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${name} photos`}
      className="fixed inset-0 z-80 flex items-center justify-center bg-black sm:bg-black/70 sm:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative h-dvh w-full max-w-5xl overflow-hidden bg-[#111] sm:h-[min(80dvh,640px)] sm:rounded-2xl sm:shadow-2xl"
        onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX === null || count < 2) return;
          const dx = e.changedTouches[0].clientX - touchX;
          if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
          setTouchX(null);
        }}
      >
        <Image key={images[index]} src={images[index]} alt={`${name} photo ${index + 1}`} fill sizes="(min-width: 1024px) 1024px, 100vw" className="object-contain" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-[calc(0.75rem+env(safe-area-inset-top))] right-3 z-10 flex size-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
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
        <span className="absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white tabular-nums">
          {index + 1} / {count}
        </span>
      </div>
    </div>
  );
}

/** Every photo at its own shape, one under another on phones, over a dark backdrop. */
export function PhotoList({ name, images, onClose }: { name: string; images: string[]; onClose: () => void }) {
  useModalKeys(onClose);
  return (
    <div role="dialog" aria-modal="true" aria-label={`${name} photos`} className="fixed inset-0 z-110 overflow-auto bg-[rgba(11,10,51,0.88)] p-6" onClick={onClose}>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="fixed top-[calc(14px+env(safe-area-inset-top))] right-4 size-7.5 cursor-pointer rounded-full border-0 bg-white text-base text-[#111]"
      >
        ×
      </button>
      <div className="mx-auto my-7.5 grid max-w-250 grid-cols-1 gap-2.5 sm:grid-cols-2">
        {images.map((url, i) => (
          // Full-size photos at their own shape; plain img so any upload host works.
          // eslint-disable-next-line @next/next/no-img-element
          <img key={`${url}-${i}`} src={url} alt={`${name}, photo ${i + 1}`} loading="lazy" className="block h-auto w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
