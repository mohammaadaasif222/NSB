import { useCallback, useEffect, useState, type FC } from 'react';
import { toast } from 'react-toastify';

import apiService from '@/services/api';
import { useTranslation } from '@/context/I18nContext';
import { formatRewardAmount } from '@/utils/money';
import type { ApiError } from '@/types';

interface StreamerBonus {
  id: string;
  name: string;
  bonus_amount: string | null;
  wagering_multiplier: string | null;
  free_spins_count: number | null;
  valid_until: string | null;
  given: number;
}

interface StreamerView {
  bonuses: StreamerBonus[];
}

const StreamerGivePanel: FC<{ currency: string }> = ({ currency }) => {
  const { t } = useTranslation();
  const [view, setView] = useState<StreamerView | null>(null);
  const [handles, setHandles] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    try {
      const res = await apiService.get<StreamerView>('/bonuses/streamer');
      if (res?.success && res.data) setView(res.data);
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!view || view.bonuses.length === 0) return null;

  const give = async (bonus: StreamerBonus): Promise<void> => {
    const player = (handles[bonus.id] ?? '').trim();
    if (player.length < 2) return;
    setBusy(bonus.id);
    try {
      const res = await apiService.post<{ player: string }>(`/bonuses/streamer/${bonus.id}/give`, {
        player,
      });
      if (res?.success && res.data) {
        toast.success(t('bonus.streamerGiven', { player: res.data.player, bonus: bonus.name }));
        setHandles((prev) => ({ ...prev, [bonus.id]: '' }));
        await load();
      } else {
        toast.error(res?.message || t('bonus.streamerFailed'));
      }
    } catch (err) {
      toast.error((err as ApiError)?.message || t('bonus.streamerFailed'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="rl-glass-deep max-lg:rl-glass-clear rounded-[24px] p-5 lg:rounded-[calc(var(--u)*34)] lg:p-[calc(var(--u)*24)]">
      <h2 className="text-[18px] font-semibold text-white">{t('bonus.streamerTitle')}</h2>
      <p className="mt-1 text-[13px] text-white/56">{t('bonus.streamerHint')}</p>
      <div className="mt-4 space-y-3">
        {view.bonuses.map((bonus) => (
          <div
            key={bonus.id}
            className="flex flex-col gap-3 rounded-[20px] border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold text-white">{bonus.name}</p>
              <p className="text-[12px] text-white/50">
                {bonus.bonus_amount
                  ? formatRewardAmount(bonus.bonus_amount, currency, 'bonus.awards')
                  : bonus.free_spins_count
                    ? t('bonus.spinsCount', { count: bonus.free_spins_count })
                    : ''}
                {' · '}
                {t('bonus.streamerGivenCount', { count: bonus.given })}
              </p>
            </div>
            <div className="flex gap-2">
              <input
                className="h-10 w-full min-w-0 rounded-full border border-white/15 bg-white/5 px-4 text-[14px] text-white placeholder:text-white/40 sm:w-56"
                placeholder={t('bonus.streamerPlaceholder')}
                value={handles[bonus.id] ?? ''}
                onChange={(e) => setHandles((prev) => ({ ...prev, [bonus.id]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void give(bonus);
                }}
              />
              <button
                type="button"
                disabled={busy !== null || (handles[bonus.id] ?? '').trim().length < 2}
                onClick={() => void give(bonus)}
                className="rl-btn-gold h-10 shrink-0 rounded-full px-5 text-[13px] font-semibold disabled:opacity-50"
              >
                {t('bonus.streamerGive')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StreamerGivePanel;
