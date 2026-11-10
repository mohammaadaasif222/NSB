import { jakarta } from "@/lib/fonts";
import Image from "next/image";
import Link from "next/link";
import { getSearchCategories } from "@/lib/catalog";
import type { SiteLocation } from "@/lib/location";
import { HeaderSearch } from "./header-search";
import { LocationPicker } from "./location-picker";
import { SiteMenu } from "./site-menu";
import { LOGO } from "./nsb-home/content";
import "./site-header.css";

// The demo's typeface, loaded here too so the header looks the same on pages that don't load it.

/**
 * Header from "NSB Live Demo.html", on the home page and every other page. The location picker
 * filters every page and search finds categories, vendors and projects; login is shown as
 * designed but not wired up (not Phase-1).
 */
export async function SiteHeader({ location }: { location: SiteLocation | null }) {
  const categories = await getSearchCategories();
  return (
    <header className={`nsb-hd ${jakarta.variable}`}>
      <div className="hw bar">
        <Link className="logo" href="/" aria-label="Noida Super Bazaar">
          <Image src={LOGO} alt="Noida Super Bazaar" width={99} height={50} priority />
        </Link>
        <HeaderSearch categories={categories} />
        <LocationPicker current={location} />
        <a className="lg" href="#">
          Login
        </a>
        <SiteMenu />
      </div>
    </header>
  );
}
