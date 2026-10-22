import { Plus_Jakarta_Sans } from "next/font/google";
import type { Banner } from "@nsb/shared";
import { CookieBar } from "@/components/site/cookie-bar";
import { HERO_FALLBACK } from "@/components/site/nsb-home/content";
import type { HeroSlide } from "@/components/site/nsb-home/hero-slides";
import {
  BestDeals,
  BottomNav,
  BrandStores,
  Categories,
  Faqs,
  HeroBanners,
  Highlights,
  HomeFooter,
  HomeHeader,
  JohriBazaar,
  PopularMarkets,
  TopPicks,
} from "@/components/site/nsb-home/sections";
import { api } from "@/lib/api";
import { getSiteSettings, whatsappHref } from "@/lib/site-settings";
import "./home.css";

// Banners are edited in the admin panel, so read them on each request like the other public pages.
export const dynamic = "force-dynamic";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], weight: ["400", "500", "700", "800"] });

/** Gradients for banners without an image, in the demo's order. */
const SLIDE_COLORS = ["s1", "s2", "s3"];

/** Active banners from Admin › Banners; the demo's slides when there are none. */
function heroSlides(banners: Banner[]): HeroSlide[] {
  const active = banners.filter((b) => b.isActive);
  if (!active.length) return HERO_FALLBACK.map((s, i) => ({ ...s, key: `fallback-${i}`, image: null }));
  return active.map((b, i) => ({
    key: b.id,
    image: b.imageUrl ?? b.mobileImageUrl,
    cls: SLIDE_COLORS[i % SLIDE_COLORS.length],
    tag: null,
    heading: b.heading,
    text: b.subheading,
    cta: b.ctaLabel,
    link: b.ctaLink ?? "#",
  }));
}

/** The home page from "NSB Live Demo.html", with its own header and footer. */
export default async function HomePage() {
  const [banners, { whatsapp }] = await Promise.all([api.get<Banner[]>("/banners"), getSiteSettings()]);

  return (
    <div className={`nsb-home ${jakarta.variable}`}>
      <HomeHeader />
      <main>
        <HeroBanners slides={heroSlides(banners)} />
        <Categories />
        <PopularMarkets />
        <Highlights />
        <TopPicks />
        <BrandStores />
        <JohriBazaar />
        <BestDeals />
      </main>
      <Faqs />
      <HomeFooter />
      <BottomNav whatsappHref={whatsapp ? whatsappHref(whatsapp) : null} />
      <CookieBar />
    </div>
  );
}
