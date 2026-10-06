import type { FC, ReactElement } from 'react';
import { categoryHref } from '@/constants/games';
import {
  WhatsappMark,
  InstagramMark,
  FacebookMark,
  XMark,
  TelegramMark,
} from '@/components/profile/referral/socialMarks';
import {
  QuestionsIcon,
  BugReportIcon,
  PartnerIcon,
  MarketingIcon,
} from '@/components/player/footer/footerIcons';

/**
 * Everything the footer says, apart from the two headings it takes from the
 * dictionary.
 *
 * Held here rather than inside the sections so the three cards stay layout —
 * adding a link, or pointing one at a route that now exists, is an edit to this
 * file and touches no markup.
 */

/* ==================================================================== */
/* The round shortcuts                                                   */
/* ==================================================================== */

/**
 * The same five marks the Referral card shares on, which is where the design
 * draws them from too. Placeholder destinations: the brand has no accounts yet,
 * so these point at each network's root rather than at a profile that 404s.
 */
export const SOCIALS: { Mark: FC; label: string; href: string }[] = [
  { Mark: WhatsappMark, label: 'WhatsApp', href: 'https://wa.me/' },
  { Mark: InstagramMark, label: 'Instagram', href: 'https://instagram.com/' },
  { Mark: FacebookMark, label: 'Facebook', href: 'https://facebook.com/' },
  { Mark: XMark, label: 'X', href: 'https://x.com/' },
  { Mark: TelegramMark, label: 'Telegram', href: 'https://t.me/' },
];

/* ==================================================================== */
/* Who to write to                                                       */
/* ==================================================================== */

export const CONTACTS: { Icon: () => ReactElement; label: string; email: string }[] = [
  { Icon: QuestionsIcon, label: 'Questions', email: 'support@rolluck.com' },
  { Icon: BugReportIcon, label: 'BugBounty Reports', email: 'bugbounty@rolluck.com' },
  { Icon: PartnerIcon, label: 'Become Partner', email: 'affiliate@rolluck.com' },
  { Icon: MarketingIcon, label: 'Marketing', email: 'pr@rolluck.com' },
];

/* ==================================================================== */
/* The sitemap                                                           */
/* ==================================================================== */

export interface FooterLink {
  label: string;
  /** Absent for destinations that do not exist yet — rendered inert. */
  href?: string;
}

export const CASINO_LINKS: FooterLink[] = [
  { label: 'All games', href: '/casino' },
  { label: 'Rolluck originals', href: categoryHref('originals') },
  { label: 'Slots', href: categoryHref('slots') },
  { label: 'Live casino' },
  { label: 'Table Games' },
  { label: 'Providers' },
];

export const SPORTS_LINKS: FooterLink[] = [
  { label: 'Home', href: '/sports' },
  { label: 'Live', href: '/sports#live-games' },
  { label: 'Soccer' },
  { label: 'Tennis' },
  { label: 'Basketball' },
  { label: 'Counter-Strike' },
];

export const EARN_LINKS: FooterLink[] = [
  { label: 'Rolluck Drops', href: '/rewards' },
  { label: 'Referral System', href: '/profile' },
  { label: 'Affiliate System', href: '/affiliate' },
  { label: 'Swap Crypto' },
];

export const HELP_LINKS: FooterLink[] = [
  { label: 'Report Bug', href: 'mailto:bugbounty@rolluck.com' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Service', href: '/terms-of-service' },
];

/** Help's second column. The design heads the pair once and runs it wide. */
export const LEGAL_LINKS: FooterLink[] = [
  /* This used to deep-link `#sports-betting`. The Terms the design ships have
     no sports-betting section at all, so the anchor would land nowhere; it
     points at the document instead until that section exists. */
  { label: 'Sportsbetting T&S', href: '/terms-of-service' },
  { label: 'Live Support' },
  { label: 'Responsible Gambling', href: '/responsible-gambling' },
];
