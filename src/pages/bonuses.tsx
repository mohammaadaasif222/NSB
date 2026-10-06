import type { FC, ReactNode } from 'react';
import Head from 'next/head';

import PlayerLayout from '@/layout/PlayerLayout';
import FaqAccordion from '@/components/player/FaqAccordion';
import SiteFooter from '@/components/player/SiteFooter';
import BonusGlassCard from '@/components/bonus/BonusGlassCard';
import BonusOfferCard from '@/components/bonus/BonusOfferCard';
import BonusCodeForm from '@/components/bonus/BonusCodeForm';
import BonusHistoryTable from '@/components/bonus/BonusHistoryTable';
import ActiveBonusCard from '@/components/bonus/ActiveBonusCard';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { useBonuses } from '@/hooks/useBonuses';
import { BONUS_DESCRIPTION_KEYS, BONUS_TITLE_KEYS, BONUS_TYPES } from '@/constants/bonus';

/** The design's three-across grid, 24 apart, inside the 1548 column. */
const GRID = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[calc(var(--u)*24)] lg:items-stretch';

/** A heading over one of the sections the design does not draw but the page keeps. */
const SubHeading: FC<{ children: ReactNode }> = ({ children }) => (
  <h2 className="text-[20px] font-semibold leading-7 text-[#f0f1f5] lg:text-[length:max(14px,calc(var(--u)*24))] lg:leading-[calc(var(--u)*32)]">
    {children}
  </h2>
);

/**
 * Deposit match, free spins, bonus cash and the rest.
 *
 * Laid out as the design's Bonuses frame: the title, the offers three across
 * in the 1548 column, then the shared FAQ and footer that close every long
 * page in the app.
 *
 * Public — a signed-out visitor gets the same grid, carrying what each kind of
 * bonus is and a way to join, because the page is worth reading before you
 * have an account. A player gets the real campaigns, what they are working
 * through, and what they have finished. Bonuses switched off in the console
 * are left out, except awards already running, which a player must still be
 * able to finish.
 */
const BonusesPage: FC = () => {
  const { token, hydrated } = useAuth();
  const { t, locale } = useTranslation();
  const { openRegister } = useAuthModal();
  const { summary, error, busyId, refresh, claim, forfeit } = useBonuses();

  const clockOffset = summary ? new Date(summary.server_time).getTime() - Date.now() : 0;

  /* --- A visitor: what the bonuses are, and a way in ------------------- */
  const visitorView = (
    <div className={GRID}>
      {BONUS_TYPES.map((type) => (
        <BonusGlassCard
          key={type}
          title={t(BONUS_TITLE_KEYS[type])}
          worth={{ label: t(BONUS_DESCRIPTION_KEYS[type]) }}
          action={{ kind: 'ghost', label: t('bonus.joinToClaim'), onClick: () => openRegister() }}
        />
      ))}
    </div>
  );

  /* --- A player: their own bonuses ------------------------------------- */
  const playerView = (): ReactNode => {
    if (!summary) {
      return (
        <section className="rl-glass-deep rounded-[24px] px-6 py-16 text-center lg:rounded-[calc(var(--u)*34)]">
          {error ? (
            <>
              <p className="text-sm text-white/64">{t('bonus.loadFailed')}</p>
              <button
                type="button"
                onClick={() => void refresh()}
                className="rl-btn-ghost mt-4 h-11 rounded-full px-6 text-xs font-semibold"
              >
                {t('bonus.retry')}
              </button>
            </>
          ) : (
            <p className="text-sm text-white/50">{t('common.loading')}</p>
          )}
        </section>
      );
    }

    return (
      <>
        {!summary.enabled && (
          <p className="rounded-[24px] bg-[#f9d028]/10 px-5 py-4 text-xs text-[#f9d028]">
            {t('bonus.switchedOff')}
          </p>
        )}

        {summary.available.length === 0 ? (
          <p className="rl-glass-deep rounded-[24px] px-6 py-16 text-center text-sm text-white/50 lg:rounded-[calc(var(--u)*34)]">
            {t('bonus.noneAvailable')}
          </p>
        ) : (
          <div className={GRID}>
            {summary.available.map((bonus) => (
              <BonusOfferCard
                key={bonus.id}
                bonus={bonus}
                currency={summary.currency}
                busyId={busyId}
                onClaim={(id) => void claim({ bonusId: id })}
              />
            ))}
          </div>
        )}

        {summary.active.length > 0 && (
          <section className="space-y-4 lg:space-y-[calc(var(--u)*24)]">
            <div className="flex items-baseline justify-between gap-3">
              <SubHeading>{t('bonus.yourBonuses')}</SubHeading>
              <span className="text-xs text-white/50">
                {t('bonus.slotsRemaining', { count: summary.slots_remaining })}
              </span>
            </div>
            <div className={GRID}>
              {summary.active.map((award) => (
                <ActiveBonusCard
                  key={award.id}
                  award={award}
                  currency={summary.currency}
                  clockOffset={clockOffset}
                  busyId={busyId}
                  onForfeit={(id) => void forfeit(id)}
                />
              ))}
            </div>
          </section>
        )}

        <BonusCodeForm busyId={busyId} onRedeem={(couponCode) => claim({ couponCode })} />

        {summary.history.length > 0 && (
          <section className="space-y-4 lg:space-y-[calc(var(--u)*24)]">
            <SubHeading>{t('bonus.history')}</SubHeading>
            <BonusHistoryTable
              awards={summary.history}
              currency={summary.currency}
              locale={locale}
            />
          </section>
        )}
      </>
    );
  };

  return (
    <PlayerLayout>
      <Head>
        <title>{`${t('bonus.title')} · ROLLUCK`}</title>
      </Head>

      {/* The design's 1548px content column, the same one the lobby and the
          footer use; `--u` (set by PlayerLayout) scales it on a narrower
          desktop so the three-across grid stays three across. */}
      <div className="mx-auto max-w-[1548px] space-y-10 px-1 lg:max-w-[calc(var(--u)*1548)] lg:space-y-[calc(var(--u)*80)] lg:px-0">
        <section className="space-y-5 lg:space-y-[calc(var(--u)*25)]">
          <h1 className="rl-h-section">{t('bonus.title')}</h1>
          {token && summary && (
            <p className="text-xs text-white/50">
              {t('bonus.paidTo', {
                currency: summary.payout.currency_code,
                network: summary.payout.network_code,
              })}
            </p>
          )}

          {/* Nothing until the token is restored, or a signed-in player would
              see the visitor grid flash first. */}
          {hydrated && (token ? playerView() : visitorView)}
        </section>

        <FaqAccordion />
        <SiteFooter />
      </div>
    </PlayerLayout>
  );
};

export default BonusesPage;
