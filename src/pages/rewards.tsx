import { useEffect, useState, type FC } from 'react';
import Head from 'next/head';

import PlayerLayout from '@/layout/PlayerLayout';
import RewardCard from '@/components/rewards/RewardCard';
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
import { REWARD_DESCRIPTION_KEYS, REWARD_TITLE_KEYS, REWARD_TYPES } from '@/constants/rewards';
import type { VipTier } from '@/types';

/** What each reward is — shown to a visitor who is not signed in. */
const RewardExplainer: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {REWARD_TYPES.map((type) => {
        const Icon = REWARD_ICONS[type];
        return (
          <article key={type} className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/15 text-blue-300"
              aria-hidden="true"
            >
              <Icon size={20} />
            </span>
            <h3 className="mt-3 text-base font-bold text-white">{t(REWARD_TITLE_KEYS[type])}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              {t(REWARD_DESCRIPTION_KEYS[type])}
            </p>
          </article>
        );
      })}
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
        <section className="rounded-3xl bg-slate-900 border border-slate-800 px-6 py-16 text-center">
          {error ? (
            <>
              <p className="text-sm text-slate-400">{t('rewards.loadFailed')}</p>
              <button
                type="button"
                onClick={() => void refresh()}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
              >
                {t('rewards.retry')}
              </button>
            </>
          ) : (
            <p className="text-sm text-slate-500">{t('common.loading')}</p>
          )}
        </section>
      );
    }

    return (
      <>
        <TierCard summary={summary} />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
        <Head>
          <title>{`${t('rewards.title')} · ROLLUCK`}</title>
        </Head>
        <div className="mx-auto max-w-[1600px] pb-2">
          <section className="rounded-3xl bg-slate-900 border border-slate-800 px-6 py-16 text-center">
            <h1 className="text-lg font-bold text-white">{t('rewards.switchedOff')}</h1>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
              {t('rewards.switchedOffNote')}
            </p>
          </section>
        </div>
      </PlayerLayout>
    );
  }

  return (
    <PlayerLayout>
      <Head>
        <title>{`${t('rewards.title')} · ROLLUCK`}</title>
      </Head>

      <div className="mx-auto max-w-[1600px] space-y-6 pb-2">
        <header>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{t('rewards.title')}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">{t('rewards.subtitle')}</p>
          {token && summary && (
            <p className="mt-1 max-w-2xl text-xs text-slate-500">
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
              <section className="flex flex-col items-start gap-4 rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <p className="text-sm text-slate-300">{t('rewards.loginPrompt')}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openLogin()}
                    className="inline-flex h-10 items-center rounded-xl bg-slate-800 border border-slate-700 px-4 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                  >
                    {t('account.login')}
                  </button>
                  <button
                    type="button"
                    onClick={() => openRegister()}
                    className="inline-flex h-10 items-center rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
                  >
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
      </div>
    </PlayerLayout>
  );
};

export default RewardsPage;
