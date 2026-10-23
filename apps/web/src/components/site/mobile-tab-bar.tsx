"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, LayoutGrid, type LucideIcon, MessageCircle } from "lucide-react";

interface Tab {
  label: string;
  href: string;
  Icon: LucideIcon;
  active: (path: string) => boolean;
  external?: boolean;
}

/**
 * App-style tab bar on phones. Hidden on vendor pages, which have their own Enquire bar,
 * and on tablets and desktops. The WhatsApp tab appears only when it is set up in Admin › Settings.
 */
export function MobileTabBar({ whatsappHref }: { whatsappHref: string | null }) {
  const path = usePathname();
  const parts = path.split("/").filter(Boolean);
  // /wedding/wedding-venues/some-vendor and /real-estate/some-project have their own bottom bar.
  if (parts.length >= 3 || (parts[0] === "real-estate" && parts.length === 2)) return null;

  const tabs: Tab[] = [
    { label: "Home", href: "/", Icon: Home, active: (p) => p === "/" },
    { label: "Categories", href: "/#categories", Icon: LayoutGrid, active: () => false },
    { label: "Wedding", href: "/wedding", Icon: Heart, active: (p) => p.startsWith("/wedding") },
    ...(whatsappHref ? [{ label: "WhatsApp", href: whatsappHref, Icon: MessageCircle, active: () => false, external: true }] : []),
  ];

  return (
    <nav
      aria-label="Quick links"
      className="sticky bottom-0 z-40 border-t border-line bg-white/95 px-1.5 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] backdrop-blur-md backdrop-saturate-150 lg:hidden"
    >
      <ul className="flex">
        {tabs.map(({ label, href, Icon, active, external }) => {
          const current = active(path);
          const className = `flex flex-col items-center gap-[3px] text-[11px] font-semibold transition-transform active:scale-95 ${current ? "text-brand" : "text-muted"}`;
          // The current tab's icon sits in a pill, as in phone apps.
          const body = (
            <>
              <span className={`flex h-7 w-14 items-center justify-center rounded-full transition-colors ${current ? "bg-brand-soft" : ""}`}>
                <Icon className="size-5" aria-hidden />
              </span>
              {label}
            </>
          );
          return (
            <li key={label} className="flex-1">
              {external ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
                  {body}
                </a>
              ) : (
                <Link href={href} aria-current={current ? "page" : undefined} className={className}>
                  {body}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
