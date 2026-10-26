import type { FC, ReactElement } from 'react';
import { LIVE_CASINO_HREF, categoryHref } from '@/constants/games';
import type { TranslationKey } from '@/i18n/locales';
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
 * Everything the footer says, as dictionary keys — the sections translate
 * them where they render.
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

export const CONTACTS: { Icon: () => ReactElement; label: TranslationKey; email: string }[] = [
  { Icon: QuestionsIcon, label: 'lobby.footer.contactQuestions', email: 'support@xyzlife.top' },
  { Icon: BugReportIcon, label: 'lobby.footer.contactBugBounty', email: 'bugbounty@xyzlife.top' },
  { Icon: PartnerIcon, label: 'lobby.footer.contactPartner', email: 'affiliate@xyzlife.top' },
  { Icon: MarketingIcon, label: 'lobby.footer.contactMarketing', email: 'pr@xyzlife.top' },
];

/* ==================================================================== */
/* The sitemap                                                           */
/* ==================================================================== */

export interface FooterLink {
  label: TranslationKey;
  /** Absent for destinations that do not exist yet — rendered inert. */
  href?: string;
}

export const CASINO_LINKS: FooterLink[] = [
  { label: 'browse.filterAll', href: '/casino' },
  { label: 'nav.originals', href: categoryHref('originals') },
  { label: 'dash.slots', href: categoryHref('slots') },
  { label: 'dash.liveCasino', href: LIVE_CASINO_HREF },
  { label: 'dash.tableGames' },
  { label: 'lobby.footer.providers' },
];

export const SPORTS_LINKS: FooterLink[] = [
  { label: 'nav.home', href: '/sports' },
  { label: 'lobby.footer.live', href: '/sports#live-games' },
  { label: 'lobby.sport.soccer' },
  { label: 'lobby.sport.tennis' },
  { label: 'lobby.sport.basketball' },
  { label: 'lobby.sport.counterStrike' },
];

export const EARN_LINKS: FooterLink[] = [
  { label: 'lobby.footer.drops', href: '/rewards' },
  { label: 'lobby.footer.referral', href: '/referral' },
  { label: 'lobby.footer.swapCrypto' },
];

export const HELP_LINKS: FooterLink[] = [
  { label: 'lobby.footer.reportBug', href: 'mailto:bugbounty@xyzlife.top' },
  { label: 'lobby.footer.privacy', href: '/privacy-policy' },
  { label: 'lobby.footer.terms', href: '/terms-of-service' },
];

/** Help's second column. The design heads the pair once and runs it wide. */
export const LEGAL_LINKS: FooterLink[] = [
  /* This used to deep-link `#sports-betting`. The Terms the design ships have
     no sports-betting section at all, so the anchor would land nowhere; it
     points at the document instead until that section exists. */
  { label: 'lobby.footer.sportsTerms', href: '/terms-of-service' },
  { label: 'menu.liveSupport' },
  { label: 'menu.responsibleGambling', href: '/responsible-gambling' },
];
