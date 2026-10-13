import { useEffect, type FC } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useTranslation } from '@/context/I18nContext';
import type { DisplayFiat } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

const WalletSettingsModal: FC<Props> = ({ open, onClose }) => {
  const { summary, changePreferences, displayCurrencies } = useWallet();
  const { t } = useTranslation();

  const preferences = summary?.preferences;
  const displayCurrency = (preferences?.active_currency ?? 'USD') as DisplayFiat;

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const switchDisplayCurrency = (next: DisplayFiat): void => {
    void changePreferences({ active_currency: next });
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('acct.wallet.settings')}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm pt-16 px-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="rl-modal-glass w-full max-w-2xl overflow-hidden">
        {/* Header + close */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-[#9da2b4]"
            >
              <circle cx="12" cy="12" r="1" />
              <path d="M12 1v6m0 6v6" />
              <path d="M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24" />
              <path d="M1 12h6m6 0h6" />
              <path d="M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" />
            </svg>
            <h2 className="rl-h-card min-w-0 truncate text-[#f0f1f5]">
              {t('acct.wallet.settings')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="rl-chip flex h-10 w-10 shrink-0 items-center justify-center text-[#f0f1f5]"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Display Currency Section */}
          <div>
            <h3 className="mb-4 text-xs font-semibold tracking-wider text-[#9da2b4] uppercase">
              {t('acct.wallet.displayCurrency')}
            </h3>

            {displayCurrencies.length === 0 ? (
              <p className="py-4 text-center text-xs text-[#9da2b4]">
                {t('acct.wallet.noCurrencies')}
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {displayCurrencies.map((fiat) => (
                  <button
                    key={fiat.code}
                    type="button"
                    onClick={() => switchDisplayCurrency(fiat?.code as DisplayFiat)}
                    className={`rl-modal-field relative p-3 transition-colors ${
                      displayCurrency === fiat?.code
                        ? 'border-(--rl-gold)/60 bg-white/10 text-[#f0f1f5]'
                        : 'text-[#9da2b4] hover:bg-white/8'
                    }`}
                  >
                    {/* Checkmark for selected */}
                    {displayCurrency === fiat?.code && (
                      <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-(--rl-gold)">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#07080a"
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: fiat?.color ?? '#999' }}
                      />
                      <span className="font-semibold text-sm">{fiat?.code}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info message */}
          {/* <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400 flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <p className="text-xs text-amber-100 leading-relaxed">
                By switching currencies, your balance will be fully converted to the selected currency using current exchange rates.
              </p>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default WalletSettingsModal;
