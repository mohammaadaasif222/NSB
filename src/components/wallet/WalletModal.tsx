import { useEffect, useState, type FC } from 'react';
import { useWallet } from '@/context/WalletContext';
import DepositTab from './tabs/DepositTab';
import WithdrawTab from './tabs/WithdrawTab';
import ComingSoonTab from './tabs/ComingSoonTab';

/**
 * Tabs the wallet modal exposes. Deposit and Withdraw are wired; the rest
 * are placeholders that render a ComingSoon panel — kept in the tab list
 * so the modal matches the design and so the routing logic doesn't have
 * to change when one lands.
 */
type WalletTab = 'deposit' | 'withdraw' | 'buy' | 'tip' | 'redeem';

interface Props {
  open: boolean;
  onClose: () => void;
  initialTab?: WalletTab;
}

const TABS: Array<{ id: WalletTab; label: string }> = [
  { id: 'deposit', label: 'Deposit' },
  { id: 'withdraw', label: 'Withdraw' },
  { id: 'buy', label: 'Buy Crypto' },
  { id: 'tip', label: 'Tip' },
  { id: 'redeem', label: 'Redeem' },
];

/**
 * The wallet modal that opens from the header.
 *
 * Owns:
 *   • polling lifecycle — while the modal is open the WalletContext
 *     re-fetches summary every 15s so a confirmed deposit lands without
 *     a manual reload.
 *   • escape-to-close and body-scroll-lock while shown.
 *   • which tab is active — starts on `initialTab`, defaults to Deposit.
 */
const WalletModal: FC<Props> = ({ open, onClose, initialTab = 'deposit' }) => {
  const { beginPolling, endPolling } = useWallet();
  const [active, setActive] = useState<WalletTab>(initialTab);

  useEffect(() => {
    if (!open) return;
    setActive(initialTab);
    beginPolling();

    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      endPolling();
    };
  }, [open, initialTab, beginPolling, endPolling, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Wallet"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm pt-16 px-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header + close */}
        <div className="flex items-center justify-between px-4 pt-4">
          <h2 className="text-sm font-semibold text-slate-100">Wallet Total</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tab bar */}
        <div className="mt-3 px-4">
          <div className="flex items-center gap-1 border-b border-slate-700 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => {
              const isActive = active === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(tab.id)}
                  className={`relative px-3 pb-2 pt-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 bg-white rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-4">
          {active === 'deposit' && <DepositTab />}
          {active === 'withdraw' && <WithdrawTab />}
          {active === 'buy' && <ComingSoonTab title="Buy Crypto" />}
          {active === 'tip' && <ComingSoonTab title="Tip" />}
          {active === 'redeem' && <ComingSoonTab title="Redeem" />}
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
