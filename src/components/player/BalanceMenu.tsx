import { useCallback, useEffect, useState, type FC } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useTranslation } from '@/context/I18nContext';
import { useCurrencyConversion } from '@/context/CurrencyConversionContext';
import { BALANCE_REFRESH_EVENT } from '@/utils/balanceEvents';
import { ChevronRightIcon } from '@/components/icons';
import HeaderPopover from '@/components/player/HeaderPopover';
import DisplayCurrencyPicker from '@/components/wallet/DisplayCurrencyPicker';
import chevronIcon from '@/assets/lobby/rail/bar-chevron.svg';

/**
 * Header chip + balance dropdown, as the design draws them.
 *
 * The chip shows the balance in the player's display currency. The dropdown
 * splits it into Primary (real money) and Rewards (bonus) — the two have
 * different rules, so one figure cannot stand for both — and carries the
 * display currency as a pill that turns the panel into the currency picker.
 *
 * The wallet is USD-native, one balance per account; the currency is only how
 * it is shown, saved as the player's preference.
 *
 * Rendered only when signed in — the parent gates on the token.
 */

/** A labelled figure in the summary: the design's 18px medium pair. */
const Row: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 text-[16px] font-medium leading-7 text-[#f0f1f5] lg:text-[length:max(11px,calc(var(--u)*18))] lg:leading-[calc(var(--u)*28)]">
    <span>{label}</span>
    <span className="tabular-nums">{value}</span>
  </div>
);

const BalanceMenu: FC = () => {
  const { summary, loading, refresh, displayCurrencies, changePreferences } = useWallet();
  const { formatCurrencyDisplay } = useCurrencyConversion();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'summary' | 'currencies'>('summary');

  /**
   * Game play moves the balance server-side — an aggregator debits the bet
   * and credits the win over its own API — so nothing on this page knows it
   * changed. The play page asks for a re-read when it has reason to think it
   * did (a round ending, leaving a game).
   */
  useEffect(() => {
    const onBalanceRefresh = (): void => {
      void refresh();
    };
    window.addEventListener(BALANCE_REFRESH_EVENT, onBalanceRefresh);
    return () => window.removeEventListener(BALANCE_REFRESH_EVENT, onBalanceRefresh);
  }, [refresh]);

  const balance = summary?.balance;
  const displayCurrency = summary?.preferences.active_currency ?? 'USD';

  /** USD amounts from the API, shown in the display currency. */
  const shown = useCallback(
    (usd: string | undefined): string =>
      loading && !balance ? '—' : formatCurrencyDisplay(usd ?? '0'),
    [balance, loading, formatCurrencyDisplay]
  );

  const close = (): void => {
    setOpen(false);
    setView('summary');
  };

  const chipLabel = shown(balance?.total_amount);
  const picking = view === 'currencies';

  return (
    <HeaderPopover
      open={open}
      onClose={close}
      label={t('lobby.balance.label')}
      className="min-w-0"
      tone="glass"
      phoneSheet={picking}
      // Centred under the chip, as drawn — not hung off its end like the
      // bar's other panels.
      panelClassName="end-auto left-1/2 -translate-x-1/2"
      width={
        picking
          ? 'w-[min(535px,calc(100vw-1.5rem))] lg:w-[calc(var(--u)*535)]'
          : 'w-[min(286px,calc(100vw-2rem))] lg:w-[calc(var(--u)*286)]'
      }
      trigger={
        <button
          type="button"
          onClick={() => (open ? close() : setOpen(true))}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={t('lobby.balance.label')}
          title={chipLabel}
          className="rl-glass-btn flex h-10 max-w-full items-center gap-2.5 rounded-full px-3 lg:h-[calc(var(--u)*48)] lg:gap-[calc(var(--u)*9)] lg:px-[calc(var(--u)*14)]"
        >
          <span className="min-w-0 truncate text-[12px] font-medium leading-5 tabular-nums text-[#f0f1f5] lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]">
            {chipLabel}
          </span>
          <img
            src={chevronIcon.src}
            alt=""
            className={`hidden h-4 w-4 flex-shrink-0 transition-transform lg:block lg:h-[calc(var(--u)*16)] lg:w-[calc(var(--u)*16)] ${open ? 'rotate-180' : ''}`}
          />
        </button>
      }
    >
      {picking ? (
        <DisplayCurrencyPicker
          currencies={displayCurrencies}
          value={displayCurrency}
          onBack={() => setView('summary')}
          onPick={(code) => {
            void changePreferences({ active_currency: code });
            setView('summary');
          }}
        />
      ) : (
        <div className="px-5 pb-6 pt-5 lg:px-[calc(var(--u)*20)] lg:pb-[calc(var(--u)*24)] lg:pt-[calc(var(--u)*22)]">
          <Row label={t('wallet.primary')} value={shown(balance?.real_amount)} />
          <div className="mt-5 lg:mt-[calc(var(--u)*21)]">
            <Row label={t('wallet.rewards')} value={shown(balance?.bonus_amount)} />
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 lg:mt-[calc(var(--u)*21)]">
            <span className="text-[12px] leading-5 text-[#9da2b4] lg:text-[length:max(11px,calc(var(--u)*12))] lg:leading-[calc(var(--u)*20)]">
              {t('acct.wallet.displayCurrency')}
            </span>
            <button
              type="button"
              onClick={() => setView('currencies')}
              aria-label={`${t('acct.wallet.displayCurrency')}: ${displayCurrency}`}
              className="flex h-8 items-center gap-1 rounded-full bg-[#f0f1f5] pl-3 pr-2 text-[14px] font-medium leading-5 text-[#07080a] transition-[filter] hover:brightness-95 lg:h-[calc(var(--u)*32)] lg:gap-[calc(var(--u)*5)] lg:pl-[calc(var(--u)*13)] lg:pr-[calc(var(--u)*9)] lg:text-[length:max(11px,calc(var(--u)*14))] lg:leading-[calc(var(--u)*20)]"
            >
              {displayCurrency}
              <ChevronRightIcon
                size={16}
                strokeWidth={2.4}
                className="h-4 w-4 rtl:rotate-180 lg:h-[calc(var(--u)*16)] lg:w-[calc(var(--u)*16)]"
              />
            </button>
          </div>
        </div>
      )}
    </HeaderPopover>
  );
};

export default BalanceMenu;
