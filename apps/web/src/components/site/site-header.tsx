import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Search, ShoppingBag } from "lucide-react";
import type { LocationOption } from "@nsb/shared";
import type { SiteLocation } from "@/lib/location";
import { LocationPicker } from "./location-picker";

/**
 * Header from the home design. The location picker filters every page; search, cart and login
 * are shown as designed but not wired up: search and customer accounts are not part of Phase-1.
 */
export function SiteHeader({ location, locationOptions }: { location: SiteLocation | null; locationOptions: LocationOption[] }) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#f3f4f6] bg-white/95 pt-[calc(0.5rem+env(safe-area-inset-top))] pb-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-md lg:static lg:bg-white lg:py-3 lg:shadow-none lg:backdrop-blur-none">
      <div className="container-page flex flex-wrap items-center justify-between gap-x-3 gap-y-2.5 sm:gap-x-6">
        <Link href="/" className="relative block h-10 w-24 shrink-0 sm:h-[52px] sm:w-[124px]" aria-label="Noida Super Bazaar home">
          <Image src="/images/brand/logo.png" alt="Noida Super Bazaar" fill priority sizes="124px" className="object-contain" />
        </Link>

        <form role="search" className="order-last flex w-full lg:order-none lg:w-auto lg:max-w-[640px] lg:flex-1 lg:pr-8">
          <button
            type="button"
            className="-mr-px hidden h-[38px] w-[147px] shrink-0 items-center gap-2 rounded-l-lg border border-[#e5e7eb] bg-surface pr-2 pl-[17px] text-sm whitespace-nowrap text-ink sm:flex"
          >
            All Categories
            <ChevronDown className="ml-auto size-4 text-muted" aria-hidden />
          </button>
          <label className="relative flex-1">
            <span className="sr-only">Search</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted" aria-hidden />
            <input
              type="search"
              placeholder="Search for shops, services, deals in Noida..."
              className="h-10 w-full rounded-full border border-[#e5e7eb] bg-surface pr-1 pl-[41px] text-base text-ink outline-none placeholder:text-muted focus:border-brand sm:h-[38px] sm:rounded-l-none sm:rounded-r-lg sm:text-sm"
            />
          </label>
        </form>

        <div className="flex shrink-0 items-center gap-3 sm:gap-6">
          <LocationPicker variant="site" current={location} options={locationOptions} />
          <a href="#" className="relative block" aria-label="Cart">
            <span className="flex rounded-full bg-[#f3f4f6] p-2">
              <ShoppingBag className="size-5 text-[#4b5563] sm:size-6" aria-hidden />
            </span>
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[#ef4444] font-display text-[10px] leading-[15px] text-white">
              0
            </span>
          </a>
          <a
            href="#"
            className="rounded-md bg-brand px-3 py-1.5 font-display text-[13px] leading-5 font-semibold text-white transition-colors hover:bg-brand-dark sm:px-4"
          >
            Login
          </a>
        </div>
      </div>
    </header>
  );
}
