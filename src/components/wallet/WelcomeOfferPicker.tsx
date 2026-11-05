import { useState, type FC, type ReactElement } from 'react';

import { useTranslation } from '@/context/I18nContext';
import { useWelcomeOffer } from '@/hooks/useWelcomeOffer';
import { formatOfferAmount as welcomeMoney } from '@/utils/money';
import type { WelcomeOfferOption } from '@/types';
import WelcomeBonusPanel from '@/components/bonus/WelcomeBonusPanel';

const NONE = 'none';
const EXAMPLES = [50, 100, 500, 1000];

const CARD =
  'w-full rounded-[24px] border px-5 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60';

const grantFor = (option: WelcomeOfferOption, deposit: number): number => {
  const matched = Math.floor(deposit * option.match_percentage) / 100;
  const cap = option.max_bonus_amount ? Number(option.max_bonus_amount) : null;
  return cap !== null && matched > cap ? cap : matched;
};

const WelcomeOfferPicker: FC<{ className?: string }> = ({ className = '' }) => {
  const { t } = useTranslation();
  const { offer, saving, choose, cancel } = useWelcomeOffer();
  const [example, setExample] = useState<number | null>(null);

  if (!offer?.enabled) return null;

  if (offer.award?.status === 'ACTIVE') {
    const award = offer.award;
    return (
      <WelcomeBonusPanel
        award={award}
        currency={offer.currency}
        busy={saving}
        onCancel={() => void cancel(award.id)}
        className={className}
      />
    );
  }

  if (!offer.eligible || offer.options.length === 0) return null;

  const minimum = Number(offer.min_deposit);
  const amounts = [...new Set([minimum, ...EXAMPLES])]
    .filter((amount) => amount >= minimum && amount > 0)
    .sort((a, b) => a - b)
    .slice(0, 5);
  const deposit = example ?? amounts.find((amount) => amount >= 50) ?? amounts[0] ?? minimum;
  const money = (amount: number): string => welcomeMoney(String(amount), offer.currency);

  const min = welcomeMoney(offer.min_deposit, offer.currency);
  const selected =
    offer.choice?.status === 'PENDING'
      ? offer.choice.bonus_id
      : offer.choice?.status === 'DECLINED'
        ? NONE
        : null;
  const chosen = offer.options.find((option) => option.id === selected) ?? null;

  const headline = (option: WelcomeOfferOption): string =>
    option.max_bonus_amount
      ? t('welcome.optionHeadline', {
          percent: option.match_percentage,
          max: welcomeMoney(option.max_bonus_amount, offer.currency),
        })
      : t('welcome.optionHeadlineNoCap', { percent: option.match_percentage });

  const terms = (option: WelcomeOfferOption): string =>
    [
      t('welcome.exampleGet', { deposit: money(deposit), bonus: money(grantFor(option, deposit)) }),
      t('welcome.optionWagering', { wagering: Number(option.wagering_multiplier) }),
      option.max_convertible
        ? t('welcome.optionConvertible', {
            amount: welcomeMoney(option.max_convertible, offer.currency),
          })
        : null,
    ]
      .filter(Boolean)
      .join(' · ');

  const card = (key: string, title: string, detail: string, onPick: () => void): ReactElement => {
    const active = selected === key;
    return (
      <button
        key={key}
        type="button"
        role="radio"
        aria-checked={active}
        disabled={saving}
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
        <span className="mt-0.5 block text-[13px] leading-5 text-[#9da2b4]">{detail}</span>
      </button>
    );
  };

  const chosenGrant = chosen ? grantFor(chosen, deposit) : 0;

  return (
    <section className={`space-y-2.5 ${className}`} aria-labelledby="welcome-offer-title">
      <div>
        <h3 id="welcome-offer-title" className="text-[16px] font-semibold leading-6 text-[#f0f1f5]">
          {t('welcome.pickTitle')}
        </h3>
        <p className="text-[13px] leading-5 text-[#9da2b4]">
          {selected === NONE
            ? t('welcome.declined')
            : selected
              ? t('welcome.saved', { min })
              : t('welcome.pickHint', { min })}
        </p>
      </div>

      <div className="flex items-center gap-2" role="group" aria-label={t('welcome.exampleLabel')}>
        <span className="shrink-0 text-[12px] leading-4 text-[#9da2b4]">
          {t('welcome.exampleLabel')}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {amounts.map((amount) => (
            <button
              key={amount}
              type="button"
              aria-pressed={amount === deposit}
              onClick={() => setExample(amount)}
              className={`h-8 rounded-full border px-3 text-[13px] font-medium leading-5 transition-colors ${
                amount === deposit
                  ? 'border-[#f9d028]/70 bg-[#f9d028]/10 text-[#f9d028]'
                  : 'border-white/15 bg-white/5 text-[#f0f1f5] hover:bg-white/10'
              }`}
            >
              {money(amount)}
            </button>
          ))}
        </div>
      </div>

      <div role="radiogroup" aria-labelledby="welcome-offer-title" className="space-y-2">
        {offer.options.map((option) =>
          card(option.id, headline(option), terms(option), () => {
            if (selected !== option.id) void choose(option.id);
          })
        )}
        {card(NONE, t('welcome.noBonus'), t('welcome.noBonusHint'), () => {
          if (selected !== NONE) void choose(null);
        })}
      </div>

      {chosen && chosenGrant > 0 && (
        <p className="rounded-[20px] border border-[#3ad07a]/30 bg-[#3ad07a]/10 px-4 py-2.5 text-[13px] leading-5 text-[#f0f1f5]">
          {t('welcome.examplePlay', {
            bonus: money(chosenGrant),
            required: money(chosenGrant * Number(chosen.wagering_multiplier)),
            wagering: Number(chosen.wagering_multiplier),
          })}
        </p>
      )}

      <p className="text-[12px] leading-4 text-white/48">
        {t('welcome.rules', {
          maxBet: welcomeMoney(offer.max_bet, offer.currency),
          days: offer.validity_days,
        })}
      </p>
    </section>
  );
};

export default WelcomeOfferPicker;
