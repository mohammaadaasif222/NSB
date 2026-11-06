import { useEffect, useRef, type FC } from 'react';

import { useActiveWelcome } from '@/context/ActiveWelcomeContext';
import { useTranslation } from '@/context/I18nContext';
import { BALANCE_REFRESH_EVENT } from '@/utils/balanceEvents';
import { formatOfferAmount, formatRewardAmount } from '@/utils/money';
import { welcomeContribution } from '@/utils/welcomeContribution';
import type { Game } from '@/types';

const REFRESH_MS = 30_000;

const GameBonusBar: FC<{ game: Game; className?: string }> = ({ game, className = '' }) => {
  const { t } = useTranslation();
  const { award, contributions, currency, refresh } = useActiveWelcome();
  const active = !!award;
  const refreshedAt = useRef(Date.now());

  useEffect(() => {
    if (!active) return undefined;
    const onBalance = (): void => {
      if (Date.now() - refreshedAt.current < REFRESH_MS) return;
      refreshedAt.current = Date.now();
      void refresh();
    };
    window.addEventListener(BALANCE_REFRESH_EVENT, onBalance);
    return () => window.removeEventListener(BALANCE_REFRESH_EVENT, onBalance);
  }, [active, refresh]);

  if (!award) return null;

  const progress = Math.max(0, Math.min(100, award.progress));
  const counts = contributions ? welcomeContribution(contributions, game) : 100;
  const money = (amount: string): string => formatRewardAmount(amount, currency, 'bonus.awards');

  return (
    <section
      aria-labelledby="game-bonus-title"
      className={`rounded-2xl border border-white/10 bg-white/5 px-4 py-3 ${className}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id="game-bonus-title" className="text-[13px] font-semibold leading-5 text-[#f0f1f5]">
          {t('welcome.gameBarTitle')}
        </h2>
        <p className="text-[12px] leading-4 text-[#9da2b4]">
          {t('welcome.panelProgress', {
            done: money(award.wagering_completed),
            required: money(award.wagering_required),
          })}
        </p>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label={t('welcome.panelProgressLabel')}
      >
        <div className="h-full rounded-full bg-[#f9d028]" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[12px] leading-4">
        <p className={counts === 0 ? 'text-amber-200' : 'text-[#9da2b4]'}>
          {counts === 0
            ? t('welcome.gameNotCounting')
            : counts < 100
              ? t('welcome.gameCounts', { percent: counts })
              : t('welcome.gameCountsFull')}
        </p>
        {award.max_bet_size && (
          <p className="font-medium text-[#f9d028]">
            {t('welcome.gameMaxBet', { maxBet: formatOfferAmount(award.max_bet_size, currency) })}
          </p>
        )}
      </div>
    </section>
  );
};

export default GameBonusBar;
