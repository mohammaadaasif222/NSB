import type { FC } from 'react';
import Link from 'next/link';
import PlayerLayout from '@/layout/PlayerLayout';
import SiteFooter from '@/components/player/SiteFooter';
import { useTranslation } from '@/context/I18nContext';
import type { IconProps } from '@/components/icons';
import type { TranslationKey } from '@/i18n/locales';
import Seo from '@/components/seo/Seo';

/**
 * The stand-in for a rail destination that has no feature behind it yet.
 *
 * These exist as real routes rather than dead links so the nav behaves the way
 * a visitor expects — the entry is clickable, the URL is shareable, and the
 * page itself says why there is nothing here. Deleting one is the last step of
 * building the real thing.
 */
const ComingSoon: FC<{ title: string; icon: FC<IconProps> }> = ({ title, icon: Icon }) => {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex max-w-[1600px] items-center justify-center py-10">
      <section className="rl-glass flex w-full max-w-lg flex-col items-center rounded-3xl px-6 py-14 text-center sm:px-10">
        <span className="rl-glass flex h-16 w-16 items-center justify-center rounded-2xl text-white/70">
          <Icon size={30} />
        </span>

        <h1 className="mt-5 text-2xl font-semibold text-white">{title}</h1>

        <span className="mt-3 inline-flex items-center rounded-full border border-[#fcd535]/30 bg-[#fcd535]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#fcd535]">
          {t('soon.heading')}
        </span>

        <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50">{t('soon.body')}</p>

        <Link
          href="/"
          className="rl-btn-gold mt-7 inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold"
        >
          {t('game.backToLobby')}
        </Link>
      </section>
    </div>
  );
};

/**
 * Build the page component for one of these routes.
 *
 * Every such page differs only in its heading and glyph, so they are made from
 * one place rather than nine copies of the same file — a change to the shell
 * (or the day these gain a shared "notify me" control) lands once.
 */
export const createComingSoonPage = (titleKey: TranslationKey, icon: FC<IconProps>): FC => {
  const Page: FC = () => {
    const { t } = useTranslation();
    const title = t(titleKey);

    return (
      <PlayerLayout>
        <Seo title={title} />
        <ComingSoon title={title} icon={icon} />
        <div className="mx-auto mt-10 max-w-[1600px] lg:mt-[calc(var(--u)*80)]">
          <SiteFooter />
        </div>
      </PlayerLayout>
    );
  };

  Page.displayName = `ComingSoonPage(${titleKey})`;
  return Page;
};

export default ComingSoon;
