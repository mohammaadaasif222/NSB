import { Plus_Jakarta_Sans } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import type { SiteLocation } from "@/lib/location";
import { LocationPicker } from "./location-picker";
import { SiteMenu } from "./site-menu";
import { Icon } from "./nsb-home/bits";
import { ICON, LOGO } from "./nsb-home/content";
import "./site-header.css";

// The demo's typeface, loaded here too so the header looks the same on pages that don't load it.
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

/**
 * Header from "NSB Live Demo.html", on the home page and every other page. The location picker
 * filters every page; search, cart and login are shown as designed but not wired up (not Phase-1).
 */
export function SiteHeader({ location }: { location: SiteLocation | null }) {
  return (
    <header className={`nsb-hd ${jakarta.variable}`}>
      <div className="hw bar">
        <Link className="logo" href="/" aria-label="Noida Super Bazaar">
          <Image src={LOGO} alt="Noida Super Bazaar" width={560} height={283} priority />
        </Link>
        <label className="sb">
          <Icon d={ICON.search} size={18} />
          <input type="search" placeholder="Search wedding venues, salons, AC repair…" aria-label="Search" />
        </label>
        <LocationPicker current={location} />
        <a className="ct" href="#" aria-label="Cart">
          <Icon d={ICON.bag} />
          <i>0</i>
        </a>
        <a className="lg" href="#">
          Login
        </a>
        <SiteMenu />
      </div>
    </header>
  );
}
