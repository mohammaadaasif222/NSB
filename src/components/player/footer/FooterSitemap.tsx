import type { FC } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/I18nContext';
import { usePlatformFeatures } from '@/context/PlatformFeaturesContext';
import FooterPaymentBar from '@/components/player/footer/FooterPaymentBar';
import {
  CASINO_LINKS,
  SPORTS_LINKS,
  EARN_LINKS,
  HELP_LINKS,
  LEGAL_LINKS,
  type FooterLink,
} from '@/components/player/footer/footerContent';

const ROW = 'block py-2 text-sm leading-5 text-[#9da2b4] transition-colors';

/**
 * One entry. Anything without an `href` is a design-only destination: drawn in
 * the same place, and plainly not a link once you point at it, rather than an
 * anchor that lands on a 404.
 */
const Item: FC<{ item: FooterLink; soon: string }> = ({ item, soon }) => {
  const { t } = useTranslation();

  if (!item.href) {
    return (
      <li>
        <span className={`${ROW} cursor-default hover:text-[#c3c7d4]`} title={soon}>
          {t(item.label)}
        </span>
      </li>
    );
  }

  // Client-side navigation for routes; a plain anchor for mailto.
  return (
    <li>
      {item.href.startsWith('/') ? (
        <Link href={item.href} className={`${ROW} hover:text-white`}>
          {t(item.label)}
        </Link>
      ) : (
        <a href={item.href} className={`${ROW} hover:text-white`}>
          {t(item.label)}
        </a>
      )}
    </li>
  );
};

/**
 * `inset` is the design's extra step between a heading and its first link —
 * Help takes it, and so does the unheaded column continuing Help, which has to
 * start on the same line as the one it continues.
 */
const Column: FC<{
  title?: string;
  items: FooterLink[];
  soon: string;
  inset?: boolean;
  className?: string;
}> = ({ title, items, soon, inset = false, className = '' }) => (
  <div className={`min-w-0 ${className}`}>
    {title ? (
      <p className="h-7 text-xl leading-7 font-semibold tracking-[-0.4px] text-[#f0f1f5]">
        {title}
      </p>
    ) : (
      /* A heading-shaped hole, so the continuation lines up with the column it
         continues. Only while the two sit side by side: once they stack it is
         dead space above a list that already reads as more of the same. */
      <p className="hidden h-7 @xl:block" aria-hidden="true" />
    )}
    <ul className={inset ? 'mt-4' : ''}>
      {items.map((item) => (
        <Item key={item.label} item={item} soon={soon} />
      ))}
    </ul>
  </div>
);

/**
 * The sitemap, and the payments band it sits above.
 *
 * The column widths are the design's own, carried as fractions rather than
 * pixels so the whole card scales with its container instead of sticking at
 * 1540 and scrolling. They are uneven on purpose: the first three are the wide
 * ones, and Help runs across the last two because the design heads that pair
 * once and lets it continue.
 *
 * Below the breakpoint the fractions go away entirely — five columns of links
 * is a desktop shape — and the card falls to three, then two.
 */
const FooterSitemap: FC = () => {
  const { t } = useTranslation();
  const {
    rewards: rewardsOn,
    promotions: promotionsOn,
    terms_page: termsOn,
    responsible_gambling: responsibleOn,
  } = usePlatformFeatures();
  const soon = t('common.soon');

  // "Rolluck Drops" is the rewards page. Dropped from the column while
  // rewards are switched off, rather than left pointing at a dead end.
  const earn = EARN_LINKS.filter(
    (link) =>
      (rewardsOn || link.href !== '/rewards') && (promotionsOn || link.href !== '/promotions')
  );

  // The Terms page (and /privacy-policy, which redirects into it) is switched
  // off from System config → CRM; its links go with it.
  const legalPages = (link: { href?: string }): boolean =>
    termsOn || !(link.href?.startsWith('/terms-of-service') || link.href === '/privacy-policy');
  const help = HELP_LINKS.filter(legalPages);
  const legal = LEGAL_LINKS.filter(legalPages).filter(
    (link) => responsibleOn || link.href !== '/responsible-gambling'
  );

  return (
    <div className="rl-panel overflow-hidden">
      <div className="px-6 pt-7 pb-8 @xl:px-8 @foot:pt-10.25 @foot:pe-8 @foot:pb-11 @foot:ps-12.5">
        {/* The five tracks and why they are what they are live beside them, in
            `rl-foot-cols`. The slack they leave comes out of the card's right
            padding, so every column still starts where the design starts it. */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 @xl:grid-cols-3 @foot:rl-foot-cols @foot:gap-x-0 @foot:gap-y-0">
          <Column title={t('nav.casino')} items={CASINO_LINKS} soon={soon} />
          <Column title={t('nav.sports')} items={SPORTS_LINKS} soon={soon} />
          <Column title={t('lobby.footer.earn')} items={earn} soon={soon} />
          <Column title={t('lobby.footer.help')} items={help} soon={soon} inset />
          {/* Pinned to the second track at two columns, where the natural flow
              would otherwise drop it under Earn and leave it looking like a
              list nobody headed. From three columns up it falls beside Help on
              its own. */}
          <Column
            items={legal}
            soon={soon}
            inset
            className="col-start-2 @xl:col-start-auto"
          />
        </div>
      </div>

      <FooterPaymentBar />
    </div>
  );
};

export default FooterSitemap;
