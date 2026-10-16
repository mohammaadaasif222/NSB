import type { FC } from 'react';
import { ChevronLeftIcon } from '@/components/icons';
import { useTranslation } from '@/context/I18nContext';
import type { DisplayCurrencyOption } from '@/services/wallet';
import CurrencyMark from './shared/CurrencyMark';

interface Props {
  currencies: readonly DisplayCurrencyOption[];
  /** The currency balances are shown in now. */
  value: string;
  onPick: (code: DisplayCurrencyOption['code']) => void;
  /** Back to the balance summary. */
  onBack: () => void;
}

/**
 * The design's Display Currency panel: a back chevron and the title, then a
 * pill per currency the operator enabled — the flag and the code — five to a
 * row in equal columns (three on a phone). The chosen one is lit.
 *
 * Sized in `--u`: it opens from the bar, inside the page's stage.
 */
const DisplayCurrencyPicker: FC<Props> = ({ currencies, value, onPick, onBack }) => {
  const { t } = useTranslation();

  return (
    <div className="p-4 lg:px-[calc(var(--u)*22)] lg:pb-[calc(var(--u)*23)] lg:pt-[calc(var(--u)*22)]">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-[14px] font-medium leading-5 text-[#f0f1f5] transition-colors hover:text-white lg:gap-[calc(var(--u)*3)] lg:text-[length:max(11px,calc(var(--u)*14))] lg:leading-[calc(var(--u)*20)]"
      >
        <ChevronLeftIcon
          size={16}
          className="h-4 w-4 rtl:rotate-180 lg:h-[calc(var(--u)*16)] lg:w-[calc(var(--u)*16)]"
        />
        {t('acct.wallet.displayCurrency')}
      </button>

      <ul
        role="listbox"
        aria-label={t('acct.wallet.displayCurrency')}
        className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:mt-[calc(var(--u)*15)] lg:gap-[calc(var(--u)*10)]"
      >
        {currencies.map((c) => {
          const on = c.code === value;
          return (
            <li key={c.code}>
              <button
                type="button"
                role="option"
                aria-selected={on}
                onClick={() => onPick(c.code)}
                title={c.name}
                className={`flex h-10 w-full items-center gap-1.5 rounded-full border border-white/20 pl-3 pr-3.5 text-[13px] leading-5 text-[#f0f1f5] transition-colors lg:h-[calc(var(--u)*46)] lg:gap-[calc(var(--u)*6)] lg:px-[calc(var(--u)*16)] lg:text-[length:max(11px,calc(var(--u)*14))] lg:leading-[calc(var(--u)*20)] ${
                  on ? 'bg-white/[0.16]' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <CurrencyMark
                  kind="flag"
                  code={c.code}
                  symbol={c.symbol}
                  className="h-5 w-5 lg:h-[calc(var(--u)*22)] lg:w-[calc(var(--u)*22)]"
                />
                {c.code}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DisplayCurrencyPicker;
