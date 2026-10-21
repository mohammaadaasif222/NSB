import { useEffect, useState, type FC } from 'react';

import PlayerLayout from '@/layout/PlayerLayout';
import SiteFooter from '@/components/player/SiteFooter';
import ReferralLinkCard from '@/components/referral/ReferralLinkCard';
import ReferralStats from '@/components/referral/ReferralStats';
import ReferralTerms from '@/components/referral/ReferralTerms';
import CampaignsModal from '@/components/referral/CampaignsModal';
import ReferralTable from '@/components/profile/referral/ReferralTable';
import TablePager from '@/components/profile/transactions/TablePager';
import { useAuthModal } from '@/context/AuthModalContext';
import { useTranslation } from '@/context/I18nContext';
import { usePlatformFeatures } from '@/context/PlatformFeaturesContext';
import { useReferral } from '@/hooks/useReferral';
import { analytics } from '@/services/analytics';
import Seo from '@/components/seo/Seo';

/**
 * The Referral page — the dashboard: the link to share, what it has
 * earned, the players it brought in, and the terms.
 *
 * Open to signed-out visitors on purpose: it is read before you have an
 * account. They see the terms and a sign-in prompt where the link would be.
 */
const ReferralPage: FC = () => {
  const { t } = useTranslation();
  const features = usePlatformFeatures();
  const { openLogin } = useAuthModal();
  const referral = useReferral();
  const { summary } = referral;
  const [selected, setSelected] = useState<string | null>(null);
  const [managing, setManaging] = useState(false);

  useEffect(() => {
    analytics.referral.sectionViewed();
  }, []);

  const activeCodes = summary?.codes.filter((c) => c.is_active) ?? [];
  const code = activeCodes.find((c) => c.code === selected)?.code ?? activeCodes[0]?.code ?? null;
  const unavailable = features.loaded && !features.referrals;

  return (
    <PlayerLayout>
      <Seo title={t('aff.title')} />

      <div className="@container mx-auto w-full max-w-[1544px]">
        <h1 className="mt-1 rl-h-section lg:mt-[calc(var(--u)*24)]">{t('aff.title')}</h1>

        {unavailable ? (
          <p className="mt-5 text-sm text-[#9da2b4]">{t('ref.unavailable')}</p>
        ) : (
          <>
            {/* The ids are the account menu's Referral links (Campaign, Earning,
                Referred Users, Terms); scroll-mt keeps each clear of the sticky bar. */}
            <div className="mt-5 grid gap-5 @4xl:grid-cols-2">
              <div id="campaign" className="scroll-mt-28">
                <ReferralLinkCard
                  code={code}
                  signedIn={referral.signedIn}
                  onChange={() => setManaging(true)}
                  onSignIn={() => openLogin()}
                />
              </div>
              <div id="earning" className="scroll-mt-28">
                <ReferralStats
                  summary={summary}
                  claiming={referral.claiming}
                  onCollect={() => void referral.claim()}
                />
              </div>
            </div>

            {referral.signedIn && (
              <div id="referred-users" className="mt-8.5 scroll-mt-28">
                <ReferralTable rows={referral.referred} />
                {referral.pagination && (
                  <div className="mt-5">
                    <TablePager
                      page={referral.page}
                      totalPages={referral.pagination.totalPages}
                      onPage={referral.setPage}
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div id="terms" className="mt-8.5 scroll-mt-28">
          <ReferralTerms />
        </div>

        <div className="mt-12 2xl:mt-15">
          <SiteFooter />
        </div>
      </div>

      {managing && summary && (
        <CampaignsModal
          codes={summary.codes}
          selected={code}
          onSelect={(next) => {
            setSelected(next);
            setManaging(false);
          }}
          onToggle={referral.setCodeActive}
          onCreate={referral.createCode}
          onClose={() => setManaging(false)}
        />
      )}
    </PlayerLayout>
  );
};

export default ReferralPage;
