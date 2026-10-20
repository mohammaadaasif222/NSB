"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Play, X } from "lucide-react";
import { type ListingVideo, youTubeId } from "@nsb/shared";

interface Clip {
  id: string;
  short: boolean;
  title: string;
}

const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

/** The privacy-enhanced YouTube player. allowFullScreen keeps YouTube's own full-screen button working. */
function Player({ clip, className = "" }: { clip: Clip; className?: string }) {
  return (
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${clip.id}?autoplay=1&rel=0&playsinline=1`}
      title={clip.title}
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
      className={className}
    />
  );
}

/**
 * A thumbnail that turns into the player when tapped, so the page doesn't load a YouTube iframe
 * per video up front. The corner button opens the full-screen viewer instead.
 */
function Tile({ clip, playing, onPlay, onExpand }: { clip: Clip; playing: boolean; onPlay: () => void; onExpand: () => void }) {
  const frame = `relative overflow-hidden rounded-2xl bg-black ${clip.short ? "aspect-[9/16]" : "aspect-video"}`;
  if (playing) {
    return (
      <div className={frame}>
        <Player clip={clip} className="absolute inset-0 size-full" />
      </div>
    );
  }
  return (
    <div className={`group ${frame}`}>
      <button type="button" onClick={onPlay} className="absolute inset-0 block size-full" aria-label={`Play ${clip.title}`}>
        <Image
          src={thumb(clip.id)}
          alt=""
          fill
          sizes={clip.short ? "(min-width: 1024px) 200px, 45vw" : "(min-width: 1024px) 400px, 100vw"}
          className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-black/60 text-white transition-transform group-hover:scale-110">
            <Play className="size-6 translate-x-0.5 fill-white" aria-hidden />
          </span>
        </span>
      </button>
      {clip.short && (
        <span className="pointer-events-none absolute top-3 left-3 rounded bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">Short</span>
      )}
      <button
        type="button"
        onClick={onExpand}
        aria-label={`Watch ${clip.title} full screen`}
        title="Full screen"
        className="absolute top-2.5 right-2.5 flex items-center gap-1.5 rounded-full bg-black/60 p-2 text-xs font-medium text-white hover:bg-black/80"
      >
        <Maximize2 className="size-4" aria-hidden />
        {!clip.short && <span className="hidden pr-1 sm:inline">Full screen</span>}
      </button>
    </div>
  );
}

/** Full-screen viewer: one clip at a time, with previous/next across all videos and Shorts. */
function Viewer({ clips, index, onChange, onClose, name }: { clips: Clip[]; index: number; onChange: (i: number) => void; onClose: () => void; name: string }) {
  const count = clips.length;
  const clip = clips[index];
  const step = useCallback((d: number) => onChange((index + d + count) % count), [index, count, onChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
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
  }, [step, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${name} videos`}
      className="fixed inset-0 z-[60] flex flex-col bg-black/95"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex items-center justify-between px-4 py-3 text-sm text-white">
        <span>
          {index + 1} / {count}
          {clip.short && <span className="ml-2 rounded bg-white/15 px-2 py-0.5 text-xs font-semibold">Short</span>}
        </span>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-white/10">
          <X className="size-6" aria-hidden />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-12 sm:px-20" onClick={(e) => e.target === e.currentTarget && onClose()}>
        {/* Videos fill the width (16:9, capped by the height); Shorts fill the height (9:16). */}
        <div
          key={`${clip.id}-${index}`}
          className={clip.short ? "aspect-[9/16] h-full max-w-full" : "aspect-video w-full"}
          style={clip.short ? undefined : { maxWidth: "calc((100dvh - 10rem) * 16 / 9)" }}
        >
          <Player clip={clip} className="size-full rounded-lg" />
        </div>
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous video"
              className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white hover:bg-white/25 sm:left-4"
            >
              <ChevronLeft className="size-7" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next video"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white hover:bg-white/25 sm:right-4"
            >
              <ChevronRight className="size-7" aria-hidden />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="no-scrollbar flex justify-center-safe gap-2 overflow-x-auto px-4 py-3">
          {clips.map((c, i) => (
            <button
              key={`${c.id}-${i}`}
              type="button"
              onClick={() => onChange(i)}
              aria-label={c.title}
              aria-current={i === index}
              className={`relative h-14 shrink-0 overflow-hidden rounded-md opacity-50 aria-[current=true]:opacity-100 aria-[current=true]:ring-2 aria-[current=true]:ring-white ${c.short ? "w-8" : "w-24"}`}
            >
              <Image src={thumb(c.id)} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Videos (16:9, two per row) followed by Shorts (9:16, up to four per row), with a full-screen viewer. */
export function Videos({ name, videos }: { name: string; videos: ListingVideo[] }) {
  const [playing, setPlaying] = useState<number | null>(null);
  const [viewing, setViewing] = useState<number | null>(null);

  const parsed = videos.flatMap((v) => {
    const id = youTubeId(v.url);
    return id ? [{ id, short: v.kind === "short" }] : [];
  });
  const long = parsed.filter((c) => !c.short).map((c, i) => ({ ...c, title: `${name} video ${i + 1}` }));
  const shorts = parsed.filter((c) => c.short).map((c, i) => ({ ...c, title: `${name} short ${i + 1}` }));
  // One list in the order shown on the page, so the viewer's next/previous follows it.
  const clips: Clip[] = [...long, ...shorts];

  const expand = (i: number) => {
    setPlaying(null); // stop the in-page player so two don't play at once
    setViewing(i);
  };
  const tile = (clip: Clip, i: number) => (
    <li key={`${clip.id}-${i}`}>
      <Tile clip={clip} playing={playing === i} onPlay={() => setPlaying(i)} onExpand={() => expand(i)} />
    </li>
  );

  return (
    <div className="flex flex-col gap-6">
      {long.length > 0 && <ul className="grid gap-4 sm:grid-cols-2">{long.map((c, i) => tile(c, i))}</ul>}
      {shorts.length > 0 && (
        <div className="flex flex-col gap-3">
          {long.length > 0 && <h3 className="text-base font-semibold text-ink">Shorts</h3>}
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">{shorts.map((c, i) => tile(c, long.length + i))}</ul>
        </div>
      )}
      {viewing !== null && <Viewer clips={clips} index={viewing} onChange={setViewing} onClose={() => setViewing(null)} name={name} />}
    </div>
  );
}
