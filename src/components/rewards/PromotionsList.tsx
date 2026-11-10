import { useCallback, useEffect, useState, type FC } from 'react';
import { toast } from 'react-toastify';

import apiService from '@/services/api';
import { useTranslation } from '@/context/I18nContext';
import { displayText } from '@/utils/displayText';
import {
  CARD,
  GHOST_BUTTON,
  GOLD_BUTTON,
  LABEL,
  MUTED,
  PANEL,
  PANEL_TITLE,
} from '@/components/rewards/rewardStyles';
import type { ApiError, DisplayTexts } from '@/types';

interface PlayerPromotion {
  id: string;
  name: string;
  type: 'RAKEBACK' | 'CASHBACK';
  variant: 'STANDARD' | 'INSTANT';
  starts_at: string;
  ends_at: string | null;
  live: boolean;
  participation: 'AUTO' | 'OPT_IN';
  joined: boolean;
  can_join: boolean;
  reason: string | null;
  spots_left: number | null;
  texts: DisplayTexts<'name' | 'description' | 'terms'>;
  terms_slug: string | null;
}

const PromotionsList: FC = () => {
  const { t, locale } = useTranslation();
  const [rows, setRows] = useState<PlayerPromotion[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmLeave, setConfirmLeave] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    try {
      const res = await apiService.get<PlayerPromotion[]>('/rewards/promotions');
      if (res?.success && res.data) setRows(res.data);
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (id: string, action: 'join' | 'leave'): Promise<void> => {
    setBusy(id);
    try {
      const res = await apiService.post<PlayerPromotion[]>(`/rewards/promotions/${id}/${action}`);
      if (res?.success && res.data) {
        setRows(res.data);
        toast.success(action === 'join' ? t('rewards.promoJoined') : t('rewards.promoLeft'));
      } else {
        toast.error(res?.message || t('rewards.promoFailed'));
      }
    } catch (err) {
      toast.error((err as ApiError)?.message || t('rewards.promoFailed'));
    } finally {
      setBusy(null);
      setConfirmLeave(null);
    }
  };

  const optIn = (rows ?? []).filter((row) => row.participation === 'OPT_IN');
  if (optIn.length === 0) return null;

  return (
    <section className={PANEL} aria-labelledby="reward-promotions-title">
      <h2 id="reward-promotions-title" className={PANEL_TITLE}>
        {t('rewards.promotionsTitle')}
      </h2>
      <p className={`mt-1 ${MUTED}`}>{t('rewards.promotionsHint')}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {optIn.map((promo) => {
          const title = displayText(promo.texts, locale, 'name') ?? promo.name;
          const description = displayText(promo.texts, locale, 'description');
          const ends = promo.ends_at
            ? new Date(promo.ends_at).toLocaleDateString(locale, { day: 'numeric', month: 'short' })
            : null;
          return (
            <article key={promo.id} className={`${CARD} flex flex-col gap-2`}>
              <p className={LABEL}>
                {promo.type === 'CASHBACK'
                  ? promo.variant === 'INSTANT'
                    ? t('rewards.promoInstantCashback')
                    : t('rewards.promoCashback')
                  : t('rewards.promoRakeback')}
                {ends ? ` · ${t('rewards.promoEnds', { date: ends })}` : ''}
              </p>
              <h3 className="text-[16px] font-semibold leading-6 text-[#f0f1f5]">{title}</h3>
              {description && <p className={MUTED}>{description}</p>}
              {promo.spots_left !== null && !promo.joined && (
                <p className={LABEL}>{t('rewards.promoSpots', { count: promo.spots_left })}</p>
              )}
              <div className="mt-auto pt-2">
                {promo.joined ? (
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => {
                      if (confirmLeave !== promo.id) {
                        setConfirmLeave(promo.id);
                        return;
                      }
                      void act(promo.id, 'leave');
                    }}
                    className={`${GHOST_BUTTON} w-full`}
                  >
                    {confirmLeave === promo.id
                      ? t('rewards.promoLeaveConfirm')
                      : t('rewards.promoLeave')}
                  </button>
                ) : promo.can_join ? (
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void act(promo.id, 'join')}
                    className={`${GOLD_BUTTON} w-full`}
                  >
                    {t('rewards.promoJoin')}
                  </button>
                ) : (
                  <p className={MUTED}>{promo.reason ?? t('rewards.promoClosed')}</p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default PromotionsList;
