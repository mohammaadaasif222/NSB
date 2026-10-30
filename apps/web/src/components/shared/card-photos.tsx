"use client";

import Image from "next/image";
import { useState } from "react";
import { Crown, ImageOff, Star } from "lucide-react";

/** The most photos a card flips through: the cover and the gallery thumbnails. */
const MAX_PHOTOS = 5;

/**
 * A card's photos: hovering a thumbnail shows it in the big photo on desktops, and phones get
 * dots instead of thumbnails. Both sit above the card's stretched link.
 */
export function CardPhotos({
  name,
  cover,
  gallery,
  badge,
  sizes,
}: {
  name: string;
  cover: string | null;
  gallery: string[];
  badge: "elite" | "featured" | null;
  sizes: string;
}) {
  const photos = [...new Set([...(cover ? [cover] : []), ...gallery])].slice(0, MAX_PHOTOS);
  const thumbs = photos.slice(1);
  const [picked, setPicked] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const shown = photos[hovered ?? picked];

  return (
    <div className="lp-media">
      <div className="lp-big">
        {shown ? (
          <Image src={shown} alt="" fill sizes={sizes} />
        ) : (
          <span className="lp-noimg">
            <ImageOff className="size-8" aria-hidden />
          </span>
        )}
        {badge === "elite" && (
          <span className="lp-star" title="Elite">
            <Star className="size-3.5 fill-current" aria-hidden />
            <span className="sr-only">Elite</span>
          </span>
        )}
        {badge === "featured" && (
          <span className="lp-ribbon">
            <Crown className="size-3.5" aria-hidden /> Featured
          </span>
        )}
        {photos.length > 1 && (
          <div className="lp-dots">
            {photos.map((url, i) => (
              <button key={url} type="button" aria-pressed={i === picked} aria-label={`Photo ${i + 1} of ${name}`} onClick={() => setPicked(i)}>
                <i />
              </button>
            ))}
          </div>
        )}
      </div>
      {thumbs.length > 0 && (
        <div className="lp-th" onMouseLeave={() => setHovered(null)}>
          {thumbs.map((url, i) => (
            <button
              key={url}
              type="button"
              aria-pressed={i + 1 === (hovered ?? picked)}
              aria-label={`Photo ${i + 2} of ${name}`}
              onMouseEnter={() => setHovered(i + 1)}
              onClick={() => setPicked(i + 1)}
            >
              <Image src={url} alt="" fill sizes="60px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
