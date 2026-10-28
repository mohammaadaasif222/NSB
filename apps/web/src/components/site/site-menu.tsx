"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Building2, Heart, Home, LogIn, Menu, X } from "lucide-react";

const LINKS = [
  { label: "Home", href: "/", Icon: Home },
  { label: "Wedding", href: "/wedding", Icon: Heart },
  { label: "Real Estate", href: "/real-estate", Icon: Building2 },
];

/**
 * The phone header's menu button: Login moves in here, with the main sections. The panel is
 * portalled to <body> so it sits above the pages' fixed bottom bars. Styled by site-header.css.
 */
export function SiteMenu() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const panelId = useId();

  // A link that changes the page closes the menu.
  const [lastPath, setLastPath] = useState(path);
  if (path !== lastPath) {
    setLastPath(path);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button type="button" className="mn" aria-label="Menu" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(true)}>
        <Menu size={20} aria-hidden />
      </button>
      {open &&
        createPortal(
          <div className="nsb-mn" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
            <nav id={panelId} className="pn" aria-label="Menu">
              <button type="button" className="x" aria-label="Close menu" onClick={() => setOpen(false)}>
                <X size={20} aria-hidden />
              </button>
              <ul>
                {LINKS.map(({ label, href, Icon }) => (
                  <li key={href}>
                    <Link href={href} aria-current={path === href ? "page" : undefined} onClick={() => setOpen(false)}>
                      <Icon size={18} aria-hidden />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
              {/* Login is not wired up yet (not Phase-1), as in the header. */}
              <a className="lg" href="#" onClick={() => setOpen(false)}>
                <LogIn size={18} aria-hidden />
                Login
              </a>
            </nav>
          </div>,
          document.body,
        )}
    </>
  );
}
