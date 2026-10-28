import { useMemo, useState, type FC, type ReactNode } from 'react';
import type { GetServerSideProps } from 'next';

import PlayerLayout from '@/layout/PlayerLayout';
import FaqAccordion from '@/components/player/FaqAccordion';
import SiteFooter from '@/components/player/SiteFooter';
import WalletModal from '@/components/wallet/WalletModal';
import WelcomePackPanel from '@/components/bonus/WelcomePackPanel';
import RegularBonusRow from '@/components/bonus/RegularBonusRow';
import { useTranslation } from '@/context/I18nContext';
import { usePlatformFeatures } from '@/context/PlatformFeaturesContext';
import { useBonuses } from '@/hooks/useBonuses';
import Seo from '@/components/seo/Seo';
import { fetchFaqsServer } from '@/services/faqs.server';
import type { FaqItem } from '@/services/faqs';

const SubHeading: FC<{ children: ReactNode }> = ({ children }) => (
  <h2 className="text-[20px] font-semibold leading-7 tracking-[-0.02em] text-white lg:text-[length:max(14px,calc(var(--u)*24))] lg:leading-[calc(var(--u)*32)]">
    {children}
  </h2>
);

const Section: FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
  <section className="space-y-4 lg:space-y-[calc(var(--u)*16)]">
    <SubHeading>{title}</SubHeading>
    {children}
  </section>
);

const PANEL = 'rl-glass-deep max-lg:rl-glass-clear rounded-[24px] px-5 py-16 text-center lg:rounded-[calc(var(--u)*34)]';

const COLUMN =
  'mx-auto max-w-[1548px] space-y-10 px-1 lg:max-w-[calc(var(--u)*1548)] lg:space-y-[calc(var(--u)*80)] lg:px-0';

interface Props {
  faqs: FaqItem[];
}

const BonusesPage: FC<Props> = ({ faqs }) => {
  const { t } = useTranslation();
  const { bonuses: bonusesOn } = usePlatformFeatures();
  const { summary, loading, error, busyId, signedIn, clockOffset, refresh, claim, forfeit } =
    useBonuses();

  const [walletOpen, setWalletOpen] = useState(false);

  const welcomeStages = useMemo(() => {
    if (!summary || !summary.welcome_enabled) {
      return [];
    }
    return summary.welcome.filter((stage) => stage.status !== 'UNAVAILABLE' || !!stage.reason);
  }, [summary]);

  const regularAwards = useMemo(() => {
    if (!summary) {
      return [];
    }
    const shown = new Set(
      welcomeStages.map((stage) => stage.bonus_id).filter((id): id is string => !!id)
    );
    return summary.active.filter((award) => !shown.has(award.bonus.id));
  }, [summary, welcomeStages]);

  if (!bonusesOn || summary?.enabled === false) {
    return (
      <PlayerLayout>
        <Seo title={t('bonus.title')} noindex />
        <div className={COLUMN}>
          <section className={PANEL}>
            <h1 className="text-[22px] font-semibold leading-8 text-[#f0f1f5]">
              {t('bonus.switchedOff')}
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-[14px] leading-5 text-white/56">
              {t('bonus.switchedOffNote')}
            </p>
          </section>
          <SiteFooter />
        </div>
      </PlayerLayout>
    );
  }

  const pending = !summary && !error;
  const failed = !summary && !!error;

  return (
    <PlayerLayout>
      <Seo title={t('bonus.title')} description={t('misc.meta.bonuses')} />

      <div className={COLUMN}>
        {error && (
          <section className="rl-glass-deep max-lg:rl-glass-clear flex flex-wrap items-center justify-between gap-3 rounded-[24px] px-5 py-4 lg:rounded-[calc(var(--u)*34)]">
            <p className="text-[13px] leading-5 text-white/64">{t('bonus.loadFailed')}</p>
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={loading}
              className="rl-btn-ghost flex h-10 items-center justify-center rounded-full px-5 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? t('common.loading') : t('bonus.retry')}
            </button>
          </section>
        )}

        <WelcomePackPanel
          stages={welcomeStages}
          currency={summary?.currency ?? 'USD'}
          enabled={summary?.welcome_enabled ?? true}
          pending={pending}
          failed={failed}
          signedIn={signedIn}
          clockOffset={clockOffset}
          busyId={busyId}
          onClaim={(bonusId) => void claim({ bonusId })}
          onForfeit={(awardId) => void forfeit(awardId)}
          onDeposit={() => setWalletOpen(true)}
        />

        <Section title={t('bonus.regularBonuses')}>
          <RegularBonusRow
            offers={summary?.available ?? []}
            awards={regularAwards}
            currency={summary?.currency ?? 'USD'}
            enabled={summary?.regular_enabled ?? true}
            pending={pending}
            failed={failed}
            clockOffset={clockOffset}
            busyId={busyId}
            onClaim={(bonusId) => void claim({ bonusId })}
            onForfeit={(awardId) => void forfeit(awardId)}
            onDeposit={() => setWalletOpen(true)}
          />
        </Section>

        <FaqAccordion items={faqs} />
        <SiteFooter />
      </div>

      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} initialTab="deposit" />
    </PlayerLayout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => ({
  props: { faqs: await fetchFaqsServer() },
});

export default BonusesPage;
