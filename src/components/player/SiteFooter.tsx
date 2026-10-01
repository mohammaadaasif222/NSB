import type { FC, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/assets/logo.png';
import { useTranslation } from '@/context/I18nContext';
import { categoryHref } from '@/constants/games';
import LanguagePicker from '@/components/LanguagePicker';
import { PAYMENT_MARKS } from '@/components/brand';
import {
  ArrowUpIcon,
  BugIcon,
  FacebookIcon,
  HandshakeIcon,
  HelpCircleIcon,
  InstagramIcon,
  MegaphoneIcon,
  SendIcon,
  WhatsappIcon,
  XSocialIcon,
  type IconProps,
} from '@/components/icons';

const SOCIALS: { Icon: FC<IconProps>; label: string; href: string }[] = [
  { Icon: WhatsappIcon, label: 'WhatsApp', href: 'https://wa.me/' },
  { Icon: InstagramIcon, label: 'Instagram', href: 'https://instagram.com/' },
  { Icon: FacebookIcon, label: 'Facebook', href: 'https://facebook.com/' },
  { Icon: XSocialIcon, label: 'X', href: 'https://x.com/' },
  { Icon: SendIcon, label: 'Telegram', href: 'https://t.me/' },
];

const CONTACTS: { Icon: FC<IconProps>; label: string; email: string }[] = [
  { Icon: HelpCircleIcon, label: 'Questions', email: 'support@rolluck.com' },
  { Icon: BugIcon, label: 'BugBounty Reports', email: 'bugbounty@rolluck.com' },
  { Icon: HandshakeIcon, label: 'Become Partner', email: 'affiliate@rolluck.com' },
  { Icon: MegaphoneIcon, label: 'Marketing', email: 'pr@rolluck.com' },
];

/* ==================================================================== */
/* Link columns                                                          */
/* ==================================================================== */

interface FooterLink {
  label: string;
  /** Absent for destinations that do not exist yet — rendered inert. */
  href?: string;
}

/**
 * One footer entry. Anything without an `href` is a design-only destination:
 * drawn in the same place but plainly not a link, rather than an anchor that
 * lands on a 404.
 */
const Item: FC<{ item: FooterLink; soon: string }> = ({ item, soon }) =>
  item.href ? (
    <li>
      {/* Client-side navigation for routes; a plain anchor for mailto. */}
      {item.href.startsWith('/') ? (
        <Link
          href={item.href}
          className="text-[11.5px] text-white/40 transition-colors hover:text-white"
        >
          {item.label}
        </Link>
      ) : (
        <a
          href={item.href}
          className="text-[11.5px] text-white/40 transition-colors hover:text-white"
        >
          {item.label}
        </a>
      )}
    </li>
  ) : (
    <li>
      <span
        className="cursor-default text-[11.5px] text-white/40 transition-colors hover:text-white/60"
        title={soon}
      >
        {item.label}
      </span>
    </li>
  );

const Column: FC<{ title?: string; items: FooterLink[]; soon: string }> = ({
  title,
  items,
  soon,
}) => (
  <div>
    {/* The last column continues "Help" and so has no heading of its own; the
        spacer keeps its first row on the same baseline as its neighbours. */}
    {title ? (
      <p className="mb-3 text-[12.5px] font-semibold text-white">{title}</p>
    ) : (
      <p className="mb-3 h-[19px]" aria-hidden="true" />
    )}
    <ul className="space-y-2">
      {items.map((item) => (
        <Item key={item.label} item={item} soon={soon} />
      ))}
    </ul>
  </div>
);

/* ==================================================================== */
/* The footer                                                            */
/* ==================================================================== */

const SiteFooter: FC = () => {
  const { t } = useTranslation();
  const soon = t('common.soon');

  const toTop = (): void =>
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });

  const casino: FooterLink[] = [
    { label: 'All games', href: '/casino' },
    { label: 'Rolluck originals', href: categoryHref('originals') },
    { label: 'Slots', href: categoryHref('slots') },
    { label: 'Live casino' },
    { label: 'Table Games' },
    { label: 'Providers' },
  ];

  const sports: FooterLink[] = [
    { label: 'Home', href: '/sports' },
    { label: 'Live', href: '/sports#live-games' },
    { label: 'Soccer' },
    { label: 'Tennis' },
    { label: 'Basketball' },
    { label: 'Counter-Strike' },
  ];

  const earn: FooterLink[] = [
    { label: 'Rolluck Drops', href: '/rewards' },
    { label: 'Referral System', href: '/profile' },
    { label: 'Affiliate System' },
    { label: 'Swap Crypto' },
  ];

  const help: FooterLink[] = [
    { label: 'Report Bug', href: 'mailto:bugbounty@rolluck.com' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms-of-service' },
  ];

  const legal: FooterLink[] = [
    { label: 'Sportsbetting T&S', href: '/terms-of-service#sports-betting' },
    { label: 'Live Support' },
    { label: 'Responsible Gambling', href: '/responsible-play' },
  ];

  const note = (title: string, caption: string, icon: ReactNode): ReactNode => (
    <div className="flex items-center gap-2.5">
      <span className="rl-glass flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-white/55">
        {icon}
      </span>
      <span>
        <span className="block text-[11.5px] font-medium text-white">{title}</span>
        <span className="block text-[10px] text-white/35">{caption}</span>
      </span>
    </div>
  );

  return (
    <footer className="space-y-3">
      {/* --- Brand, socials, preferences ------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="ROLLUCK"
          className="rl-glass flex h-[46px] items-center rounded-xl w-1/4"
        >
          <Image src={logo} alt="ROLLUCK" className="w-full" />
        </Link>

        <div className="flex items-center gap-1.5">
          {SOCIALS.map(({ Icon, label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              title={label}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Icon size={15} />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LanguagePicker shell dropUp />
          <button
            type="button"
            onClick={toTop}
            aria-label="Back to top"
            title="Back to top"
            className="rl-glass rl-glass-hover flex h-9 w-9 items-center justify-center rounded-full text-white/60 hover:text-white"
          >
            <ArrowUpIcon size={15} />
          </button>
        </div>
      </div>

      {/* --- Who to write to --------------------------------------------
          The hairlines are drawn with a divide-* rule rather than a border
          on each cell: at two columns the rule has to fall between columns
          1|2 and 3|4, at four columns between all of them, and `divide-x`
          already knows which cells start a row. */}
      <div className="rl-glass grid gap-y-4 rounded-2xl p-4 sm:grid-cols-2 sm:gap-y-5 sm:divide-x sm:divide-white/[0.07] lg:grid-cols-4">
        {CONTACTS.map(({ Icon, label, email }) => (
          <a key={label} href={`mailto:${email}`} className="flex items-center gap-2.5 sm:px-5">
            <span className="rl-glass flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-white/55">
              <Icon size={16} />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] text-white/35">{label}</span>
              <span className="block truncate text-[12px] text-white/85 transition-colors hover:text-white">
                {email}
              </span>
            </span>
          </a>
        ))}
      </div>

      {/* --- Sitemap, payments, responsible play ------------------------ */}
      <div className="rl-glass rounded-2xl p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
          <Column title={t('nav.casino')} items={casino} soon={soon} />
          <Column title={t('nav.sports')} items={sports} soon={soon} />
          <Column title="Earn" items={earn} soon={soon} />
          <Column title="Help" items={help} soon={soon} />
          <Column items={legal} soon={soon} />
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-5 border-t border-white/[0.07] pt-5">
          {note(
            'Safe & Secure Payments',
            'Your security is our priority',
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          )}

          <div className="flex flex-wrap items-center gap-1.5">
            {PAYMENT_MARKS.map((Mark, i) => (
              <Mark key={i} />
            ))}
          </div>

          {note(
            'Play Responsibly',
            '18+ Only',
            <span className="text-[10px] font-bold leading-none text-white/70">18+</span>
          )}
        </div>
      </div>

      <p className="pb-1 pt-1 text-center text-[10.5px] text-white/25">
        Copyright © {new Date().getFullYear()} Rolluck. All rights reserved.
      </p>
    </footer>
  );
};

export default SiteFooter;
