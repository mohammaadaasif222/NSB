import { Crown } from "lucide-react";
import type { EliteBanner as Banner } from "@nsb/shared";
import "./listing-page.css";

/** The black and gold banner above the listings. Phones show the crown and the gold line only. */
export function EliteBanner({ banner }: { banner: Banner }) {
  return (
    <aside className="lp-ec" aria-label={banner.eyebrow || "Elite listings"}>
      <div className="lp-ec-l">
        <Crown className="lp-ec-crown" aria-hidden />
        <div>
          {banner.eyebrow && <p className="lp-ec-k">{banner.eyebrow}</p>}
          <p className="lp-ec-t">{banner.title}</p>
          {banner.text && <p className="lp-ec-s">{banner.text}</p>}
        </div>
      </div>
      {banner.buttonLabel && (
        <a href={banner.link || "#listings"} className="lp-ec-b">
          <Crown aria-hidden />
          {banner.buttonLabel}
        </a>
      )}
    </aside>
  );
}
