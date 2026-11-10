import { useCallback, useEffect, useRef, useState, type FC } from 'react';
import { toast } from 'react-toastify';

import GlassDialog from '@/components/ui/GlassDialog';
import apiService from '@/services/api';
import { realtimeService } from '@/services/realtimeService';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { WALLET_REFRESH_EVENT } from '@/constants/events';
import { BONUS_TITLE_KEYS } from '@/constants/bonus';
import { displayText } from '@/utils/displayText';
import { formatRewardAmount } from '@/utils/money';
import type { ApiError, AvailableBonus, BonusClaimResult, BonusSummary } from '@/types';

const NOTIFICATION_EVENT = 'notification.new';
const DISMISSED_KEY = 'rl_group_choice_dismissed';
const MIN_GAP_MS = 20_000;

interface Choice {
  key: string;
  name: string;
  max: number;
  offers: AvailableBonus[];
}

const readDismissed = (): string[] => {
  try {
    const raw = window.localStorage.getItem(DISMISSED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

const remember = (key: string): void => {
  try {
    const next = [...readDismissed().filter((item) => item !== key), key].slice(-20);
    window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
  } catch {
    return;
  }
};

const pickChoice = (offers: AvailableBonus[]): Choice | null => {
  const byGroup = new Map<string, AvailableBonus[]>();
  for (const offer of offers) {
    if (!offer.claimable || !offer.group || offer.group.pick_mode !== 'PLAYER_PICKS') continue;
    if (offer.claim_mode === 'OPT_IN') continue;
    byGroup.set(offer.group.id, [...(byGroup.get(offer.group.id) ?? []), offer]);
  }
  const dismissed = readDismissed();
  for (const [groupId, list] of byGroup) {
    if (list.length < 2) continue;
    const key = `${groupId}:${list
      .map((offer) => offer.id)
      .sort()
      .join(',')}`;
    if (dismissed.includes(key)) continue;
    const group = list[0].group;
    return { key, name: group?.name ?? '', max: group?.max_per_player ?? 1, offers: list };
  }
  return null;
};

const GroupChoicePopup: FC = () => {
  const { t, locale } = useTranslation();
  const { token } = useAuth();
  const [choice, setChoice] = useState<Choice | null>(null);
  const [currency, setCurrency] = useState('USD');
  const [busy, setBusy] = useState<string | null>(null);
  const lastCheck = useRef(0);

  const check = useCallback(async (): Promise<void> => {
    if (!token || Date.now() - lastCheck.current < MIN_GAP_MS) return;
    lastCheck.current = Date.now();
    try {
      const res = await apiService.get<BonusSummary>('/bonuses/me');
      if (!res?.success || !res.data) return;
      setCurrency(res.data.currency);
      setChoice(pickChoice(res.data.available ?? []));
    } catch {
      return;
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setChoice(null);
      return undefined;
    }
    const onNew = (): void => void check();
    realtimeService.on(NOTIFICATION_EVENT, onNew);
    return () => realtimeService.off(NOTIFICATION_EVENT, onNew);
  }, [token, check]);

  if (!choice) return null;

  const close = (): void => {
    remember(choice.key);
    setChoice(null);
  };

  const claim = async (offer: AvailableBonus): Promise<void> => {
    setBusy(offer.id);
    try {
      const res = await apiService.post<BonusClaimResult>('/bonuses/claim', { bonus_id: offer.id });
      if (res?.success) {
        toast.success(t('bonus.claimedNoCash', { bonus: offer.name }));
        window.dispatchEvent(new Event(WALLET_REFRESH_EVENT));
        remember(choice.key);
        setChoice(null);
        lastCheck.current = 0;
        void check();
      } else {
        toast.error(res?.message || t('bonus.claimFailed'));
      }
    } catch (err) {
      toast.error((err as ApiError)?.message || t('bonus.claimFailed'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <GlassDialog
      open
      onClose={close}
      titleId="group-choice-title"
      title={t('bonus.groupTitle')}
      titleVariant="title"
      phoneSheet="fit"
      className="w-full p-6 sm:w-[min(480px,92vw)] sm:p-8"
    >
      <div className="mt-3 space-y-3">
        <p className="text-[14px] leading-5 text-[#9da2b4]">
          {choice.max > 1
            ? t('bonus.groupHintMany', { count: choice.max })
            : t('bonus.groupHintOne')}
        </p>
        <div className="space-y-2">
          {choice.offers.map((offer) => {
            const worth = offer.estimated_amount
              ? formatRewardAmount(offer.estimated_amount, currency, 'bonus.awards')
              : offer.free_spins_count
                ? t('bonus.spinsCount', { count: offer.free_spins_count })
                : null;
            return (
              <button
                key={offer.id}
                type="button"
                disabled={busy !== null}
                onClick={() => void claim(offer)}
                className="w-full rounded-[20px] border border-white/15 bg-white/5 px-4 py-3 text-left transition-colors hover:bg-white/10 disabled:opacity-60"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-[15px] font-semibold text-[#f0f1f5]">
                    {displayText(offer.texts, locale, 'name') ?? offer.name}
                  </span>
                  {worth && (
                    <span className="text-[14px] font-semibold text-[#f9d028]">{worth}</span>
                  )}
                </span>
                <span className="mt-0.5 block text-[12px] text-[#9da2b4]">
                  {t(BONUS_TITLE_KEYS[offer.type])}
                  {Number(offer.wagering_multiplier ?? 0) > 0
                    ? ` · ${t('bonus.terms.wagering', { multiplier: Number(offer.wagering_multiplier) })}`
                    : ''}
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={close}
          className="flex h-11 w-full items-center justify-center rounded-full bg-white/10 text-[14px] font-medium text-white/80 hover:bg-white/15"
        >
          {t('bonus.groupLater')}
        </button>
      </div>
    </GlassDialog>
  );
};

export default GroupChoicePopup;
