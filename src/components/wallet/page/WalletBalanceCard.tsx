import type { FC } from 'react';
import type { StaticImageData } from 'next/image';
import { useTranslation } from '@/context/I18nContext';
import type { TranslationKey } from '@/i18n/locales';
import depositIcon from '@/assets/wallet/actions/deposit.svg';
import withdrawIcon from '@/assets/wallet/actions/withdraw.svg';
import buyCryptoIcon from '@/assets/wallet/actions/buy-crypto.svg';
import tipIcon from '@/assets/wallet/actions/tip.svg';

/** The wallet modal's sections the card's tiles open. */
export type WalletAction = 'deposit' | 'withdraw' | 'buy' | 'tip';

const ACTIONS: { id: WalletAction; label: TranslationKey; icon: StaticImageData }[] = [
  { id: 'deposit', label: 'acct.wallet.tabDeposit', icon: depositIcon },
  { id: 'withdraw', label: 'acct.wallet.tabWithdraw', icon: withdrawIcon },
  { id: 'buy', label: 'acct.wallet.tabBuyCrypto', icon: buyCryptoIcon },
  { id: 'tip', label: 'acct.wallet.tabTip', icon: tipIcon },
];

/**
 * One of the card's actions: a glass tile with the icon on a small glass disc
 * over its label — the design's 130px square on desktop, 84 × 80 on a phone,
 * in the design's clear glass with its rim lit at the top-start and
 * bottom-end corners.
 */
export const WalletActionTile: FC<{
  icon: StaticImageData;
  label: string;
  onClick: () => void;
}> = ({ icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="rl-sport-card flex h-20 flex-col items-center rounded-[14px] pt-3 transition-colors hover:bg-white/10 lg:bg-white/5 lg:hover:bg-white/10 lg:h-[calc(var(--u)*130)] lg:w-[calc(var(--u)*130)] lg:rounded-[calc(var(--u)*34)] lg:pt-[calc(var(--u)*24)]"
  >
    <span className="rl-circle-btn flex h-7 w-7 items-center justify-center rounded-full lg:h-[calc(var(--u)*48)] lg:w-[calc(var(--u)*48)]">
      <img
        src={icon.src}
        alt=""
        className="h-4 w-4 lg:h-[calc(var(--u)*28)] lg:w-[calc(var(--u)*28)]"
      />
    </span>
    <span className="mt-2 text-[12px] font-medium leading-5 text-[#f0f1f5] lg:mt-[calc(var(--u)*9)] lg:text-[length:max(11px,calc(var(--u)*18))] lg:font-normal lg:leading-[calc(var(--u)*28)]">
      {label}
    </span>
  </button>
);

interface Props {
  /** The wallet total, already formatted in the display currency. */
  total: string;
  onAction: (action: WalletAction) => void;
}

/**
 * The wallet page's balance card: the total large and centred, what it is,
 * and the four ways to move money. The design draws the total white on
 * desktop ("Wallet Balance") and gold on a phone ("Wallet Total").
 */
const WalletBalanceCard: FC<Props> = ({ total, onAction }) => {
  const { t } = useTranslation();

  return (
    <section className="rl-panel px-[13px] pb-[23px] pt-[23px] [--panel-fill:rgba(255,255,255,0.07)] lg:px-0 lg:pb-[calc(var(--u)*34)] lg:pt-[calc(var(--u)*63)] lg:[--panel-fill:rgba(0,0,0,0.2)]">
      {/* The design's insets, less the panel's 1px rim. */}
      <div className="text-center">
        <p className="text-[32px] font-semibold leading-10 tabular-nums text-[#ffe779] lg:text-[length:max(24px,calc(var(--u)*64))] lg:leading-[calc(var(--u)*68)] lg:text-[#f0f1f5]">
          {total}
        </p>
        <p className="mt-3 text-[14px] leading-5 text-[#9da2b4] lg:mt-[calc(var(--u)*22)] lg:text-[length:max(11px,calc(var(--u)*18))] lg:leading-[calc(var(--u)*28)]">
          <span className="lg:hidden">{t('wallet.totalLabel')}</span>
          <span className="hidden lg:inline">{t('wallet.balanceLabel')}</span>
        </p>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2 lg:mt-[calc(var(--u)*34)] lg:flex lg:justify-center lg:gap-[calc(var(--u)*16)]">
        {ACTIONS.map((a) => (
          <WalletActionTile
            key={a.id}
            icon={a.icon}
            label={t(a.label)}
            onClick={() => onAction(a.id)}
          />
        ))}
      </div>
    </section>
  );
};

export default WalletBalanceCard;
