import { useEffect, useState, type FC, type ReactNode } from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

import PlayerLayout from '@/layout/PlayerLayout';
import SiteFooter from '@/components/player/SiteFooter';
import ResponsibleNav, {
  isResponsibleSection,
  type ResponsibleSection,
} from '@/components/responsible/ResponsibleNav';
import FaqSection from '@/components/responsible/FaqSection';
import SelfAssessmentSection from '@/components/responsible/SelfAssessmentSection';
import GamblingLimitsSection from '@/components/responsible/GamblingLimitsSection';
import SelfExclusionSection from '@/components/responsible/SelfExclusionSection';
import BudgetCalculatorSection from '@/components/responsible/BudgetCalculatorSection';
import { useTranslation } from '@/context/I18nContext';
import { fetchHelpCenterServer } from '@/services/helpCenter.server';
import { RESPONSIBLE_SECTIONS } from '@/components/responsible/ResponsibleNav';
import {
  entryFor,
  type HelpItem,
  type HelpSectionKey,
} from '@/components/responsible/helpContent';

/**
 * Responsible Gambling.
 *
 * PUBLIC BY DESIGN — the page is not wrapped in `ProtectedRoute`.
 *
 * The FAQs, the self-assessment and the budget calculator have to be readable
 * without an account: the people most likely to need them include someone
 * worried about a family member, and someone who has already excluded
 * themselves and therefore cannot log in. Only the two tools that act on an
 * account — limits and self-exclusion — ask for a session, and they ask in
 * place rather than bouncing the visitor off the page.
 *
 * Section lives in the URL (`?section=limits`) via a shallow replace, exactly
 * as the account area does it: linkable, refresh-proof, and answers the back
 * button without a server round-trip.
 */
const DEFAULT_SECTION: ResponsibleSection = 'faqs';

interface Props {
  /** Sections switched on in System config → Help Center, in rail order. */
  sections: ResponsibleSection[];
  /** Entries written in CRM → Help Center. Empty falls back to built-in copy. */
  items: HelpItem[];
}

const ResponsibleGamblingPage: FC<Props> = ({ sections, items }) => {
  const { t } = useTranslation();
  const router = useRouter();

  const first = sections[0] ?? DEFAULT_SECTION;
  const [section, setSection] = useState<ResponsibleSection>(first);

  useEffect(() => {
    if (
      router.isReady &&
      isResponsibleSection(router.query.section) &&
      sections.includes(router.query.section)
    ) {
      setSection(router.query.section);
    }
  }, [router.isReady, router.query.section, sections]);

  const selectSection = (next: ResponsibleSection): void => {
    setSection(next);
    void router.replace(
      {
        pathname: router.pathname,
        query: next === first ? {} : { section: next },
      },
      undefined,
      { shallow: true }
    );
  };

  /**
   * No section is held behind a sign-in wall any more.
   *
   * The design draws Limits and Self-exclusion as panels to read — what they
   * do, what they cost, what happens next — and a wall in front of either hides
   * that from the person most likely to need it. Someone weighing up excluding
   * themselves should not have to log in to find out what it means. The two
   * actions still need a session, and each asks for one at its own button.
   */
  const body = (): ReactNode => {
    switch (section) {
      case 'faqs':
        return <FaqSection items={items.filter((i) => i.section === 'faqs')} />;
      case 'assessment':
        return <SelfAssessmentSection entry={entryFor(items, 'assessment')} />;
      case 'limits':
        return <GamblingLimitsSection entry={entryFor(items, 'limits')} />;
      case 'exclusion':
        return <SelfExclusionSection entry={entryFor(items, 'exclusion')} />;
      case 'budget':
        return <BudgetCalculatorSection entry={entryFor(items, 'budget')} />;
    }
  };

  return (
    <PlayerLayout>
      <Head>
        <title>{`${t('rgc.title')} · ROLLUCK`}</title>
        <meta name="description" content={t('rgc.metaDescription')} />
      </Head>

      {/* Same 1544 frame as the account area — 228 of rail, a 48px channel and
          a 1268 panel — so moving between Profile and this section does not
          shift the page under the player. */}
      <div className="@container mx-auto max-w-[1544px] pb-2">
        {/* A loud dev-only banner used to sit here saying these controls are
            not enforced. It is gone because it is not in the design — but the
            thing it warned about has not changed: limits and self-exclusion
            still resolve from an in-memory mock in `services/responsible.ts`
            and reset on reload. Someone can set a deposit limit here, believe
            they are protected, and not be. That has to be enforced server-side
            at the deposit, wager and login paths before this section is
            reachable by players. The warning now lives only in that file. */}
        <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-5 @acct:lg:grid-cols-[228px_minmax(0,1fr)] @acct:lg:gap-12">
          <ResponsibleNav active={section} onSelect={selectSection} visible={sections} />

          {/* `@container` so the sections size against the panel rather than
              the window — the rail and the shell take ~492px before the panel
              starts, so a window breakpoint reads "desktop" far too early.

              `rl-glass-edge`, not `rl-panel`: the design's panel here is the
              same "Glass Effect" node the Affiliate page uses — a black 20%
              fill set to screen, which over this near-black stage comes to
              nothing. Sampled from its own render the panel reads 7,8,10, the
              page's own colour, so the edge is all there is. It carries the
              four other sections too, and their cards were already drawn at
              the 5% the design gives these rows. */}
          <div className="@container rl-glass-edge min-w-0 p-5 @acct:sm:p-7.5">{body()}</div>
        </div>

        {/* The design breaks hard between the panel and the footer — measured
            off its own frames, 75 on FAQs, 88 on Limits, 101 on Self-exclusion
            and 114 on Self-assessment, against the 20 this used to carry. There
            is no single number in the file, so this takes the middle of that
            band and steps down with everything else on a laptop. */}
        <div className="mt-20 2xl:mt-25">
          <SiteFooter />
        </div>
      </div>
    </PlayerLayout>
  );
};

/**
 * Rendered per request: the sections shown, and the text in them, come from
 * System config and CRM, so an edit or a switch applies without a rebuild.
 *
 * The whole page is a 404 when Responsible Gambling is switched off (or every
 * section is). If the API cannot be reached the page still renders, with every
 * section and the built-in copy — a safety page should not disappear because
 * a request failed.
 */
export const getServerSideProps: GetServerSideProps<Props> = async ({ res }) => {
  const all = RESPONSIBLE_SECTIONS.map((s) => s.key) as ResponsibleSection[];

  try {
    const data = await fetchHelpCenterServer();
    if (!data.enabled) {
      return { notFound: true };
    }
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    return {
      props: {
        sections: all.filter((key) => data.sections[key as HelpSectionKey]),
        items: data.items,
      },
    };
  } catch {
    return { props: { sections: all, items: [] } };
  }
};

export default ResponsibleGamblingPage;
