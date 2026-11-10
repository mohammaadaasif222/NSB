import { useCallback, useEffect, useState, type FC, type ReactElement } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';

import apiService from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { BONUS_REFRESH_EVENT } from '@/constants/events';
import { displayText } from '@/utils/displayText';
import { formatOfferAmount } from '@/utils/money';
import type { ApiError, DepositBonusOffer, DepositBonusOffers } from '@/types';

const NONE = 'none';

const CARD =
  'w-full rounded-[24px] border px-5 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60';

const DepositBonusPicker: FC<{ className?: string }> = ({ className = '' }) => {
  const { t, locale } = useTranslation();
  const { token } = useAuth();
  const [data, setData] = useState<DepositBonusOffers | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    if (!token) {
      setData(null);
      return;
    }
    try {
      const res = await apiService.get<DepositBonusOffers>('/bonuses/deposit-offers');
      if (res?.success && res.data) setData(res.data);
    } catch {
      return;
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const choose = async (bonusId: string | null): Promise<void> => {
    setSaving(true);
    try {
      const res = await apiService.post<DepositBonusOffers>('/bonuses/deposit-offers/choose', {
        bonus_id: bonusId,
      });
      if (res?.success && res.data) {
        setData(res.data);
        toast.success(bonusId ? t('bonus.depositPicked') : t('bonus.depositNone'));
        window.dispatchEvent(new Event(BONUS_REFRESH_EVENT));
      } else {
        toast.error(res?.message || t('bonus.depositPickFailed'));
      }
    } catch (err) {
      toast.error((err as ApiError)?.message || t('bonus.depositPickFailed'));
    } finally {
      setSaving(false);
    }
  };

  const offers = data?.offers ?? [];
  if (offers.length === 0) return null;

  const selected = data?.choice?.status === 'PENDING' ? data.choice.bonus_id : null;

  const headline = (offer: DepositBonusOffer): string => {
    const custom = displayText(offer.texts, locale, 'name');
    if (custom) return custom;
    if (offer.match_percentage && offer.max_bonus_amount) {
      return t('welcome.optionHeadline', {
        percent: offer.match_percentage,
        max: formatOfferAmount(offer.max_bonus_amount, 'USD'),
      });
    }
    return offer.name;
  };

  const detail = (offer: DepositBonusOffer): string =>
    [
      displayText(offer.texts, locale, 'description'),
      offer.min_deposit_amount
        ? t('bonus.depositMin', { amount: formatOfferAmount(offer.min_deposit_amount, 'USD') })
        : null,
      offer.wagering_multiplier && Number(offer.wagering_multiplier) > 0
        ? t('welcome.optionWagering', { wagering: Number(offer.wagering_multiplier) })
        : null,
      offer.max_bet_size
        ? t('bonus.depositMaxBet', { amount: formatOfferAmount(offer.max_bet_size, 'USD') })
        : null,
      offer.max_convertible
        ? t('welcome.optionConvertible', {
            amount: formatOfferAmount(offer.max_convertible, 'USD'),
          })
        : null,
      !offer.available && offer.reason ? offer.reason : null,
    ]
      .filter(Boolean)
      .join(' · ');

  const card = (
    key: string,
    title: string,
    text: string,
    disabled: boolean,
    onPick: () => void
  ): ReactElement => {
    const active = (selected ?? NONE) === key && (key !== NONE || !!data?.choice);
    return (
      <button
        key={key}
        type="button"
        role="radio"
        aria-checked={active}
        disabled={saving || disabled}
        onClick={onPick}
        className={`${CARD} ${
          active
            ? 'border-[#f9d028]/70 bg-[#f9d028]/10'
            : 'border-white/15 bg-white/5 hover:bg-white/10'
        }`}
      >
        <span className="flex items-center justify-between gap-3">
          <span className="text-[16px] font-semibold leading-6 text-[#f0f1f5]">{title}</span>
          {active && (
            <span className="text-[12px] font-medium leading-4 text-[#f9d028]">
              {t('welcome.selected')}
            </span>
          )}
        </span>
        {text && <span className="mt-0.5 block text-[13px] leading-5 text-[#9da2b4]">{text}</span>}
      </button>
    );
  };

  return (
    <section className={`space-y-2.5 ${className}`} aria-labelledby="deposit-bonus-title">
      <div>
        <h3 id="deposit-bonus-title" className="text-[16px] font-semibold leading-6 text-[#f0f1f5]">
          {t('bonus.depositPickTitle')}
        </h3>
        <p className="text-[13px] leading-5 text-[#9da2b4]">
          {selected ? t('bonus.depositPickSaved') : t('bonus.depositPickHint')}
        </p>
      </div>
      <div role="radiogroup" aria-labelledby="deposit-bonus-title" className="space-y-2">
        {offers.map((offer) =>
          card(offer.id, headline(offer), detail(offer), !offer.available, () => {
            if (selected !== offer.id) void choose(offer.id);
          })
        )}
        {card(NONE, t('welcome.noBonus'), '', false, () => {
          if (selected) void choose(null);
        })}
      </div>
      <p className="text-[12px] leading-4 text-white/48">
        {t('bonus.depositPickNote')}{' '}
        {selected && (
          <Link
            href={`/bonus-terms/${selected}`}
            target="_blank"
            className="text-[#f9d028] underline underline-offset-2"
          >
            {t('bonus.termsLink')}
          </Link>
        )}
      </p>
    </section>
  );
};

export default DepositBonusPicker;
