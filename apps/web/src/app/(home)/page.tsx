import type { Metadata } from "next";
import { jakarta } from "@/lib/fonts";
import type { Banner, Category } from "@nsb/shared";
import { Analytics } from "@/components/site/analytics";
import { CookieBar } from "@/components/site/cookie-bar";
import { MobileTabBar } from "@/components/site/mobile-tab-bar";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { HERO_FALLBACK } from "@/components/site/nsb-home/content";
import type { HeroSlide } from "@/components/site/nsb-home/hero-slides";
import {
  BestDeals,
  BrandStores,
  Categories,
  Faqs,
  HeroBanners,
  Highlights,
  JohriBazaar,
  PopularMarkets,
  TopPicks,
} from "@/components/site/nsb-home/sections";
import { api } from "@/lib/api";
import { getListingCounts, getSiteLocation } from "@/lib/location-server";
import { getSiteSettings, whatsappHref } from "@/lib/site-settings";
import "./home.css";

export const metadata: Metadata = { alternates: { canonical: "/" } };


/** Gradients for banners without an image, in the demo's order. */
const SLIDE_COLORS = ["s1", "s2", "s3"];

/** Active banners from Admin › Banners; the demo's slides when there are none. */
function heroSlides(banners: Banner[]): HeroSlide[] {
  const active = banners.filter((b) => b.isActive);
  if (!active.length) return HERO_FALLBACK.map((s, i) => ({ ...s, key: `fallback-${i}`, image: null, mobileImage: null }));
  return active.map((b, i) => ({
    key: b.id,
    image: b.imageUrl ?? b.mobileImageUrl,
    mobileImage: b.mobileImageUrl,
    cls: SLIDE_COLORS[i % SLIDE_COLORS.length],
    tag: null,
    heading: b.heading,
    text: b.subheading,
    cta: b.ctaLabel,
    link: b.ctaLink ?? "#",
  }));
}

/** The home page from "NSB Live Demo.html", with the site-wide header and footer. */
export default async function HomePage() {
  const location = await getSiteLocation();
  const [banners, categories, { whatsapp, homeCards, footer }, counts] = await Promise.all([
    // Without these the page still works, on its default slides and sections.
    api.get<Banner[]>("/banners").catch((): Banner[] => []),
    // Active top-level categories, in the order set in Admin › Home page.
    api.get<Category[]>("/categories").catch((): Category[] => []),
    getSiteSettings(),
    // Shown only with a location.
    location ? getListingCounts(location) : {},
  ]);

  return (
    <div className={`nsb-home ${jakarta.variable}`}>
      <SiteHeader location={location} />
      <main>
        <HeroBanners slides={heroSlides(banners)} cards={homeCards} />
        <Categories categories={categories} counts={counts} location={location} />
        <PopularMarkets />
        <Highlights />
        <TopPicks />
        {/* <BrandStores /> */}
        {/* <JohriBazaar /> */}
        <BestDeals />
      </main>
      <Faqs />
      <SiteFooter categories={categories} footer={footer} />
      <CookieBar />
      <Analytics />
      <MobileTabBar whatsappHref={whatsapp ? whatsappHref(whatsapp) : null} />
    </div>
  );
}
