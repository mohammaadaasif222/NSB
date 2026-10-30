import { useEffect, useState, type FC } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useTranslation } from '@/context/I18nContext';
import type { TranslationKey } from '@/i18n/locales';
import GlassDialog from '@/components/ui/GlassDialog';
import SiteFooter from '@/components/player/SiteFooter';
import WalletTabBar from './shared/WalletTabBar';
import DepositTab from './tabs/DepositTab';
import WithdrawTab from './tabs/WithdrawTab';
import BuyCryptoTab from './tabs/OnramperBuyCryptoTab';
import TipTab from './tabs/TipTab';
import RedeemTab from './tabs/RedeemTab';

/** The wallet modal's sections, in the design's order. */
type WalletTab = 'deposit' | 'withdraw' | 'buy' | 'tip' | 'redeem';

interface Props {
  open: boolean;
  onClose: () => void;
  initialTab?: WalletTab;
}

const TABS: Array<{ id: WalletTab; label: TranslationKey }> = [
  { id: 'deposit', label: 'acct.wallet.tabDeposit' },
  { id: 'withdraw', label: 'acct.wallet.tabWithdraw' },
  { id: 'buy', label: 'acct.wallet.tabBuyCrypto' },
  { id: 'tip', label: 'acct.wallet.tabTip' },
  { id: 'redeem', label: 'acct.wallet.tabRedeem' },
];

const TITLE_ID = 'wallet-modal-title';

/**
 * The wallet modal that opens from the header, drawn as the design's 581px
 * glass dialog — at the page's scale, so it keeps the design's proportions on
 * a laptop: "Wallet" between nothing and the close button, the sections as
 * chips, then the section itself. Tip and Redeem fill the design's 545px card;
 * the longer sections grow it.
 *
 * Owns:
 *   • polling lifecycle — while the modal is open the WalletContext
 *     re-fetches summary every 15s so a confirmed deposit lands without
 *     a manual reload.
 *   • which tab is active — starts on `initialTab`, defaults to Deposit.
 *
 * The card, its scale, Escape, outside-click, focus and the scroll lock are
 * GlassDialog's.
 */
const WalletModal: FC<Props> = ({ open, onClose, initialTab = 'deposit' }) => {
  const { beginPolling, endPolling } = useWallet();
  const { t } = useTranslation();
  const [active, setActive] = useState<WalletTab>(initialTab);

  useEffect(() => {
    if (!open) return undefined;
    setActive(initialTab);
    beginPolling();
    return endPolling;
  }, [open, initialTab, beginPolling, endPolling]);

  return (
    <GlassDialog
      open={open}
      onClose={onClose}
      titleId={TITLE_ID}
      title={t('profile.wallet')}
      titleVariant="title"
      phoneSheet="page"
      // The design's 28 / 20 / 36 insets, less the rim's pixel.
      // The diagonal rim in place of the glass card's even one (none on a
      // phone, where the wallet is a page).
      className="rl-diag-rim max-sm:before:hidden [--dialog-rim:transparent] [--rim-radius:34px] [--rim-clear:60px] [--rim-fade:180px] max-w-[581px] px-4 pb-28 pt-5 sm:min-h-[545px] sm:px-[27px] sm:pb-[35px] sm:pt-[19px]"
    >
      <div className="mt-5 sm:mt-[17px]">
        <WalletTabBar
          tabs={TABS.map((tab) => ({ id: tab.id, label: t(tab.label) }))}
          active={active}
          onChange={setActive}
          label={t('profile.wallet')}
        />
      </div>

      {/* Deposit and Withdraw open on their Crypto / Local switch, 16 under
          the tabs; the other forms sit 31 under them. */}
      <div
        role="tabpanel"
        className={`relative z-10 ${
          active === 'deposit' || active === 'withdraw' ? 'pt-[26px] sm:pt-4' : 'pt-[34px] sm:pt-[31px]'
        }`}
      >
        {active === 'deposit' && <DepositTab onLeave={onClose} />}
        {active === 'withdraw' && <WithdrawTab onLeave={onClose} />}
        {active === 'buy' && <BuyCryptoTab />}
        {active === 'tip' && <TipTab onLeave={onClose} />}
        {active === 'redeem' && <RedeemTab />}
      </div>

      <div className="mt-[74px] sm:hidden">
        <SiteFooter />
      </div>
    </GlassDialog>
  );
};

export default WalletModal;
