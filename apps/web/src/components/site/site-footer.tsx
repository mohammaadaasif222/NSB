import { Plus_Jakarta_Sans } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { type Category, FOOTER_SOCIAL_LABELS, FOOTER_SOCIALS, type FooterLink, type FooterSettings } from "@nsb/shared";
import { Icon } from "./nsb-home/bits";
import { CATEGORY_LOOK, DEFAULT_LOOK, ICON, LOGO } from "./nsb-home/content";
import "./site-footer.css";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], weight: ["400", "500", "700", "800"] });

/** "+91 98115 90088" → "tel:+919811590088". */
const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/** A footer link from Admin › Home page: site paths stay in the app, other addresses open in a new tab. */
function FooterAnchor({ link, children }: { link: FooterLink; children: ReactNode }) {
  if (link.link.startsWith("/")) return <Link href={link.link}>{children}</Link>;
  if (/^https?:/.test(link.link))
    return (
      <a href={link.link} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  // mailto:, tel:, or no link yet (shown as in the design).
  return <a href={link.link || "#"}>{children}</a>;
}

/**
 * The one footer of the site, from "NSB Live Demo.html": used by the home page and by every other
 * page (the (site) layout). Logo, text, phone, links and social pages come from Admin › Home page ›
 * Footer. Categories are the active top-level ones; those not open yet are left out.
 */
export function SiteFooter({ categories, footer }: { categories: Category[]; footer: FooterSettings }) {
  // Switched-off items stay in the admin but are left out here.
  const socials = FOOTER_SOCIALS.filter((s) => footer.socials[s].visible && footer.socials[s].url);
  const quickLinks = footer.quickLinks.filter((l) => l.visible);
  const bottomLinks = footer.bottomLinks.filter((l) => l.visible);
  return (
    <footer className={`nsb-footer ${jakarta.variable}`}>
      <div className="w">
        <div className="fg">
          <div>
            {footer.showLogo && (
              <Link href="/" aria-label="Noida Super Bazaar">
                <Image className="flg" src={footer.logoUrl ?? LOGO} alt="Noida Super Bazaar" width={560} height={283} />
              </Link>
            )}
            {footer.showAbout && footer.about && <p>{footer.about}</p>}
            {footer.showPhone && footer.phone && (
              <a className="fph" href={telHref(footer.phone)}>
                <Icon d={ICON.phone} size={18} stroke={1.8} />
                {footer.phone}
              </a>
            )}
            {footer.showBadge && (
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
            )}
          </div>
          {quickLinks.length > 0 && (
            <nav aria-label="Quick links">
              <h4>
                <Icon d={ICON.store} size={16} stroke={1.8} />
                Quick links
              </h4>
              <ul className="fl2">
                {quickLinks.map((l, i) => (
                  <li key={i}>
                    <FooterAnchor link={l}>
                      <Icon d={ICON.chevronRight} size={14} stroke={1.8} />
                      {l.label}
                    </FooterAnchor>
                  </li>
                ))}
              </ul>
            </nav>
          )}
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
            {socials.map((s) => (
              <a key={s} href={footer.socials[s].url} aria-label={FOOTER_SOCIAL_LABELS[s]} target="_blank" rel="noopener noreferrer">
                <Icon d={ICON[s]} size={18} stroke={1.8} />
              </a>
            ))}
          </div>
          <div className="cp">
            © {new Date().getFullYear()} Noida Super Bazaar. All rights reserved.
            {bottomLinks.map((l, i) => (
              <Fragment key={i}>
                {i === 0 ? " " : " · "}
                <FooterAnchor link={l}>{l.label}</FooterAnchor>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
