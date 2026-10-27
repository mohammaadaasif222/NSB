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
 * row in equal columns (four on a phone, where it is a page under the bar).
 * The chosen one is lit.
 *
 * Sized in `--u`: it opens from the bar, inside the page's stage.
 */
const DisplayCurrencyPicker: FC<Props> = ({ currencies, value, onPick, onBack }) => {
  const { t } = useTranslation();

  return (
    <div className="px-4 pb-28 pt-5 lg:px-[calc(var(--u)*22)] lg:pb-[calc(var(--u)*23)] lg:pt-[calc(var(--u)*22)]">
      <div className="flex items-center gap-3 lg:block">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-[14px] font-medium leading-5 text-[#f0f1f5] transition-colors hover:text-white max-lg:rl-glass-btn max-lg:h-10 max-lg:w-10 max-lg:shrink-0 max-lg:justify-center max-lg:rounded-full lg:gap-[calc(var(--u)*3)] lg:text-[length:max(11px,calc(var(--u)*14))] lg:leading-[calc(var(--u)*20)]"
        >
          <ChevronLeftIcon
            size={16}
            className="h-5 w-5 rtl:rotate-180 lg:h-[calc(var(--u)*16)] lg:w-[calc(var(--u)*16)]"
          />
          <span className="max-lg:sr-only">{t('acct.wallet.displayCurrency')}</span>
        </button>
        <p aria-hidden="true" className="truncate text-[24px] font-medium leading-8 text-[#f0f1f5] lg:hidden">
          {t('acct.wallet.displayCurrency')}
        </p>
      </div>

      <ul
        role="listbox"
        aria-label={t('acct.wallet.displayCurrency')}
        className="mt-5 grid grid-cols-4 gap-[7px] lg:mt-[calc(var(--u)*15)] lg:grid-cols-5 lg:gap-[calc(var(--u)*10)]"
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
                className={`flex h-[46px] w-full items-center gap-1.5 rounded-full border border-white/20 px-4 text-[14px] leading-5 text-[#f0f1f5] transition-colors lg:h-[calc(var(--u)*46)] lg:gap-[calc(var(--u)*6)] lg:px-[calc(var(--u)*16)] lg:text-[length:max(11px,calc(var(--u)*14))] lg:leading-[calc(var(--u)*20)] ${
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
