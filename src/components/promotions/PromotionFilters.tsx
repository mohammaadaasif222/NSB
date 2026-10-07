import type { FC } from 'react';

import { useTranslation } from '@/context/I18nContext';
import type { TranslationKey } from '@/i18n/locales';

export type PromoCategory = 'all' | 'casino' | 'sports';
export type PromoStatus = 'live' | 'expired';

const CATEGORIES: { key: PromoCategory; label: TranslationKey }[] = [
  { key: 'all', label: 'promo.all' },
  { key: 'casino', label: 'nav.casino' },
  { key: 'sports', label: 'nav.sports' },
];

const STATUSES: { key: PromoStatus; label: TranslationKey }[] = [
  { key: 'live', label: 'promo.live' },
  { key: 'expired', label: 'promo.expired' },
];

interface Props {
  category: PromoCategory;
  onCategory: (key: PromoCategory) => void;
  status: PromoStatus;
  onStatus: (key: PromoStatus) => void;
}

/**
 * The two rows of controls above the grid: the rounded category chips, then
 * the Live / Expired tabs on their rule.
 *
 * The chips are the app's own `rl-chip` pair — the design's selected state is
 * the same gold wash and the same 17.6px bloom those utilities already carry,
 * so there is nothing here to restate.
 */
const PromotionFilters: FC<Props> = ({ category, onCategory, status, onStatus }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-5 lg:space-y-[calc(var(--u)*32)]">
      <div className="flex flex-wrap gap-3 lg:gap-[calc(var(--u)*12)]">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => onCategory(c.key)}
            aria-pressed={category === c.key}
            className={`flex h-11 items-center px-5 text-[15px] lg:h-[calc(var(--u)*48)] lg:px-[calc(var(--u)*24)] lg:text-[length:max(12px,calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)] ${
              category === c.key
                ? 'rl-chip-active font-medium text-[#ffe779]'
                : 'rl-chip text-[#9da2b4] hover:text-[#f0f1f5]'
            }`}
          >
            {t(c.label)}
          </button>
        ))}
      </div>

      {/* The rule runs the full width of the column; the selected tab lights
          its own 100px of it. */}
      <div role="tablist" className="flex border-b border-[#252937]">
        {STATUSES.map((s) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={status === s.key}
            onClick={() => onStatus(s.key)}
            className={`-mb-px w-[100px] border-b-2 pb-1.5 text-center text-[15px] transition-colors lg:w-[calc(var(--u)*100)] lg:pb-[calc(var(--u)*6)] lg:text-[length:max(12px,calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)] ${
              status === s.key
                ? 'border-[#f0f1f5] font-medium text-[#f0f1f5]'
                : 'border-transparent text-[#6a7287] hover:text-[#9da2b4]'
            }`}
          >
            {t(s.label)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PromotionFilters;
