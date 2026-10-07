import type { FC, ReactNode } from 'react';
import Head from 'next/head';

import PlayerLayout from '@/layout/PlayerLayout';
import FaqAccordion from '@/components/player/FaqAccordion';
import SiteFooter from '@/components/player/SiteFooter';
import WelcomePackPanel from '@/components/bonus/WelcomePackPanel';
import SpecialBonusRow from '@/components/bonus/SpecialBonusRow';
import RegularBonusRow from '@/components/bonus/RegularBonusRow';
import { useTranslation } from '@/context/I18nContext';

/** A section title — "Special Bonuses" and "Regular Bonuses". */
const SubHeading: FC<{ children: ReactNode }> = ({ children }) => (
  <h2 className="text-[20px] font-semibold leading-7 tracking-[-0.02em] text-white lg:text-[length:max(14px,calc(var(--u)*24))] lg:leading-[calc(var(--u)*32)]">
    {children}
  </h2>
);

/** A heading and the row under it, 16 apart as the design sets them. */
const Section: FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
  <section className="space-y-4 lg:space-y-[calc(var(--u)*16)]">
    <SubHeading>{title}</SubHeading>
    {children}
  </section>
);

/**
 * Deposit match, free spins, bonus cash and the rest.
 *
 * The design's Bonuses frame, and only that: the welcome pack across the top,
 * the three standing offers under "Special Bonuses", the six campaign cards
 * under "Regular Bonuses", then the shared FAQ and footer that close every
 * long page in the app.
 *
 * STATIC. Nothing on this page is served yet — the `bonuses` table is empty
 * and GET /bonuses/me returns no campaigns, so every figure here is the
 * design's own placeholder copy. The pieces that read real data are written
 * and committed but not mounted: BonusOfferCard maps an AvailableBonus onto
 * the same card, and ActiveBonusCard, BonusCodeForm and BonusHistoryTable
 * cover the player's own awards, the redeem field and the history table. The
 * design draws none of those, so none of them are on the page; mount them when
 * the API is ready. See RegularBonusRow for the one swap that turns the grid
 * live.
 */
const BonusesPage: FC = () => {
  const { t } = useTranslation();

  return (
    <PlayerLayout>
      <Head>
        <title>{`${t('bonus.title')} · ROLLUCK`}</title>
      </Head>

      {/* The design's 1548px content column, the same one the lobby and the
          footer use; `--u` (set by PlayerLayout) scales it on a narrower
          desktop so the three-across rows stay three across. The 80 between
          sections is the design's, and the lobby's. */}
      <div className="mx-auto max-w-[1548px] space-y-10 px-1 lg:max-w-[calc(var(--u)*1548)] lg:space-y-[calc(var(--u)*80)] lg:px-0">
        <WelcomePackPanel />

        <Section title={t('bonus.specialBonuses')}>
          <SpecialBonusRow />
        </Section>

        <Section title={t('bonus.regularBonuses')}>
          <RegularBonusRow />
        </Section>

        <FaqAccordion />
        <SiteFooter />
      </div>
    </PlayerLayout>
  );
};

export default BonusesPage;
