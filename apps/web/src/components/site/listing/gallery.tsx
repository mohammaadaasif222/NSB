"use client";

import Image from "next/image";
import { Expand, ImageIcon } from "lucide-react";
import { useState } from "react";
import { opensPhotoList, PhotoList, PhotoViewer } from "@/components/site/photo-modals";

/**
 * Photo collage (one large + two small, as on ezweddingz) with a popup viewer in the same style.
 * Phones get a full-width swipeable strip of every photo instead, which opens the list of all photos
 * (as on the real estate pages).
 */
export function Gallery({ name, images }: { name: string; images: string[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const [list, setList] = useState(false);
  const [slide, setSlide] = useState(0);
  const count = images.length;
  const show = (i: number) => (opensPhotoList() ? setList(true) : setOpen(i));

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
      <div className="relative -mx-4 sm:hidden">
        <div
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => setSlide(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        >
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => show(i)}
              className="relative aspect-4/3 w-full shrink-0 snap-center bg-[#e5e7eb]"
              aria-label={`Open photo ${i + 1} of ${name}`}
            >
              <Image src={src} alt={i === 0 ? name : ""} fill priority={i === 0} sizes="100vw" className="object-cover" />
            </button>
          ))}
        </div>
        {count > 1 && (
          <span className="pointer-events-none absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white tabular-nums">
            <ImageIcon className="size-3.5" aria-hidden /> {slide + 1} / {count}
          </span>
        )}
      </div>

      <div className={`hidden h-[300px] gap-2.5 sm:grid ${side.length ? "sm:grid-cols-[2fr_1fr]" : ""}`}>
        <button
          type="button"
          onClick={() => show(0)}
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
            onClick={() => show(i + 1)}
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

      {open !== null && <PhotoViewer name={name} images={images} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
      {list && <PhotoList name={name} images={images} onClose={() => setList(false)} />}
    </>
  );
}
