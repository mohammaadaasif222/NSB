import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight, Headphones, LayoutGrid, Mail, MapPin, Phone, ShieldCheck, Star, Store } from "lucide-react";
import type { ReactNode } from "react";
import type { Category } from "@nsb/shared";
import { FacebookIcon, InstagramIcon, LinkedinIcon, TwitterIcon, YoutubeIcon } from "./social-icons";

const QUICK_LINKS = ["About Us", "How It Works", "Partner With Us", "Become NSB Verified", "Careers"];

const SOCIAL = [
  { label: "Facebook", href: "https://www.facebook.com/noidasuperbazaar", Icon: FacebookIcon },
  { label: "Instagram", href: "https://www.instagram.com/noidasuperbazaar", Icon: InstagramIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/noidasuperbazaar", Icon: LinkedinIcon },
  { label: "Twitter", href: "https://x.com/noidasuperbazaar", Icon: TwitterIcon },
  { label: "YouTube", href: "https://www.youtube.com/@noidasuperbazaar", Icon: YoutubeIcon },
];

/** Group heading: icon, uppercase title and a short brand-coloured underline. */
function GroupHeading({ id, Icon, children }: { id: string; Icon: LucideIcon; children: ReactNode }) {
  return (
    <div>
      <h2 id={id} className="flex items-start gap-2 text-sm leading-5 font-bold tracking-wide text-ink uppercase">
        <Icon className="size-[18px] shrink-0 text-brand" aria-hidden />
        {children}
      </h2>
      <span className="mt-2 ml-[26px] block h-0.5 w-7 rounded bg-brand" aria-hidden />
    </div>
  );
}

const linkClass = "flex items-start gap-1.5 text-sm leading-5 text-ink-soft hover:text-brand";
const Chevron = () => <ChevronRight className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />;

/**
 * Site footer. Phones: brand block, then link groups two to a row with chevrons, then social icons
 * and copyright (styled after the reference the client shared). Desktops: the same groups in four columns.
 */
export function SiteFooter({ categories }: { categories: Category[] }) {
  return (
    <footer className="bg-line">
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-8 py-8 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-8 lg:py-14">
        <div className="col-span-2 flex flex-col gap-4 border-b border-[#e2e4ea] pb-6 lg:col-span-1 lg:border-0 lg:pb-0">
          <div className="relative h-[48px] w-[116px] lg:h-[52px] lg:w-[124px]">
            <Image src="/images/brand/logo-footer.png" alt="Noida Super Bazaar" fill sizes="124px" className="object-contain object-left" />
          </div>
          <p className="max-w-sm text-sm leading-6 text-ink-soft">
            Your trusted hyperlocal discovery platform for Noida. Connecting you with verified local businesses and services.
          </p>
          <div className="flex items-start gap-2">
            <ShieldCheck className="size-5 shrink-0 text-brand" aria-hidden />
            <div>
              <p className="text-xs font-semibold text-ink">Trusted by local businesses</p>
              <p className="mt-0.5 flex gap-0.5" aria-label="Rated 5 out of 5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className="size-3.5 fill-[#fbbf24] text-[#fbbf24]" aria-hidden />
                ))}
              </p>
            </div>
          </div>
        </div>

        <nav aria-labelledby="footer-quick" className="flex flex-col gap-4">
          <GroupHeading id="footer-quick" Icon={Store}>
            Quick Links
          </GroupHeading>
          <ul className="flex flex-col gap-3">
            {QUICK_LINKS.map((label) => (
              <li key={label}>
                <a href="#" className={linkClass}>
                  <Chevron />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-categories" className="flex flex-col gap-4">
          <GroupHeading id="footer-categories" Icon={LayoutGrid}>
            Popular Categories
          </GroupHeading>
          <ul className="flex flex-col gap-3">
            {categories.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link href={`/${c.slug}`} className={linkClass}>
                  <Chevron />
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-2 flex flex-col gap-4 lg:col-span-1">
          <GroupHeading id="footer-contact" Icon={Headphones}>
            Contact Us
          </GroupHeading>
          <ul aria-labelledby="footer-contact" className="flex flex-col gap-3 text-sm leading-5 text-ink-soft">
            <li className="flex items-start gap-2">
              <MapPin className="size-4 shrink-0 text-brand" aria-hidden />
              Sector 18, Noida, Uttar Pradesh 201301
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-brand" aria-hidden />
              <a href="tel:+919811590088" className="hover:text-brand">
                +91 9811590088
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-brand" aria-hidden />
              <a href="mailto:hello@noidasuperbazaar.com" className="min-w-0 break-words hover:text-brand">
                hello@noidasuperbazaar.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#e2e4ea]">
        <div className="container-page flex flex-col items-center gap-3 py-5 sm:flex-row sm:justify-between">
          <div className="flex gap-3">
            {SOCIAL.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-full border border-[#d1d5db] bg-white text-ink transition-colors hover:border-brand hover:bg-brand hover:text-white"
              >
                <Icon />
              </a>
            ))}
          </div>
          <p className="text-center text-xs text-muted">© {new Date().getFullYear()} Noida Super Bazaar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
