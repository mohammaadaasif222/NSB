import { useMemo, useState, type FC } from 'react';

import PlayerLayout from '@/layout/PlayerLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import SiteFooter from '@/components/player/SiteFooter';
import WalletModal from '@/components/wallet/WalletModal';
import WalletBalanceCard, { type WalletAction } from '@/components/wallet/page/WalletBalanceCard';
import WalletAssets, { type WalletAsset } from '@/components/wallet/page/WalletAssets';
import { useWallet } from '@/context/WalletContext';
import { useTranslation } from '@/context/I18nContext';
import { useCurrencyConversion } from '@/context/CurrencyConversionContext';
import Seo from '@/components/seo/Seo';

/** My Assets, as the design lists them: the coins a player can hold. */
const ASSETS = [
  { code: 'BTC', name: 'Bitcoin' },
  { code: 'ETH', name: 'Ethereum' },
  { code: 'SOL', name: 'Solana' },
  { code: 'USDC', name: 'USD Coin' },
] as const;

/**
 * The wallet page, as the design lays it out: the title, then the balance card
 * (the total and the four ways to move money) beside My Assets — side by side
 * on desktop, stacked on a phone. Each action opens the wallet dialog on its
 * own section.
 *
 * My Assets lists the design's four coins, each with what the player holds of
 * it and its worth in dollars. The wallet is USD-native with
 * one balance per account, held in the player's active currency: that coin
 * shows the balance and the rest show nothing held. A balance in a currency
 * outside the four is not listed here — the total above still counts it.
 */
const WalletPage: FC = () => {
  const { t, locale } = useTranslation();
  const { summary, loading } = useWallet();
  const { formatCurrencyDisplay } = useCurrencyConversion();
  const [action, setAction] = useState<WalletAction | null>(null);

  const balance = summary?.balance;
  const total = loading && !balance ? '—' : formatCurrencyDisplay(balance?.total_amount ?? '0');

  const assets = useMemo((): WalletAsset[] => {
    const held = balance ? balance.display_currency || balance.currency : '';
    const amountOf = (code: string): number => {
      if (code !== held || !balance) return 0;
      const n = Number.parseFloat(balance.display_amount);
      return Number.isFinite(n) ? n : 0;
    };
    // Worth in dollars, as the design writes it ("~$7,904.80"): the
    // wallet's own unit, whatever the display currency.
    const worthOf = (code: string): string => {
      const usd = code === held && balance ? Number.parseFloat(balance.total_amount) : 0;
      return `~${(Number.isFinite(usd) ? usd : 0).toLocaleString(locale, {
        style: 'currency',
        currency: 'USD',
      })}`;
    };
    const row = (code: string, name: string): WalletAsset => ({
      code,
      name,
      amount: `${amountOf(code).toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8,
      })} ${code}`,
      worth: worthOf(code),
    });

    return ASSETS.map((a) => row(a.code, a.name));
  }, [balance, locale]);

  return (
    <PlayerLayout>

      {/* The design's 1548 column, 40 under the bar (24 more than the
          shell's own 16). */}
      <div className="mx-auto max-w-[1548px] px-1 lg:max-w-[calc(var(--u)*1548)] lg:px-0 lg:pt-[calc(var(--u)*24)]">
        <h1 className="text-[24px] font-medium leading-8 text-[#f0f1f5] lg:text-[length:max(24px,calc(var(--u)*44))] lg:font-semibold lg:leading-[calc(var(--u)*52)]">
          {t('profile.wallet')}
        </h1>

        <div className="mt-[22px] grid gap-5 lg:mt-[calc(var(--u)*20)] lg:grid-cols-2 lg:items-start lg:gap-[calc(var(--u)*20)]">
          <WalletBalanceCard total={total} onAction={setAction} />
          <WalletAssets assets={assets} loading={loading} />
        </div>
      </div>

      {/* The footer in the 1544 column, 96 under the cards (74 on a phone). */}
      <div className="mx-auto mt-[74px] max-w-[1600px] lg:mt-[calc(var(--u)*96)] lg:max-w-[calc(var(--u)*1544)]">
        <SiteFooter />
      </div>

      <WalletModal
        open={action !== null}
        initialTab={action ?? 'deposit'}
        onClose={() => setAction(null)}
      />
    </PlayerLayout>
  );
};

const ProtectedWalletPage: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Seo title={t('profile.wallet')} />
      <ProtectedRoute>
        <WalletPage />
      </ProtectedRoute>
    </>
  );
};

export default ProtectedWalletPage;
