import Image from "next/image";
import Link from "next/link";
import { ChevronDown, MapPin, Search, ShoppingBag } from "lucide-react";

/**
 * Header from the home design. Search, location, cart and login are shown as designed
 * but not wired up: search and customer accounts are not part of Phase-1.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#f3f4f6] bg-white py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] lg:static lg:py-3 lg:shadow-none">
      <div className="container-page flex flex-wrap items-center justify-between gap-x-3 gap-y-3 sm:gap-x-6">
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
              className="h-[38px] w-full rounded-lg border border-[#e5e7eb] bg-surface pr-1 pl-[41px] text-base text-ink sm:text-sm outline-none placeholder:text-muted focus:border-brand sm:rounded-l-none"
            />
          </label>
        </form>

        <div className="flex shrink-0 items-center gap-3 sm:gap-6">
          <button type="button" className="flex items-center gap-1">
            <span className="flex rounded-full bg-brand-soft p-1.5">
              <MapPin className="size-4 text-brand" aria-hidden />
            </span>
            <span className="hidden pl-1 text-sm leading-5 font-medium whitespace-nowrap text-[#4b5563] sm:inline">
              Noida, Sector 18
            </span>
            <ChevronDown className="size-5 text-muted" aria-hidden />
          </button>
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
