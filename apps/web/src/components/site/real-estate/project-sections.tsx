"use client";

import Image from "next/image";
import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import { type ProjectConfiguration, type VideoChapter, youTubeId } from "@nsb/shared";
import { opensPhotoList, PhotoList, PhotoViewer } from "@/components/site/photo-modals";
import { priceText, sqftText } from "./format";
import { BuildingArt } from "./project-art";
import { type LeadTarget, LeadButton } from "./lead-dialog";

/** Escape closes an overlay and the page behind it stops scrolling. */
function useOverlay(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
}

/** Grid placement for 1–4 photos; five or more use the default 2×2 + 4 layout. */
const PLACES: Record<number, [col: string, row: string][]> = {
  1: [["1/-1", "1/-1"]],
  2: [
    ["1/3", "1/3"],
    ["3/5", "1/3"],
  ],
  3: [
    ["1/3", "1/3"],
    ["3/5", "1/2"],
    ["3/5", "2/3"],
  ],
  4: [
    ["1/3", "1/3"],
    ["3/5", "1/2"],
    ["3/4", "2/3"],
    ["4/5", "2/3"],
  ],
};

/**
 * Up to five photos in a mosaic with the badges on the first, and "Show all photos". Desktops open
 * the photo viewer (as on the wedding pages), phones the list of every photo.
 */
export function ProjectGallery({ name, photos, tags }: { name: string; photos: string[]; tags: ReactNode }) {
  const [open, setOpen] = useState<number | null>(null);
  const [list, setList] = useState(false);
  const show = (i: number) => (opensPhotoList() ? setList(true) : setOpen(i));
  const shown = photos.slice(0, 5);
  const places = PLACES[photos.length];

  if (shown.length === 0) {
    return (
      <div className="re-gal">
        <figure className="n0">
          <div className="re-ph0">
            <BuildingArt />
          </div>
          {tags}
        </figure>
      </div>
    );
  }
  return (
    <>
      {/* The mosaic's places are CSS variables so phones can drop them and swipe through the photos instead. */}
      <div className="re-galw">
        <div className="re-gal">
          {shown.map((url, i) => (
            <figure key={url} style={places ? ({ "--gc": places[i]![0], "--gr": places[i]![1] } as CSSProperties) : undefined}>
              <Image src={url} alt={i === 0 ? name : ""} fill priority={i === 0} sizes={i === 0 ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 100vw, 25vw"} />
              <button type="button" className="open" onClick={() => show(i)} aria-label={`Open photo ${i + 1} of ${photos.length}`} />
              {i === 0 && tags}
            </figure>
          ))}
        </div>
        {photos.length > 1 && (
          <button type="button" className="re-all" onClick={() => show(0)}>
            ▦ Show all photos{photos.length > 5 ? ` (${photos.length})` : ""}
          </button>
        )}
      </div>
      {open !== null && <PhotoViewer name={name} images={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
      {list && <PhotoList name={name} images={photos} onClose={() => setList(false)} />}
    </>
  );
}

/** About paragraphs, clamped to four lines until "Show more". */
export function AboutText({ paragraphs }: { paragraphs: string[] }) {
  const long = paragraphs.join(" ").length > 320;
  const [clamped, setClamped] = useState(long);
  return (
    <>
      <div className={`re-ab${clamped ? " cl" : ""}`}>
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {long && (
        <button type="button" className="re-lnk" onClick={() => setClamped((c) => !c)} aria-expanded={!clamped}>
          {clamped ? "Show more" : "Show less"}
        </button>
      )}
    </>
  );
}

/**
 * A grid that shows its first items until "Show all": `desktop` of them on wide screens (all when
 * omitted) and `phone` on phones (6 = three rows of two, 3 = three rows of one). The cut is CSS,
 * so the server-rendered page has every item.
 */
export function MoreGrid({
  className,
  items,
  noun,
  desktop,
  phone = 6,
  as: Tag = "div",
}: {
  className: string;
  items: ReactNode[];
  noun: string;
  desktop?: number;
  phone?: 3 | 6;
  as?: "div" | "dl";
}) {
  const [open, setOpen] = useState(false);
  const phoneOnly = items.length <= (desktop ?? Infinity);
  return (
    <>
      <Tag className={`${className} re-mg p${phone}${desktop ? ` d${desktop}` : ""}${open ? " open" : ""}`}>{items}</Tag>
      {items.length > phone && (
        <button type="button" className={`re-lnk re-mgb${phoneOnly ? " m" : ""}`} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          {open ? "Show less" : `Show all ${items.length} ${noun}`}
        </button>
      )}
    </>
  );
}

export function Amenities({ items, icon }: { items: string[]; icon: ReactNode }) {
  return (
    <MoreGrid
      className="re-amg"
      noun="amenities"
      desktop={9}
      items={items.map((a) => (
        <div key={a} className="re-am">
          {icon}
          {a}
        </div>
      ))}
    />
  );
}

/** Line drawing shown when a configuration has no plan image yet. */
function PlanArt() {
  return (
    <svg viewBox="0 0 260 170" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="6" y="6" width="248" height="158" rx="4" />
      <path d="M6 86h130M136 6v158M136 62h118M196 62v102" />
      <g fill="currentColor" stroke="none" fontSize="9" fontFamily="sans-serif" textAnchor="middle">
        <text x="71" y="48">Living</text>
        <text x="71" y="130">Bedroom 1</text>
        <text x="195" y="38">Kitchen</text>
        <text x="166" y="118">Bed 2</text>
        <text x="225" y="118">Bath</text>
      </g>
    </svg>
  );
}

/** Configuration tabs, 2D/3D plan with zoom, and the pricing table for every configuration. */
export function FloorPlans({ configurations, lead }: { configurations: ProjectConfiguration[]; lead: Omit<LeadTarget, "source"> }) {
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<"2d" | "3d">(() => (configurations[0]?.plan3dUrl && !configurations[0].plan2dUrl ? "3d" : "2d"));
  const [zoom, setZoom] = useState(false);
  const closeZoom = () => setZoom(false);
  useOverlay(zoom, closeZoom);

  const current = configurations[index]!;
  const plan = mode === "3d" ? current.plan3dUrl : current.plan2dUrl;
  const choose = (i: number) => {
    setIndex(i);
    // A configuration with only a 3D plan opens on it.
    setMode(configurations[i]!.plan3dUrl && !configurations[i]!.plan2dUrl ? "3d" : "2d");
  };

  return (
    <>
      <div className="re-ft" role="group" aria-label="Configurations">
        {configurations.map((c, i) => (
          <button key={`${c.title}-${i}`} type="button" className="re-ftb" aria-pressed={i === index} onClick={() => choose(i)}>
            {c.title}
          </button>
        ))}
      </div>
      <div className="re-vt" role="group" aria-label="Plan type">
        <button type="button" aria-pressed={mode === "2d"} onClick={() => setMode("2d")}>
          2D Plan
        </button>
        <button type="button" aria-pressed={mode === "3d"} onClick={() => setMode("3d")}>
          3D Plan
        </button>
      </div>
      {plan ? (
        <button type="button" className="re-fr" onClick={() => setZoom(true)} aria-label={`View the ${current.title} ${mode.toUpperCase()} plan larger`}>
          <span className="im">
            <Image src={plan} alt={`${current.title} ${mode.toUpperCase()} floor plan`} fill sizes="(max-width: 960px) 100vw, 800px" />
          </span>
          <span className="zm">⤢ View larger</span>
        </button>
      ) : (
        <div className="re-fr">
          <div className="re-nofp">
            <PlanArt />
            <p>The {mode.toUpperCase()} plan will be shared on request.</p>
          </div>
        </div>
      )}
      <div className="re-fa">
        <LeadButton className="re-btn o" {...lead} source="Callback">
          Request callback
        </LeadButton>
        <LeadButton className="re-btn o" {...lead} source="Price sheet">
          Request price sheet
        </LeadButton>
      </div>

      <h3 className="re-pth">Pricing for all configurations</h3>
      <div className="re-ptw">
        <table className="re-pt2">
          <thead>
            <tr>
              <th scope="col">Configuration</th>
              <th scope="col">Super area</th>
              <th scope="col">Carpet area</th>
              <th scope="col">Rate</th>
              <th scope="col">Price</th>
              <th scope="col">
                <span className="sr-only">Plan</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {configurations.map((c, i) => (
              <tr key={`${c.title}-${i}`} className={i === index ? "on" : undefined}>
                <td className="t">
                  <b className="c">{c.title}</b>
                </td>
                {/* data-label names each value when phones show a row as a card. */}
                <td data-label="Super area">{c.superArea ? sqftText(c.superArea) : "–"}</td>
                <td data-label="Carpet area">{c.carpetArea ? sqftText(c.carpetArea) : "–"}</td>
                <td data-label="Rate">{c.price && c.superArea ? `₹${(c.price / c.superArea / 1000).toFixed(1)}K/sq ft` : "–"}</td>
                <td data-label="Price">
                  <b>{c.price ? priceText(c.price) : "On request"}</b>
                </td>
                <td className="pl">
                  <a
                    href="#fp"
                    className="re-btn o"
                    onClick={() => choose(i)}
                  >
                    View plan
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {zoom && plan && (
        <div className="re-zm2" role="dialog" aria-modal="true" aria-label={`${current.title} floor plan`} onClick={closeZoom}>
          <button type="button" className="re-x" onClick={closeZoom} aria-label="Close">
            ×
          </button>
          <div className="zb">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={plan} alt={`${current.title} ${mode.toUpperCase()} floor plan`} />
          </div>
        </div>
      )}
    </>
  );
}

export interface ProjectVideoItem {
  title: string;
  url: string;
  chapters: VideoChapter[];
}

/**
 * The main video and up to four more, with chapters. YouTube (privacy-enhanced) loads only when a
 * video is played; a chapter starts the video at its time.
 */
export function ProjectVideos({ videos }: { videos: ProjectVideoItem[] }) {
  const [index, setIndex] = useState(0);
  const [start, setStart] = useState<number | null>(null);
  const video = videos[index]!;
  const id = youTubeId(video.url);
  const chapter = start === null ? null : [...video.chapters].reverse().find((c) => c.seconds <= start) ?? null;

  const select = (i: number) => {
    setIndex(i);
    setStart(null);
  };
  const thumb = (url: string) => {
    const vid = youTubeId(url);
    return vid ? `https://i.ytimg.com/vi/${vid}/hqdefault.jpg` : null;
  };

  return (
    <div className={`re-vp${videos.length > 1 ? "" : " one"}`}>
      <div>
        {start !== null && id ? (
          <div className="re-pl4">
            <iframe
              key={`${id}-${start}`}
              src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1&start=${start}`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <button type="button" className="re-pl4" onClick={() => setStart(0)} aria-label={`Play ${video.title}`}>
            {thumb(video.url) && <Image src={thumb(video.url)!} alt="" fill sizes="(max-width: 960px) 100vw, 560px" />}
            {video.chapters[0] && <span className="cap">{video.chapters[0].title}</span>}
            <span className="big" aria-hidden>
              ▶
            </span>
          </button>
        )}
        <h3 className="re-vt2">{video.title}</h3>
        <p className="re-vd2">{video.chapters.length ? `${video.chapters.length} chapters. Tap a chapter to jump to it.` : "Video"}</p>
        {video.chapters.length > 0 && (
          <div className="re-chs">
            {video.chapters.map((c) => (
              <button key={`${c.time}-${c.title}`} type="button" aria-pressed={chapter === c} onClick={() => setStart(c.seconds)}>
                <b>{c.time}</b>
                {c.title}
              </button>
            ))}
          </div>
        )}
      </div>
      {videos.length > 1 && (
        <div className="re-pls">
          {videos.map((v, i) => (
            <button key={`${v.url}-${i}`} type="button" className="re-pi" aria-pressed={i === index} onClick={() => select(i)}>
              <span className="tm">{thumb(v.url) && <Image src={thumb(v.url)!} alt="" fill sizes="112px" />}</span>
              <span>
                <b>{v.title}</b>
                <small>{v.chapters.length ? `${v.chapters.length} chapters` : "Video"}</small>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
