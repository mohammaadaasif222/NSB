"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, Bell, Menu, Moon, Search, Sun } from "lucide-react";
import { AdminNav } from "./admin-nav";
import { useUnreadEnquiries } from "./unread-enquiries";

const ADMIN_THEME_KEY = "nsb-admin-theme";
const ADMIN_THEME_EVENT = "nsb-admin-theme-change";
const subscribeAdminTheme = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  window.addEventListener(ADMIN_THEME_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(ADMIN_THEME_EVENT, onChange);
  };
};
const getAdminTheme = () => window.localStorage.getItem(ADMIN_THEME_KEY) === "dark";
const getServerAdminTheme = () => false;

/** Top-bar title for the current page. */
function titleFor(pathname: string) {
  if (pathname === "/admin") return "Dashboard";
  if (/^\/admin\/listings\/(new|[^/]+)$/.test(pathname)) return "Listing";
  if (pathname.startsWith("/admin/wedding") || pathname.startsWith("/admin/listings")) return "Wedding";
  if (pathname.startsWith("/admin/home") || pathname.startsWith("/admin/banners") || pathname.startsWith("/admin/categories")) return "Home page";
  if (pathname.startsWith("/admin/enquiries")) return "Enquiries";
  if (pathname.startsWith("/admin/settings")) return "Settings";
  return "Admin";
}

/** Sidebar, top bar and page area, laid out as in the NSB Live Demo admin. */
export function AdminShell({ adminName, children }: { adminName: string; children: ReactNode }) {
  const pathname = usePathname();
  const unread = useUnreadEnquiries();
  const darkMode = useSyncExternalStore(subscribeAdminTheme, getAdminTheme, getServerAdminTheme);
  const [navOpen, setNavOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const search = useRef<HTMLInputElement>(null);
  const account = useRef<HTMLDivElement>(null);

  // "/" or Ctrl+K jumps to search; Escape closes the menus.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if ((e.key === "/" && !typing) || (e.key === "k" && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        search.current?.focus();
      }
      if (e.key === "Escape") {
        setNavOpen(false);
        setMenuOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!account.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div className={`admin-panel a-app ${navOpen ? "a-nav-open" : ""} ${darkMode ? "a-dark" : ""}`}>
      <div className="a-shade" onClick={() => setNavOpen(false)} aria-hidden />
      <aside className="a-sb">
        <Link href="/admin" className="a-sb-logo" aria-label="NSB Admin home">
          <Image src="/images/brand/logo.png" alt="Noida Super Bazaar" fill priority sizes="140px" className="object-contain object-left" />
        </Link>
        <AdminNav onNavigate={() => setNavOpen(false)} />
        <div className="a-sf">
          NSB Admin · v1
          <br />A venture by <b>Delhi Infomedia Private Limited</b>
        </div>
      </aside>

      <div className="a-main">
        <header className="a-tb">
          <button type="button" className="a-ib a-menu" onClick={() => setNavOpen(true)} aria-label="Open menu">
            <Menu size={18} aria-hidden />
          </button>
          <h1>{titleFor(pathname)}</h1>
          <form action="/admin/wedding" className="a-gs" role="search">
            <Search size={16} aria-hidden />
            <input ref={search} name="q" placeholder="Search listings…" aria-label="Search listings" maxLength={100} />
            <kbd>/</kbd>
          </form>
          <Link href="/" target="_blank" rel="noreferrer" className="a-btn g s">
            <span>View site</span>
            <ArrowUpRight size={15} aria-hidden />
          </Link>
          <button
            type="button"
            className="a-ib"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={darkMode}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => {
              window.localStorage.setItem(ADMIN_THEME_KEY, darkMode ? "light" : "dark");
              window.dispatchEvent(new Event(ADMIN_THEME_EVENT));
            }}
          >
            {darkMode ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
          </button>
          <Link
            href="/admin/enquiries?status=unread"
            className="a-ib"
            aria-label={unread ? `${unread} unread enquiries` : "No unread enquiries"}
            title={unread ? `${unread} unread enquiries` : "No unread enquiries"}
          >
            <Bell size={18} aria-hidden />
            {unread > 0 && <i className="a-dot" />}
          </Link>
          <div ref={account} style={{ position: "relative" }}>
            <button
              type="button"
              className="a-av"
              aria-label="Account"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {adminName.slice(0, 1).toUpperCase()}
            </button>
            {menuOpen && (
              <div className="a-dd">
                <h5>{adminName}</h5>
                <Link href="/admin/settings" onClick={() => setMenuOpen(false)}>
                  Settings
                </Link>
                <form action="/admin/logout" method="post">
                  <button type="submit">Log out</button>
                </form>
              </div>
            )}
          </div>
        </header>
        <main className="a-view">{children}</main>
      </div>
    </div>
  );
}
