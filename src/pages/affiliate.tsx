import { useEffect, useState, type FC } from 'react';
import Head from 'next/head';

import PlayerLayout from '@/layout/PlayerLayout';
import SiteFooter from '@/components/player/SiteFooter';
import AffiliateCodeCard from '@/components/affiliate/AffiliateCodeCard';
import AffiliateStats from '@/components/affiliate/AffiliateStats';
import AffiliateTerms from '@/components/affiliate/AffiliateTerms';
import ReferralTable from '@/components/profile/referral/ReferralTable';
import { fetchReferrals, type ReferralRow } from '@/components/profile/referral/mockReferral';
import { fetchAffiliateSummary, type AffiliateSummary } from '@/components/affiliate/mockAffiliate';
import { useTranslation } from '@/context/I18nContext';

/**
 * The Affiliate page.
 *
 * Open to signed-out visitors on purpose: the whole point of the page is to be
 * read before you have an account, and the figures simply come back empty. It
 * is not wrapped in ProtectedRoute for that reason — see `mockAffiliate.ts`
 * for what has to be real before any of it ships.
 *
 * The referral ledger is the account area's table, unchanged. It is the same
 * table in the design on both screens, down to the column order and the status
 * pills, so it is the same component here rather than a second copy that would
 * have to be kept in step.
 */
const AffiliatePage: FC = () => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<readonly ReferralRow[]>([]);
  const [summary, setSummary] = useState<AffiliateSummary | null>(null);

  useEffect(() => {
    let live = true;
    void fetchReferrals().then((result) => {
      if (live) setRows(result.rows);
    });
    void fetchAffiliateSummary().then((result) => {
      if (live) setSummary(result);
    });
    return () => {
      live = false;
    };
  }, []);

  return (
    <PlayerLayout>
      <Head>
        <title>{`${t('aff.title')} · ROLLUCK`}</title>
      </Head>

      {/* 1544 is the design's content column — the same one the footer and the
          account area use, so the three line up down the page. */}
      <div className="@container mx-auto w-full max-w-[1544px]">
        {/* The design opens the title at y140, 40 under the bar; the shell
            leaves 16, so the other 24 is here. In `--u` because both of the
            numbers it answers to — the layout's 20 of inset and its 16 of
            lead — scale with the chrome, where the card column below does
            not. */}
        <h1 className="mt-1 rl-h-section lg:mt-[calc(var(--u)*24)]">{t('aff.title')}</h1>

        {/* Two 764 cards with 20 between them is the design's 1548 — the column
            itself, give or take the 4px it rounds off.

            They stay side by side on a laptop, where the column is 1030 and
            each card gets 505. That is well under the 764 they are drawn at,
            so the cards scale their own type down to suit — see AffiliateStats
            — rather than the page reflowing them into a stack. A screen that
            only changes size should not also change shape. */}
        {/* The ids are the account menu's Affiliate links (Campaign, Earning,
            Referred Users, Terms); scroll-mt keeps each clear of the sticky bar. */}
        <div className="mt-5 grid gap-5 @4xl:grid-cols-2">
          <div id="campaign" className="scroll-mt-28">
            <AffiliateCodeCard />
          </div>
          <div id="earning" className="scroll-mt-28">
            <AffiliateStats summary={summary} />
          </div>
        </div>

        {/* 34 down the column, not the 20 that separates the two cards above:
            the design stacks its rows further apart than it sets them side by
            side (463→497 and 1063→1096). */}
        <div id="referred-users" className="mt-8.5 scroll-mt-28">
          <ReferralTable rows={rows} />
        </div>

        <div id="terms" className="mt-8.5 scroll-mt-28">
          <AffiliateTerms />
        </div>

        {/* 60 in the design — the terms card closes at 2175 and the footer
            opens at 2235 — not the 20 that separates the cards above it. */}
        <div className="mt-12 2xl:mt-15">
          <SiteFooter />
        </div>
      </div>
    </PlayerLayout>
  );
};

export default AffiliatePage;
