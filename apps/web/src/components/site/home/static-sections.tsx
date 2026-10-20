import Image from "next/image";
import { ChevronRight, Clock, MapPin, ShieldCheck, Star, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { ScrollRow } from "./scroll-row";

/*
 * Home sections that are static content from the design (index.html). Only the hero
 * banner and the category grid are managed from the admin panel in Phase-1.
 * On phones they follow an app layout: left-aligned titles, tighter spacing and swipeable rows.
 */

export function SectionHeading({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:items-center sm:gap-2 sm:text-center">
      <h2 className="flex items-center gap-2 text-lg leading-7 font-bold text-ink sm:justify-center sm:text-[25px] sm:leading-9">
        {icon}
        {title}
      </h2>
      {subtitle && <p className="text-sm leading-5 text-muted sm:text-base sm:leading-6">{subtitle}</p>}
    </div>
  );
}

/** Section spacing: compact on phones, as designed on larger screens. */
const SECTION = "py-6 sm:py-10";
const STACK = "container-page flex flex-col gap-4 sm:gap-8 lg:gap-10";

const TILES = [
  { title: "Top Deals", text: "Up to 60% off on services", bg: "#fff7ed", border: "#ffedd5", iconBg: "#f97316", Icon: Sun },
  { title: "NSB Verified", text: "Trusted partner services", bg: "#ecfdf5", border: "#d1fae5", iconBg: "#10b981", Icon: ShieldCheck },
  { title: "Trending", text: "Limited time offers", bg: "#eef2ff", border: "#e0e7ff", iconBg: "#6366f1", Icon: Star },
];

/** Beside the hero on desktops (matching its height); three compact app-style shortcuts on phones. */
export function SideTiles() {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:h-[285px] lg:grid-cols-1 lg:grid-rows-3 lg:gap-4 xl:h-[310px] 2xl:h-[370px]">
      {TILES.map(({ title, text, bg, border, iconBg, Icon }) => (
        <a
          key={title}
          href="#"
          className="flex flex-col items-center gap-2 rounded-xl border px-2 py-3 text-center transition-shadow hover:shadow-md sm:flex-row sm:gap-4 sm:rounded-2xl sm:px-4 sm:text-left lg:px-[25px] lg:py-0"
          style={{ background: bg, borderColor: border }}
        >
          <span className="flex shrink-0 rounded-xl p-2 sm:p-3" style={{ background: iconBg }}>
            <Icon className="size-5 text-white sm:size-6" fill={title === "Trending" ? "white" : "none"} aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] leading-4 font-bold text-[#1f2937] sm:text-lg sm:leading-7">{title}</span>
            <span className="hidden text-sm leading-5 text-[#4b5563] sm:block">{text}</span>
          </span>
        </a>
      ))}
    </div>
  );
}

const MARKETS = [
  ["Sector 18", "sector18"],
  ["Jagat Farm", "jagat-farm"],
  ["Gaur City", "gaur-city"],
  ["Brahmaputra", "brahmaputra"],
  ["Pari Chowk", "pari-chowk"],
  ["Indirapuram", "indirapuram"],
  ["Atta Market", "atta"],
  ["Noida Extension", "noida-ext"],
];

export function PopularMarkets() {
  return (
    <section className={`bg-white ${SECTION}`}>
      <div className={STACK}>
        <SectionHeading title="Popular Markets in Noida" subtitle="Discover local shops and services by area" />
        <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:gap-2 sm:px-0 lg:justify-between">
          {MARKETS.map(([name, file], i) => (
            <li key={file} className="shrink-0 snap-start lg:flex-1">
              <a href="#" className="group flex w-[76px] flex-col items-center sm:w-[100px] lg:w-auto">
                <span className="block pb-2 transition-transform group-hover:scale-105 sm:pb-3">
                  <span
                    className={`block size-[72px] rounded-full border-2 p-1 sm:size-[100px] sm:p-1.5 ${i === 0 ? "border-[#3b82f6]" : "border-transparent"}`}
                  >
                    <span className="relative block size-full overflow-hidden rounded-full bg-[#e5e7eb]">
                      <Image src={`/images/home/market-${file}.jpg`} alt="" fill sizes="(min-width: 640px) 88px, 64px" className="object-cover" />
                    </span>
                  </span>
                </span>
                <span className="text-center text-[11px] leading-4 font-semibold text-ink-soft sm:text-xs sm:whitespace-nowrap">{name}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="flex sm:justify-center">
          <a href="#" className="flex items-center gap-1 text-sm leading-6 font-bold text-brand sm:text-base">
            <MapPin className="size-5" aria-hidden />
            View All Markets
          </a>
        </div>
      </div>
    </section>
  );
}

const HIGHLIGHTS = ["NSB Spotlight", "Hot Deals Near You", "Recommended", "Trending in Noida"];

/** The dark-blue "NSB Spotlight" row: swipe on phones, arrows on desktop. */
export function Highlights() {
  return (
    <section className="bg-night">
      <div className="container-page py-6 sm:py-10">
        <ScrollRow label="Highlights" tone="dark" className="-mx-4 gap-3 px-4 sm:mx-0 sm:gap-4 sm:px-0">
          {HIGHLIGHTS.map((title, i) => (
            <li
              key={title}
              className="flex h-[202px] w-[78vw] max-w-[320px] shrink-0 snap-start flex-col overflow-clip rounded-xl bg-night shadow-[0px_4px_8px_0px_rgba(162,162,162,0.1)] outline -outline-offset-1 outline-[#374151] sm:w-[320px]"
            >
              <div className="relative h-[124px] w-full bg-[#334155]">
                <Image src={`/images/home/highlight-${i + 1}.jpg`} alt="" fill sizes="320px" className="object-cover" />
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 flex-col gap-2">
                  <h3 className="truncate text-base font-bold text-white sm:text-lg">{title}</h3>
                  <p className="text-xs leading-4 text-white opacity-70">Limited time offers</p>
                </div>
                <a
                  href="#"
                  className="flex h-9 shrink-0 items-center rounded-lg border border-muted px-3 text-sm leading-5 font-bold whitespace-nowrap text-white transition-colors hover:bg-white/10 sm:px-4"
                >
                  Explore more
                </a>
              </div>
            </li>
          ))}
        </ScrollRow>
      </div>
    </section>
  );
}

const PICKS = [
  { name: "Luxury Salon & Spa", area: "Sector 16, Noida", category: "Beauty & Wellness" },
  { name: "Cool AC Service", area: "Sector 16, Noida", category: "AC Repair" },
  { name: "ABC Realtech", area: "Sector 16, Noida", category: "Real Estate" },
  { name: "Finwing loans", area: "Sector 2, Noida", category: "Loans & Finance" },
];

/** Four cards: 2×2 on phones, one row on desktops, then "View more". */
export function TopPicks() {
  return (
    <section className={`bg-white ${SECTION}`}>
      <div className={STACK}>
        <SectionHeading
          title="NSB Verified – Top Picks"
          subtitle="Discover local shops and services by area"
          icon={<ShieldCheck className="size-6 shrink-0 text-brand sm:size-8" aria-hidden />}
        />
        <ul className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4 lg:gap-8">
          {PICKS.map((pick, i) => (
            <li
              key={pick.name}
              className="flex min-w-0 flex-col overflow-clip rounded-xl bg-white shadow-[0px_4px_8px_0px_rgba(0,0,0,0.1)] outline -outline-offset-1 outline-line transition-transform hover:-translate-y-1 sm:rounded-2xl"
            >
              <div className="relative h-28 bg-[#dbeafe] sm:h-48">
                <Image
                  src={`/images/home/pick-${i + 1}.jpg`}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
                <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-brand px-1.5 py-0.5 text-[10px] leading-[15px] font-bold text-white sm:top-4 sm:right-4 sm:px-2 sm:py-1">
                  <ShieldCheck className="size-3" aria-hidden />
                  Verified
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2.5 p-2.5 sm:gap-4 sm:p-4">
                <div className="flex flex-col gap-1 sm:gap-2">
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                    <h3 className="truncate text-sm font-semibold text-ink sm:text-base">{pick.name}</h3>
                    <span className="flex shrink-0 items-center text-xs">
                      <Star className="size-4 fill-[#fbbf24] text-[#fbbf24]" strokeWidth={1} aria-hidden />
                      <span className="pl-1 font-bold text-ink">4.8</span>
                      <span className="text-[#9ca3af]">(320)</span>
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-ink sm:text-sm">{pick.area}</p>
                  <p className="text-xs text-muted sm:text-sm">{pick.category}</p>
                </div>
                <a
                  href="#"
                  className="mt-auto flex h-8 items-center justify-center rounded-lg bg-brand px-3 text-xs leading-5 font-bold text-white transition-colors hover:bg-brand-dark sm:h-9 sm:px-4 sm:text-sm"
                >
                  View Deal
                </a>
              </div>
            </li>
          ))}
        </ul>
        {/* Goes to the Top Picks listing page once it is built; static for now. */}
        <a
          href="#"
          className="mx-auto flex items-center gap-1.5 rounded-full border border-brand/30 px-5 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand-soft"
        >
          View more <ChevronRight className="size-4" aria-hidden />
        </a>
      </div>
    </section>
  );
}

export function BrandStores() {
  return (
    <section className={`bg-surface ${SECTION}`}>
      <div className={`${STACK} sm:items-center`}>
        <SectionHeading title="Brand Stores" subtitle="Trusted brand partners and premium products" />
        <ul className="grid w-full grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <li key={n} className="relative aspect-[186/88] overflow-hidden rounded-lg border border-line bg-white">
              <Image
                src={`/images/home/brand-${n}.png`}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
        <a
          href="#"
          className="rounded-lg bg-brand px-10 py-3 text-center text-base leading-6 font-bold text-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] transition-colors hover:bg-brand-dark"
        >
          Explore All Brands
        </a>
      </div>
    </section>
  );
}

export function PromoBanner() {
  return (
    <div className="w-full bg-[#e5e7eb]">
      <div className="relative mx-auto h-[150px] max-w-[1280px] overflow-hidden sm:h-[238px]">
        <Image
          src="/images/home/promo-banner.png"
          alt="NSB Johri Bazaar – premium jewellery and luxury stores"
          fill
          sizes="(min-width: 1280px) 1280px, 100vw"
          className="object-cover object-left"
        />
      </div>
    </div>
  );
}

const DEALS = [
  { title: "Lakme Salon", offer: "All services", area: "Sector 16, Noida" },
  { title: "AC Gas Refilling", offer: "Starting @ ₹599", area: "Sector 62, Noida" },
  { title: "Home Interior", offer: "On Modular kitchen", area: "Sector 93, Noida" },
  { title: "Home Loans", offer: "Low interest rate", area: "All over Noida" },
];

export function BestDeals() {
  return (
    <section className={`bg-white ${SECTION}`}>
      <div className={STACK}>
        <SectionHeading
          title="Today's Best Deals"
          subtitle="Flash offers updated daily - Grab them before they're gone!"
          icon={<Clock className="size-6 shrink-0 text-deal sm:size-8" aria-hidden />}
        />
        <ScrollRow label="Today's best deals" className="-mx-4 gap-3 px-4 sm:mx-0 sm:gap-4 sm:px-0">
          {DEALS.map((deal, i) => (
            <li
              key={deal.title}
              className="flex h-[159px] w-[82vw] max-w-[340px] shrink-0 snap-start items-center gap-4 rounded-lg bg-[#faf7f2] p-2 outline -outline-offset-1 outline-line transition-shadow hover:shadow-md sm:w-[340px]"
            >
              <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-2">
                <span className="rounded bg-deal px-1.5 py-1 text-xs font-medium text-white">30% OFF</span>
                <p className="w-full truncate text-base font-bold text-black">{deal.title}</p>
                <p className="w-full truncate text-sm font-medium text-black">{deal.offer}</p>
                <p className="text-xs text-black">{deal.area}</p>
                <a
                  href="#"
                  className="mt-1 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  Claim Now
                </a>
              </div>
              <div className="relative min-w-0 flex-1 self-stretch overflow-hidden rounded-lg bg-[#e5e7eb]">
                <Image src={`/images/home/deal-${i + 1}.jpg`} alt="" fill sizes="160px" className="object-cover" />
              </div>
            </li>
          ))}
        </ScrollRow>
      </div>
    </section>
  );
}
