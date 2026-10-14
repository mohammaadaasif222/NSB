import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useTranslation } from '@/context/I18nContext';
import { useCurrencyConversion } from '@/context/CurrencyConversionContext';
import { BALANCE_REFRESH_EVENT } from '@/utils/balanceEvents';
import type { DisplayFiat } from '@/types';
import chevronIcon from '@/assets/lobby/rail/bar-chevron.svg';

/**
 * Header chip + balance dropdown.
 *
 * The chip shows the balance in the player's display currency. The dropdown
 * splits it into real and bonus — the two have different rules, so one figure
 * cannot stand for both — and names the currency it is shown in.
 *
 * It used to list one row per currency the player held. The wallet is
 * USD-native now, one balance per account, so there is nothing to pick
 * between; the currency below is a display preference, set in the wallet.
 *
 * Rendered only when signed in — the parent gates on the token.
 */
interface Props {
  onOpenWallet?: () => void;
}

const BalanceMenu: FC<Props> = ({ onOpenWallet }) => {
  const { summary, loading, refresh } = useWallet();
  const { formatCurrencyDisplay } = useCurrencyConversion();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handler = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const preferences = summary?.preferences;
  const balance = summary?.balance;
  const displayCurrency = (preferences?.active_currency ?? 'USD') as DisplayFiat;

  /**
   * The label shown on the header chip.
   * Shows the total balance (real + bonus) in the active currency (fiat).
   * Uses CurrencyConversionContext for consistent formatting.
   */
  const chipLabel = useMemo(() => {
    if (loading && !balance) return '—';
    if (!balance) {
      // No balance yet. Show 0 in the display currency.
      return formatCurrencyDisplay('0');
    }
    // Use total_amount (USD) for conversion, not display_amount (already in display currency)
    return formatCurrencyDisplay(balance.total_amount);
  }, [balance, loading, formatCurrencyDisplay]);

  /**
   * Real balance only (excluding bonus).
   * Shows only the real balance converted to display currency.
   */
  const realBalanceLabel = useMemo(() => {
    if (loading && !balance) return '—';
    if (!balance) {
      return formatCurrencyDisplay('0');
    }
    // Use real_amount (USD) - only the real balance, not including bonus
    return formatCurrencyDisplay(balance.real_amount);
  }, [balance, loading, formatCurrencyDisplay]);

  // The sentence is translated whole; the currency code is split back out so
  // it keeps its emphasis wherever the language puts it.
  const [currencyBefore, currencyAfter = ''] = t('lobby.balance.displayingIn', {
    currency: '\u0000',
  }).split('\u0000');

  return (
    <div className="relative min-w-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('lobby.balance.label')}
        title={chipLabel}
        className="rl-glass-btn flex h-10 max-w-full items-center gap-2.5 rounded-full px-[18px] lg:h-[calc(var(--u)*48)] lg:gap-[calc(var(--u)*9)] lg:px-[calc(var(--u)*14)]"
      >
        <span className="min-w-0 truncate text-[16px] font-medium leading-6 tabular-nums text-[#f0f1f5] lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]">
          {chipLabel}
        </span>
        <img
          src={chevronIcon.src}
          alt=""
          className={`h-4 w-4 flex-shrink-0 transition-transform lg:h-[calc(var(--u)*16)] lg:w-[calc(var(--u)*16)] ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && summary && (
        <div
          role="menu"
          className="rl-menu absolute left-0 top-[calc(100%+8px)] z-40 w-64 overflow-hidden rounded-2xl p-4 lg:left-1/2 lg:-translate-x-1/2"
        >
          {/* Real Balance Card */}
          <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-950/20 px-3 py-2.5 mb-2">
            <p className="text-[8px] font-semibold text-white/50 mb-1">{t('wallet.real')}</p>
            <p className="text-sm font-bold text-white">{realBalanceLabel}</p>
          </div>

          {/* Bonus Balance Card */}
          <div className="rounded-2xl border-2 border-gray-500/30 bg-gray-950/20 px-3 py-2.5 mb-3">
            <p className="text-[8px] font-semibold text-white/50 mb-1">{t('wallet.bonus')}</p>
            <p className="text-sm font-bold text-white">
              {balance?.bonus_amount
                ? formatCurrencyDisplay(balance.bonus_amount)
                : formatCurrencyDisplay('0')}
            </p>
          </div>

          {/* Display Currency Info */}
          <div className="flex items-center justify-center gap-2 px-1 py-2 mb-3">
            <span className="text-xs font-medium text-white/70">
              {currencyBefore}
              <span className="font-semibold text-white">{displayCurrency}</span>
              {currencyAfter}
            </span>
          </div>

          {onOpenWallet && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onOpenWallet();
              }}
              className="rl-btn-gold h-10 w-full rounded-lg text-sm font-semibold transition-all hover:opacity-90"
            >
              {t('lobby.balance.walletSettings')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BalanceMenu;
