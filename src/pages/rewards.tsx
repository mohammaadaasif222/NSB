import { useEffect, useState, type FC } from 'react';

import PlayerLayout from '@/layout/PlayerLayout';
import SiteFooter from '@/components/player/SiteFooter';
import RewardCard from '@/components/rewards/RewardCard';
import RewardDetailModal from '@/components/rewards/RewardDetailModal';
import RewardInfoButton from '@/components/rewards/RewardInfoButton';
import TierCard from '@/components/rewards/TierCard';
import RewardHistory from '@/components/rewards/RewardHistory';
import VipTierTable from '@/components/rewards/VipTierTable';
import { REWARD_ICONS } from '@/components/icons';
import apiService from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { usePlatformFeatures } from '@/context/PlatformFeaturesContext';
import { useRewards } from '@/hooks/useRewards';
import { REWARD_TITLE_KEYS, REWARD_TYPES } from '@/constants/rewards';
import type { RewardType, VipTier } from '@/types';
import Seo from '@/components/seo/Seo';
import {
  CARD,
  GHOST_BUTTON,
  GOLD_BUTTON,
  ICON_WELL,
  LABEL,
  MUTED,
  PANEL,
  PANEL_TITLE,
} from '@/components/rewards/rewardStyles';

/**
 * The row of reward cards, scrolled rather than reflowed.
 *
 * Five cards never fit across a phone, and the grid this replaces stacked them
 * into two columns three deep — which pushed the Claim buttons far below the
 * fold and made the page a long scroll past copy the player had already read.
 * One swipeable row keeps every reward one gesture away at any width, and at
 * xl the five columns still land exactly as the grid did.
 *
 * The negative margins are not decoration: `overflow-x` on the track forces
 * the other axis to clip too, which would shave the gold glow off a claimable
 * card. The padding gives it room and the margins take the space back.
 */
const REWARD_TRACK =
  'rl-shelf rl-track flex -mx-1 -my-3 px-1 py-3 [--cols:1.15] [--gap:16px] sm:[--cols:2.2] lg:[--cols:3.5] xl:[--cols:5]';

/**
 * What each reward is — shown to a visitor who is not signed in.
 *
 * The same short card the signed-in row uses: the description that used to
 * fill it sits behind the info button now, so the two states of this page are
 * one object rather than two that happen to share a row. A visitor reading
 * about the rewards gets more detail than the old paragraph carried, not
 * less — the dialog has the accrual frequency, the payout split and the VIP
 * perks under it (RewardDetailModal).
 */
const RewardExplainer: FC = () => {
  const { t } = useTranslation();
  const [openType, setOpenType] = useState<RewardType | null>(null);

  return (
    <div>
      <div className={REWARD_TRACK}>
        {REWARD_TYPES.map((type) => {
          const Icon = REWARD_ICONS[type];
          const title = t(REWARD_TITLE_KEYS[type]);
          return (
            <article key={type} className={`flex h-full flex-col ${CARD}`}>
              <div className="flex items-start justify-between gap-2">
                <span className={ICON_WELL(false)} aria-hidden="true">
                  <Icon size={20} />
                </span>
                <RewardInfoButton
                  reward={title}
                  open={openType === type}
                  onClick={() => setOpenType((open) => (open === type ? null : type))}
                />
              </div>
              <h3 className="mt-3 text-[16px] leading-6 font-medium text-[#f0f1f5]">{title}</h3>
            </article>
          );
        })}
      </div>

      {openType && <RewardDetailModal type={openType} onClose={() => setOpenType(null)} />}
    </div>
  );
};

/**
 * Rakeback, cashback and the daily / weekly / monthly bonuses.
 *
 * Public: a signed-out visitor sees what the rewards are and the VIP ladder,
 * with a way to sign in. A player sees their tier, a card per reward with its
 * Claim button, and their reward history. Rewards switched off in the console
 * are left out.
 */
const RewardsPage: FC = () => {
  const { token, hydrated } = useAuth();
  const { t } = useTranslation();
  const { openLogin, openRegister } = useAuthModal();
  const { rewards: rewardsOn } = usePlatformFeatures();
  const { summary, error, claiming, clockOffset, refresh, claim } = useRewards();

  const [tiers, setTiers] = useState<VipTier[]>([]);
  const [tiersLoading, setTiersLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiService
      .get<{ data: VipTier[] }>('/vip-levels')
      .then((res) => {
        if (active && res?.success && res.data) {
          setTiers(res.data.data ?? []);
        }
      })
      .catch(() => {
        /* the ladder shows its empty state */
      })
      .finally(() => {
        if (active) {
          setTiersLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const playerView = (): React.ReactNode => {
    if (!summary) {
      return (
        <section className={`${PANEL} py-16 text-center`}>
          {error ? (
            <>
              <p className={MUTED}>{t('rewards.loadFailed')}</p>
              <button
                type="button"
                onClick={() => void refresh()}
                className={`mt-4 ${GOLD_BUTTON}`}
              >
                {t('rewards.retry')}
              </button>
            </>
          ) : (
            <p className={MUTED}>{t('common.loading')}</p>
          )}
        </section>
      );
    }

    return (
      <>
        <TierCard summary={summary} />

        {/* Soft light behind the cards: glass on a flat black page has nothing
            to show through it, so two faint glows sit under the row for the
            cards to blur. */}
        <div className="relative isolate">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-[8%] top-1/2 -z-10 h-[70%] w-[38%] -translate-y-1/2 rounded-full bg-[#f9d028]/[0.10] blur-[90px]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-[6%] top-1/2 -z-10 h-[70%] w-[40%] -translate-y-1/2 rounded-full bg-[#7b5cff]/[0.12] blur-[90px]"
          />
          <div className={REWARD_TRACK}>
            {summary.rewards
              .filter((reward) => reward.enabled)
              .map((reward) => (
                <RewardCard
                  key={reward.type}
                  reward={reward}
                  currency={summary.currency}
                  clockOffset={clockOffset}
                  claiming={claiming}
                  onClaim={(type) => void claim(type)}
                />
              ))}
          </div>
        </div>

        <RewardHistory currency={summary.currency} />
      </>
    );
  };

  /**
   * Switched off platform-wide: say so and stop.
   *
   * Every link to this page is hidden in that state, so the only way here is a
   * bookmark or a typed address — which is exactly why this is a sentence
   * rather than a 404. A player who earned a balance last week should be told
   * it is still theirs, not shown a dead end. The API refuses the underlying
   * calls anyway, so there is nothing to render below even if we tried.
   */
  if (!rewardsOn) {
    return (
      <PlayerLayout>
        <Seo title={t('rewards.title')} noindex />
        <div className="mx-auto max-w-[1600px] pb-2">
          <section className={`${PANEL} py-16 text-center`}>
            <h1 className={PANEL_TITLE}>{t('rewards.switchedOff')}</h1>
            <p className={`mx-auto mt-2 max-w-xl ${MUTED}`}>{t('rewards.switchedOffNote')}</p>
          </section>
          <div className="mt-10 lg:mt-[calc(var(--u)*80)]">
            <SiteFooter />
          </div>
        </div>
      </PlayerLayout>
    );
  }

  return (
    <PlayerLayout>
      <Seo title={t('rewards.title')} description={t('misc.meta.rewards')} />

      {/* The wallet page's frame: the 1548 column, 40 under the bar, the
          44px title. */}
      <div className="mx-auto max-w-[1548px] space-y-5 px-1 pb-2 lg:max-w-[calc(var(--u)*1548)] lg:space-y-[calc(var(--u)*20)] lg:px-0 lg:pt-[calc(var(--u)*24)]">
        <header className="pb-1">
          <h1 className="text-[24px] leading-8 font-medium text-[#f0f1f5] lg:text-[length:max(24px,calc(var(--u)*44))] lg:leading-[1.18] lg:font-semibold">
            {t('rewards.title')}
          </h1>
          <p className={`mt-2 max-w-2xl ${MUTED} sm:text-[16px] sm:leading-6`}>
            {t('rewards.subtitle')}
          </p>
          {token && summary && (
            <p className={`mt-1 max-w-2xl ${LABEL}`}>
              {t('rewards.paidTo', {
                currency: summary.payout.currency_code,
                network: summary.payout.network_code,
              })}
            </p>
          )}
        </header>

        {/* Nothing until the token is restored, or a signed-in player would see the visitor view flash first. */}
        {hydrated &&
          (token ? (
            playerView()
          ) : (
            <>
              <section
                className={`${PANEL} flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between`}
              >
                <p className="text-[16px] leading-6 text-[#f0f1f5]">{t('rewards.loginPrompt')}</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => openLogin()} className={GHOST_BUTTON}>
                    {t('account.login')}
                  </button>
                  <button type="button" onClick={() => openRegister()} className={GOLD_BUTTON}>
                    {t('account.register')}
                  </button>
                </div>
              </section>
              <RewardExplainer />
            </>
          ))}

        <VipTierTable
          tiers={tiers}
          currentTierId={summary?.tier?.id}
          currency={summary?.currency ?? 'USD'}
          loading={tiersLoading}
        />

        <div className="!mt-10 lg:!mt-[calc(var(--u)*96)]">
          <SiteFooter />
        </div>
      </div>
    </PlayerLayout>
  );
};

export default RewardsPage;
