import { useState, type FC } from 'react';
import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';
import { useTranslation } from '@/context/I18nContext';
import { toast } from 'react-toastify';
import { usePlatformFeatures } from '@/context/PlatformFeaturesContext';
import { useOpenSupport } from '@/hooks/useOpenSupport';
import { LIVE_CASINO_HREF, PROVIDERS_PATH, categoryHref } from '@/constants/games';
import { COUNTER_STRIKE, sportHref } from '@/constants/sportsbook';
import LanguagePicker from '@/components/LanguagePicker';
import type { TranslationKey } from '@/i18n/locales';
import { useSocialLinks } from '@/hooks/useSocialLinks';

import { PAYMENT_MARK, ROLLUCK_LOGO } from '@/constants/cdn';
import questions from '@/assets/lobby/footer/contact-questions.svg';
import bug from '@/assets/lobby/footer/contact-bug.svg';
import partner from '@/assets/lobby/footer/contact-partner.svg';
import marketing from '@/assets/lobby/footer/contact-marketing.svg';
import toTopIcon from '@/assets/lobby/footer/to-top.svg';
import badge18 from '@/assets/lobby/footer/badge-18.svg';
import payVisa from '@/assets/lobby/footer/pay-visa.webp';
import payApple from '@/assets/lobby/footer/pay-applepay.svg';
import payGoogle from '@/assets/lobby/footer/pay-googlepay.svg';
import chevronDown from '@/assets/lobby/faq-chevron-down.svg';

const CONTACTS: { icon: StaticImageData; label: TranslationKey; email: string }[] = [
  { icon: questions, label: 'lobby.footer.contactQuestions', email: 'support@xyzlife.top' },
  { icon: bug, label: 'lobby.footer.contactBugBounty', email: 'bugbounty@xyzlife.top' },
  { icon: partner, label: 'lobby.footer.contactPartner', email: 'affiliate@xyzlife.top' },
  { icon: marketing, label: 'lobby.footer.contactMarketing', email: 'pr@xyzlife.top' },
];

const PAYMENTS: { mark: StaticImageData; label: string }[] = [
  { mark: payVisa, label: 'Visa' },
  { mark: payApple, label: 'Apple Pay' },
  { mark: payGoogle, label: 'Google Pay' },
  { mark: PAYMENT_MARK.paypal, label: 'PayPal' },
  { mark: PAYMENT_MARK.ebay, label: 'eBay' },
  { mark: PAYMENT_MARK.mastercard, label: 'Mastercard' },
  { mark: PAYMENT_MARK.cirrus, label: 'Cirrus' },
];

/** The design's small dark glass disc, behind the socials, contacts and controls. */
const DISC =
  'flex h-[calc(var(--u)*48)] w-[calc(var(--u)*48)] flex-shrink-0 items-center justify-center rl-glass-btn rounded-full';

/* ==================================================================== */
/* Link columns                                                          */
/* ==================================================================== */

interface FooterLink {
  label: string;
  /** Absent for destinations that do not exist yet — rendered inert. */
  href?: string;
  onSelect?: () => void;
}

const LINK =
  'block py-[calc(var(--u)*8)] text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[calc(var(--u)*20)] text-[#9da2b4] transition-colors';

/**
 * One footer entry. Anything without an `href` is a design-only destination:
 * drawn in the same place but plainly not a link, rather than an anchor that
 * lands on a 404.
 */
const Item: FC<{ item: FooterLink; soon: string }> = ({ item, soon }) => (
  <li>
    {item.onSelect ? (
      <button
        type="button"
        onClick={item.onSelect}
        className={`${LINK} text-start hover:text-white`}
      >
        {item.label}
      </button>
    ) : !item.href ? (
      <span className={`${LINK} cursor-default hover:text-[#c8ccd8]`} title={soon}>
        {item.label}
      </span>
    ) : item.href.startsWith('/') ? (
      // Client-side navigation for routes; a plain anchor for mailto.
      <Link href={item.href} className={`${LINK} hover:text-white`}>
        {item.label}
      </Link>
    ) : (
      <a href={item.href} className={`${LINK} hover:text-white`}>
        {item.label}
      </a>
    )}
  </li>
);

interface Group {
  title: string;
  /** One list, or several side by side under the one heading (as Help is). */
  lists: FooterLink[][];
}

/** Desktop: a heading over its link list(s). */
const Column: FC<{ group: Group; soon: string }> = ({ group, soon }) => (
  <div>
    <p className="text-[length:max(min(11px,20px),calc(var(--u)*20))] font-semibold leading-[calc(var(--u)*28)] tracking-[-0.02em] text-[#f0f1f5]">
      {group.title}
    </p>
    <div
      className={
        group.lists.length > 1
          ? 'mt-[calc(var(--u)*6)] grid grid-cols-2 gap-x-[calc(var(--u)*24)]'
          : ''
      }
    >
      {group.lists.map((list) => (
        <ul key={list[0].label}>
          {list.map((item) => (
            <Item key={item.label} item={item} soon={soon} />
          ))}
        </ul>
      ))}
    </div>
  </div>
);

/** Phone: the same group as one of the design's collapsible glass pills. */
const Fold: FC<{ group: Group; soon: string }> = ({ group, soon }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rl-liquid rounded-[calc(var(--u)*28)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-[calc(var(--u)*56)] w-full items-center justify-between pl-[calc(var(--u)*20)] pr-[calc(var(--u)*19)] text-left text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[calc(var(--u)*24)] text-[#f0f1f5]"
      >
        {group.title}
        <img
          src={chevronDown.src}
          alt=""
          className={`h-[calc(var(--u)*28)] w-[calc(var(--u)*28)] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <ul className="px-[calc(var(--u)*20)] pb-[calc(var(--u)*12)]">
          {group.lists.flat().map((item) => (
            <Item key={item.label} item={item} soon={soon} />
          ))}
        </ul>
      )}
    </div>
  );
};

/* ==================================================================== */
/* The footer                                                            */
/* ==================================================================== */

/**
 * The site footer, as the design draws it at both sizes.
 *
 * Desktop: brand, socials and preferences across the top; the four contact
 * addresses in one glass band; the sitemap in a second, with the payments
 * strip along its foot. A phone stacks the same pieces — preferences first,
 * then the brand — and folds each sitemap group into a pill of its own.
 */
const SiteFooter: FC<{ glow?: boolean }> = ({ glow = false }) => {
  const { t } = useTranslation();
  const socialLinks = useSocialLinks();
  const {
    rewards: rewardsOn,
    promotions: promotionsOn,
    terms_page: termsOn,
    responsible_gambling: responsibleOn,
  } = usePlatformFeatures();
  const openSupport = useOpenSupport();
  const soon = t('common.soon');

  const toTop = (): void =>
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });

  const casino: FooterLink[] = [
    { label: t('browse.filterAll'), href: '/casino' },
    { label: t('nav.originals'), href: categoryHref('originals') },
    { label: t('dash.slots'), href: categoryHref('slots') },
    { label: t('dash.liveCasino'), href: LIVE_CASINO_HREF },
    { label: t('dash.tableGames'), href: categoryHref('table') },
    { label: t('lobby.footer.providers'), href: PROVIDERS_PATH },
  ];

  const sports: FooterLink[] = [
    { label: t('nav.home'), href: '/sports' },
    { label: t('lobby.footer.live'), href: '/sports#live-games' },
    { label: t('lobby.sport.soccer'), href: sportHref('football') },
    { label: t('lobby.sport.tennis'), href: sportHref('tennis') },
    { label: t('lobby.sport.basketball'), href: sportHref('basketball') },
    { label: t('lobby.sport.counterStrike'), href: sportHref(COUNTER_STRIKE) },
  ];

  /* Promotions and Bonuses are in the rail too; Blogs is reachable from
     nowhere else, so the footer is its only way in until it gets a rail entry
     of its own. None of the three are in the design's own footer — they are
     here so the pages are not orphaned. */
  const earn: FooterLink[] = [
    // Rolluck Drops is the rewards page; dropped from the list entirely while
    // rewards are switched off rather than left as a link to a dead end.
    ...(rewardsOn ? [{ label: t('lobby.footer.drops'), href: '/rewards' }] : []),
    ...(promotionsOn ? [{ label: t('menu.promotions'), href: '/promotions' }] : []),
    { label: t('nav.bonuses'), href: '/bonuses' },
    { label: t('lobby.footer.referral'), href: '/referral' },
    {
      label: t('lobby.footer.swapCrypto'),
      onSelect: () => toast.info(t('common.underDevelopment')),
    },
  ];

  const help: FooterLink[] = [
    { label: t('nav.blogs'), href: '/blogs' },
    { label: t('lobby.footer.reportBug'), href: 'mailto:bugbounty@xyzlife.top' },
    ...(termsOn
      ? [
          { label: t('lobby.footer.privacy'), href: '/privacy-policy' },
          { label: t('lobby.footer.terms'), href: '/terms-of-service' },
        ]
      : []),
  ];

  const legal: FooterLink[] = [
    ...(termsOn
      ? [{ label: t('lobby.footer.sportsTerms'), href: '/terms-of-service#sports-betting' }]
      : []),
    { label: t('menu.liveSupport'), onSelect: openSupport },
    ...(responsibleOn
      ? [{ label: t('menu.responsibleGambling'), href: '/responsible-gambling' }]
      : []),
  ];

  const groups: Group[] = [
    { title: t('nav.casino'), lists: [casino] },
    { title: t('nav.sports'), lists: [sports] },
    { title: t('lobby.footer.earn'), lists: [earn] },
    { title: t('lobby.footer.help'), lists: [help, legal] },
  ];

  // A phone folds Help's second list into a group of its own, as the design does.
  const folds: Group[] = [
    ...groups.slice(0, 3),
    { title: t('lobby.footer.help'), lists: [help] },
    { title: t('lobby.footer.other'), lists: [legal] },
  ];

  // A phone's seven marks share the band's width — the design's 46×32 plates,
  // 5 apart, on one line at any width; desktop's sit at 76×54, 24 apart.
  const payments = (
    <div className="grid w-full grid-cols-7 gap-[calc(var(--u)*5.4)] lg:flex lg:w-auto lg:flex-wrap lg:items-center lg:justify-center lg:gap-[calc(var(--u)*24)]">
      {PAYMENTS.map(({ mark, label }) => (
        <span
          key={label}
          title={label}
          className="flex aspect-[46/32] w-full items-center justify-center rl-plate rounded-[calc(var(--u)*10)] lg:aspect-auto lg:h-[calc(var(--u)*54)] lg:w-[calc(var(--u)*76)] lg:rounded-[calc(var(--u)*16)]"
        >
          <Image src={mark} alt={label} className="h-auto w-[65%] lg:w-[calc(var(--u)*50)]" />
        </span>
      ))}
    </div>
  );

  const responsibly = (
    <span className="flex items-center gap-[calc(var(--u)*18)]">
      <img src={badge18.src} alt="" className="h-[calc(var(--u)*36)] w-[calc(var(--u)*36)]" />
      <span className="text-[length:max(min(11px,16px),calc(var(--u)*16))] font-medium leading-[calc(var(--u)*24)] text-[#f0f1f5]">
        {t('lobby.footer.playResponsibly')}
        <span className="block text-[length:max(min(11px,14px),calc(var(--u)*14))] font-normal leading-[calc(var(--u)*20)] text-[#9da2b4]">
          {t('auth.ageRequirement', { min: 18 })}
        </span>
      </span>
    </span>
  );

  const secure = (
    <span className="text-center text-[length:max(min(11px,16px),calc(var(--u)*16))] font-medium leading-[calc(var(--u)*24)] text-[#f0f1f5] lg:text-left">
      {t('lobby.footer.securePayments')}
      <span className="block text-[length:max(min(11px,14px),calc(var(--u)*14))] font-normal leading-[calc(var(--u)*20)] text-[#9da2b4]">
        {t('lobby.footer.securityPriority')}
      </span>
    </span>
  );

  return (
    <footer className="relative flex flex-col">
      {/* The design's light behind the footer (Ellipse 208): an 837 disc,
          #d9d9d9 to the page's black, blurred 682 at 40%, centred on the
          brand row — what greys the panels' glass from behind. Desktop only;
          the phone frames draw none. Behind the content, like the backdrop
          (PlayerLayout's stage is isolated). */}
      {glow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[calc(var(--u)*47)] -z-10 hidden h-[calc(var(--u)*837)] w-[calc(var(--u)*837)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,#d9d9d9,#07080a)] opacity-40 blur-[calc(var(--u)*341)] lg:block"
        />
      )}

      {/* --- Brand, socials, preferences ------------------------------- */}
      <div className="flex flex-col items-center gap-[calc(var(--u)*28)] pb-[calc(var(--u)*2)] lg:min-h-[calc(var(--u)*88)] lg:flex-row lg:justify-between lg:gap-[calc(var(--u)*16)]">
        <Link
          href="/"
          aria-label="ROLLUCK"
          className="order-2 w-[calc(var(--u)*351)] max-w-full lg:order-1 lg:w-[calc(var(--u)*440)]"
        >
          <Image src={ROLLUCK_LOGO} alt="ROLLUCK" sizes="440px" className="h-auto w-full" />
        </Link>

        <div className="order-3 flex items-center gap-[calc(var(--u)*12)] lg:order-2">
          {socialLinks.map(({ icon, label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              title={label}
              className={`${DISC} transition-colors hover:bg-white/10`}
            >
              <img src={icon.src} alt="" className="h-[calc(var(--u)*24)] w-[calc(var(--u)*24)]" />
            </a>
          ))}
        </div>

        <div className="order-1 flex items-center gap-[calc(var(--u)*18)] lg:order-3">
          <LanguagePicker shell dropUp />
          <button
            type="button"
            onClick={toTop}
            aria-label={t('lobby.footer.backToTop')}
            title={t('lobby.footer.backToTop')}
            className={`${DISC} transition-colors hover:bg-white/10`}
          >
            <img
              src={toTopIcon.src}
              alt=""
              className="h-[calc(var(--u)*24)] w-[calc(var(--u)*24)]"
            />
          </button>
        </div>
      </div>

      {/* --- Who to write to --------------------------------------------
          One row only where the design has room for it (2xl); below that the
          four addresses would overrun the panel, so they pair up instead. */}
      <div className="rl-liquid rl-bar-rim relative [--tw-inset-shadow:0_0_#0000]! mt-[calc(var(--u)*30)] grid gap-[calc(var(--u)*26)] rounded-[calc(var(--u)*34)] p-[calc(var(--u)*24)] sm:grid-cols-2 sm:gap-x-[calc(var(--u)*32)] lg:mt-[calc(var(--u)*22)] lg:flex lg:min-h-[calc(var(--u)*147)] lg:items-center lg:justify-between lg:px-[calc(var(--u)*50)] lg:py-0">
        {CONTACTS.map(({ icon, label, email }) => (
          <a
            key={label}
            href={`mailto:${email}`}
            className="group flex min-w-0 items-center gap-[calc(var(--u)*15)] lg:gap-[calc(var(--u)*12)]"
          >
            <span className={DISC}>
              <img src={icon.src} alt="" className="max-h-6 max-w-[calc(var(--u)*24)]" />
            </span>
            <span className="min-w-0">
              <span className="block text-[length:max(min(11px,14px),calc(var(--u)*14))] leading-[calc(var(--u)*20)] text-[#9da2b4]">
                {t(label)}
              </span>
              <span className="mt-[calc(var(--u)*2)] block truncate text-[length:max(min(11px,20px),calc(var(--u)*20))] font-semibold leading-[calc(var(--u)*28)] tracking-[-0.02em] text-[#f0f1f5] transition-colors group-hover:text-[#f9d028] lg:mt-[calc(var(--u)*8)]">
                {email}
              </span>
            </span>
          </a>
        ))}
      </div>

      {/* --- Sitemap: folds on a phone ---------------------------------- */}
      <div className="mt-[calc(var(--u)*16)] space-y-[calc(var(--u)*10)] lg:hidden">
        {folds.map((group) => (
          <Fold key={group.title} group={group} soon={soon} />
        ))}
      </div>

      <div className="rl-liquid rl-bar-rim relative [--tw-inset-shadow:0_0_#0000]! mt-[calc(var(--u)*16)] flex flex-col items-center gap-[calc(var(--u)*28)] rounded-[calc(var(--u)*34)] px-[calc(var(--u)*17)] py-[calc(var(--u)*26)] lg:hidden">
        {secure}
        {payments}
        {responsibly}
      </div>

      {/* --- Sitemap and payments: desktop ------------------------------ */}
      <div className="rl-liquid rl-bar-rim relative [--tw-inset-shadow:0_0_#0000]! mt-[calc(var(--u)*22)] hidden overflow-hidden rounded-[calc(var(--u)*34)] lg:block">
        <div className="grid grid-cols-[1fr_1fr_1fr_1.72fr] gap-x-[calc(var(--u)*65)] px-[calc(var(--u)*50)] pb-[calc(var(--u)*29)] pt-[calc(var(--u)*40)]">
          {groups.map((group) => (
            <Column key={group.title} group={group} soon={soon} />
          ))}
        </div>

        <div className="flex min-h-[calc(var(--u)*85)] items-center justify-between gap-[calc(var(--u)*24)] bg-white/[0.07] px-[calc(var(--u)*50)]">
          {secure}
          <span className="h-[calc(var(--u)*40)] w-px bg-white/10" aria-hidden="true" />
          {payments}
          <span className="h-[calc(var(--u)*40)] w-px bg-white/10" aria-hidden="true" />
          {responsibly}
        </div>
      </div>

      <p className="mt-[calc(var(--u)*16)] pb-[calc(var(--u)*4)] text-center text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[calc(var(--u)*20)] text-[#9da2b4] lg:mt-[calc(var(--u)*32)] lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]">
        {t('lobby.footer.copyright', { year: new Date().getFullYear() })}
      </p>
    </footer>
  );
};

export default SiteFooter;
