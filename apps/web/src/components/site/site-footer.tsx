import Link from "next/link";
import { type Category, FOOTER_SOCIAL_LABELS, FOOTER_SOCIALS, type FooterSettings } from "@nsb/shared";
import { Icon } from "./nsb-home/bits";
import { CATEGORY_LOOK, DEFAULT_LOOK, ICON } from "./nsb-home/content";
import "./site-footer.css";

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "How It Works", href: "/about#what-we-do" },
  { label: "Partner With Us", href: "https://wa.me/919811590088" },
  { label: "NSB Verification Policy", href: "/disclaimer#verification-policy" },
  { label: "Contact Us", href: "https://wa.me/919811590088" },
];

const legalLinks = [
  { label: "FAQs", href: "/faqs" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Disclaimer", href: "/disclaimer" },
];

function FooterLink({ href, children }: { href: string; children: string }) {
  return /^https?:/.test(href) ? (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <Link href={href}>{children}</Link>
  );
}

export function SiteFooter({ categories, footer }: { categories: Category[]; footer: FooterSettings }) {
  const socials = FOOTER_SOCIALS.filter((social) => footer.socials[social].visible && footer.socials[social].url);
  const liveCategories = [
    { id: "wedding", label: categories.find((category) => category.slug === "wedding")?.name ?? "Wedding", href: "/wedding" },
    {
      id: "real-estate",
      label: categories.find((category) => category.slug === "real-estate")?.name ?? "Real Estate",
      href: "/real-estate",
    },
  ].filter(({ id }) => (CATEGORY_LOOK[id] ?? DEFAULT_LOOK).live);

  return (
    <footer className="nsb-footer">
      <div className="w fgrid">
        <div className="fb">
          <Link className="footer-logo" href="/" aria-label="Noida Super Bazaar home">
            <b>Noida</b>
            <small>Super Bazaar</small>
          </Link>
          <ul className="chk">
            <li>Trusted hyperlocal platform for Noida</li>
            <li>Verified local businesses &amp; services</li>
          </ul>
          {footer.showPhone && footer.phone && (
            <a className="fph" href={telHref(footer.phone)}>
              {footer.phone}
            </a>
          )}
        </div>
        <nav aria-label="Company">
          <h4>Company</h4>
          <ul className="fl">
            {companyLinks.map(({ label, href }) => (
              <li key={label}>
                <FooterLink href={href}>{label}</FooterLink>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Categories">
          <h4>Categories</h4>
          <ul className="fl">
            {liveCategories.map((category) => (
              <li key={category.id}>
                <FooterLink href={category.href}>{category.label}</FooterLink>
              </li>
            ))}
            <li>
              <span>More opening soon</span>
            </li>
          </ul>
        </nav>
        <nav aria-label="Help and legal">
          <h4>Help &amp; Legal</h4>
          <ul className="fl">
            {legalLinks.map(({ label, href }) => (
              <li key={label}>
                <FooterLink href={href}>{label}</FooterLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="w fbot">
        <div className="soc">
          {socials.map((social) => (
            <a key={social} href={footer.socials[social].url} target="_blank" rel="noopener noreferrer" aria-label={FOOTER_SOCIAL_LABELS[social]}>
              <Icon d={ICON[social]} size={20} stroke={1.8} />
            </a>
          ))}
        </div>
        <span>© {new Date().getFullYear()} Noida Super Bazaar. All rights reserved.</span>
      </div>
    </footer>
  );
}
