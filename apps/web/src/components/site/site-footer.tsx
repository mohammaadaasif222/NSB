import { Plus_Jakarta_Sans } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import type { Category } from "@nsb/shared";
import { Icon } from "./nsb-home/bits";
import { CATEGORY_LOOK, DEFAULT_LOOK, ICON, LOGO, QUICK_LINKS, SOCIALS } from "./nsb-home/content";
import "./site-footer.css";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], weight: ["400", "500", "700", "800"] });

/**
 * The one footer of the site, from "NSB Live Demo.html": used by the home page and by every other
 * page (the (site) layout). Categories are the active top-level ones; those not open yet are left out.
 */
export function SiteFooter({ categories }: { categories: Category[] }) {
  return (
    <footer className={`nsb-footer ${jakarta.variable}`}>
      <div className="w">
        <div className="fg">
          <div>
            <Link href="/" aria-label="Noida Super Bazaar">
              <Image className="flg" src={LOGO} alt="Noida Super Bazaar" width={560} height={283} />
            </Link>
            <p>Your trusted hyperlocal discovery platform for Noida. Connecting you with verified local businesses and services.</p>
            <a className="fph" href="tel:+919811590088">
              <Icon d={ICON.phone} size={18} stroke={1.8} />
              +91 98115 90088
            </a>
            <div className="tb">
              <span>
                <Icon d={ICON.shield} size={22} stroke={1.8} />
              </span>
              <div>
                <b>Trusted by local businesses</b>
                <div className="sr" aria-label="Rated 5 out of 5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Icon key={n} d={ICON.star} size={14} fill="#F5B301" />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <nav aria-label="Quick links">
            <h4>
              <Icon d={ICON.store} size={16} stroke={1.8} />
              Quick links
            </h4>
            <ul className="fl2">
              {QUICK_LINKS.map((l) => (
                <li key={l}>
                  <a href="#">
                    <Icon d={ICON.chevronRight} size={14} stroke={1.8} />
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Categories">
            <h4>
              <Icon d={ICON.grid} size={16} stroke={1.8} />
              Categories
            </h4>
            <ul className="fl2">
              {categories
                .filter((c) => (CATEGORY_LOOK[c.slug] ?? DEFAULT_LOOK).live)
                .map((c) => (
                  <li key={c.id}>
                    <Link href={`/${c.slug}`}>
                      <Icon d={ICON.chevronRight} size={14} stroke={1.8} />
                      {c.name}
                    </Link>
                  </li>
                ))}
              <li className="mu">More opening soon</li>
            </ul>
          </nav>
        </div>
        <div className="fbar">
          <div className="so">
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} aria-label={s.label} target="_blank" rel="noopener noreferrer">
                <Icon d={s.icon} size={18} stroke={1.8} />
              </a>
            ))}
          </div>
          <div className="cp">
            © {new Date().getFullYear()} Noida Super Bazaar. All rights reserved. <a href="#">Terms</a> · <a href="#">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
