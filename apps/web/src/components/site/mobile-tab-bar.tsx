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
  // /wedding/wedding-venues/some-vendor: a vendor page.
  if (path.split("/").filter(Boolean).length >= 3) return null;

  const tabs: Tab[] = [
    { label: "Home", href: "/", Icon: Home, active: (p) => p === "/" },
    { label: "Categories", href: "/#categories", Icon: LayoutGrid, active: () => false },
    { label: "Wedding", href: "/wedding", Icon: Heart, active: (p) => p.startsWith("/wedding") },
    ...(whatsappHref ? [{ label: "WhatsApp", href: whatsappHref, Icon: MessageCircle, active: () => false, external: true }] : []),
  ];

  return (
    <nav
      aria-label="Quick links"
      className="sticky bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="flex">
        {tabs.map(({ label, href, Icon, active, external }) => {
          const current = active(path);
          const className = `flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${current ? "text-brand" : "text-muted"}`;
          const body = (
            <>
              <Icon className={`size-5 ${current ? "fill-brand-soft" : ""}`} aria-hidden />
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
