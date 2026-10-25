"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Heart, Home, LayoutDashboard, Lock, type LucideIcon, Settings, Users } from "lucide-react";
import { useCan } from "./admin-role";
import { useUnreadEnquiries } from "./unread-enquiries";

interface NavLink {
  href: string;
  label: string;
  Icon: LucideIcon;
  /** Other paths that belong to this item, e.g. the listing form under Wedding. */
  also?: string[];
}

/** Grouped as in the NSB Live Demo admin. */
const GROUPS: { title: string; links: NavLink[] }[] = [
  { title: "Main", links: [{ href: "/admin", label: "Dashboard", Icon: LayoutDashboard }] },
  {
    title: "Sections",
    links: [
      { href: "/admin/home", label: "Home page", Icon: Home, also: ["/admin/banners", "/admin/categories"] },
      { href: "/admin/wedding", label: "Wedding", Icon: Heart, also: ["/admin/listings"] },
      { href: "/admin/real-estate", label: "Real Estate", Icon: Building2 },
    ],
  },
  { title: "Inbox", links: [{ href: "/admin/enquiries", label: "Leads", Icon: Users }] },
  { title: "System", links: [{ href: "/admin/settings", label: "Settings", Icon: Settings }] },
];

const SOON: { label: string; Icon: LucideIcon; tag: string }[] = [
  { label: "Brand Stores", Icon: Lock, tag: "6 mo" },
  { label: "Schools", Icon: Lock, tag: "Soon" },
];

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const unread = useUnreadEnquiries();
  // Settings is for Super Admins; other roles open their account from the menu.
  const canManage = useCan("manage");
  const under = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const isActive = ({ href, also = [] }: NavLink) => (href === "/admin" ? pathname === "/admin" : [href, ...also].some(under));

  return (
    <nav aria-label="Admin" className="a-nv">
      {GROUPS.filter((group) => canManage || group.title !== "System").map((group) => (
        <div key={group.title}>
          <h6>{group.title}</h6>
          {group.links.map((link) => (
            <Link key={link.href} href={link.href} aria-current={isActive(link) ? "page" : undefined} onClick={onNavigate}>
              <link.Icon size={18} strokeWidth={1.8} aria-hidden />
              {link.label}
              {link.href === "/admin/enquiries" && unread > 0 && (
                <b className="a-count" aria-label={`${unread} unread`}>
                  {unread > 99 ? "99+" : unread}
                </b>
              )}
            </Link>
          ))}
        </div>
      ))}
      <h6>Coming soon</h6>
      {SOON.map(({ label, Icon, tag }) => (
        <span key={label} className="a-lk" aria-disabled="true">
          <Icon size={18} strokeWidth={1.8} aria-hidden />
          {label}
          <em>{tag}</em>
        </span>
      ))}
    </nav>
  );
}
