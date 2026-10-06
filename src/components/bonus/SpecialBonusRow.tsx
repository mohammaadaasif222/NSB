import type { FC } from 'react';

import { CoinIcon, GiftIcon, RefreshIcon, type IconProps } from '@/components/icons';
import { useTranslation } from '@/context/I18nContext';
import type { TranslationKey } from '@/i18n/locales';

/**
 * The three standing offers the design names.
 *
 * Marketing copy, not data: the $500, the Tuesday and the 10% are the design's
 * own and no endpoint serves them. Replace with real campaigns before launch.
 *
 * The design draws a flat grey disc in each card, on a layer named
 * "IconPlaceholder" — it specifies the slot, not the mark. These use the app's
 * own icons at the drawn size, so the row reads as three different offers
 * rather than three identical placeholders.
 */
const SPECIALS: { Icon: FC<IconProps>; title: TranslationKey; body: TranslationKey }[] = [
  {
    Icon: GiftIcon,
    title: 'bonus.special.firstDeposit',
    body: 'bonus.special.firstDepositBody',
  },
  { Icon: RefreshIcon, title: 'bonus.special.reload', body: 'bonus.special.reloadBody' },
  { Icon: CoinIcon, title: 'bonus.special.cashback', body: 'bonus.special.cashbackBody' },
];

/** "Special Bonuses" — three 500×162 glass cards across the design's column. */
const SpecialBonusRow: FC = () => {
  const { t } = useTranslation();

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[calc(var(--u)*24)]">
      {SPECIALS.map(({ Icon, title, body }) => (
        <li
          key={title}
          className="rl-glass-deep rounded-[24px] p-5 lg:rounded-[calc(var(--u)*34)] lg:p-[calc(var(--u)*30)]"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/72 lg:h-[calc(var(--u)*32)] lg:w-[calc(var(--u)*32)]"
            aria-hidden="true"
          >
            <Icon size={16} />
          </span>
          <h3 className="mt-3 text-[17px] font-semibold leading-7 tracking-[-0.02em] text-[#f0f1f5] lg:mt-[calc(var(--u)*14)] lg:text-[length:max(13px,calc(var(--u)*20))] lg:leading-[calc(var(--u)*28)]">
            {t(title)}
          </h3>
          <p className="mt-1.5 text-[13px] leading-5 text-[#9da2b4] lg:mt-[calc(var(--u)*8)] lg:text-[length:max(10px,calc(var(--u)*14))] lg:leading-[calc(var(--u)*20)]">
            {t(body)}
          </p>
        </li>
      ))}
    </ul>
  );
};

export default SpecialBonusRow;
