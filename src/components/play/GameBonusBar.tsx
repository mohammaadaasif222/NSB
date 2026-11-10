import { useCallback, useEffect, useRef, useState, type FC } from 'react';

import apiService from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useActiveBonus } from '@/context/ActiveBonusContext';
import { useTranslation } from '@/context/I18nContext';
import { BALANCE_REFRESH_EVENT } from '@/utils/balanceEvents';
import { formatOfferAmount } from '@/utils/money';
import type { ActiveBonusTerms, Game } from '@/types';

const REFRESH_MS = 30_000;

type TermsBonus = ActiveBonusTerms['bonuses'][number];

const GameBonusBar: FC<{ game: Game; className?: string }> = ({ game, className = '' }) => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const { primary } = useActiveBonus();
  const [bonus, setBonus] = useState<TermsBonus | null>(null);
  const refreshedAt = useRef(0);
  const active = !!token && !!primary;

  const load = useCallback(async (): Promise<void> => {
    refreshedAt.current = Date.now();
    try {
      const res = await apiService.get<ActiveBonusTerms>('/bonuses/active/terms', {
        game_id: game.id,
      });
      if (res?.success && res.data) setBonus(res.data.bonuses[0] ?? null);
    } catch {
      return;
    }
  }, [game.id]);

  useEffect(() => {
    if (!active) {
      setBonus(null);
      return undefined;
    }
    void load();
    const onBalance = (): void => {
      if (Date.now() - refreshedAt.current < REFRESH_MS) return;
      void load();
    };
    window.addEventListener(BALANCE_REFRESH_EVENT, onBalance);
    return () => window.removeEventListener(BALANCE_REFRESH_EVENT, onBalance);
  }, [active, load]);

  if (!active || !bonus) return null;

  const progress = Math.max(0, Math.min(100, bonus.progress));
  const counts = bonus.game?.contribution ?? 100;

  return (
    <section
      aria-labelledby="game-bonus-title"
      className={`rounded-2xl border border-white/10 bg-white/5 px-4 py-3 ${className}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id="game-bonus-title" className="text-[13px] font-semibold leading-5 text-[#f0f1f5]">
          {bonus.welcome ? t('welcome.gameBarTitle') : bonus.name}
        </h2>
        <p className="text-[12px] leading-4 text-[#9da2b4]">
          {t('bonus.gameBarLeft', {
            amount: formatOfferAmount(bonus.wagering_remaining, 'USD'),
            percent: Math.floor(progress),
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
        {bonus.max_bet && (
          <p className="font-medium text-[#f9d028]">
            {t('welcome.gameMaxBet', { maxBet: formatOfferAmount(bonus.max_bet, 'USD') })}
          </p>
        )}
      </div>
    </section>
  );
};

export default GameBonusBar;
