import { type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import GlassDialog from '@/components/ui/GlassDialog';
import { STATUS_LABEL, CATEGORY_LABEL, type Transaction } from './mockTransactions';

interface Props {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

const TransactionDetailModal: FC<Props> = ({ open, onClose, transaction }) => {
  const { t, locale } = useTranslation();

  if (!transaction) return null;

  const getExplorerUrl = (): string | null => {
    if (!transaction.crypto || !transaction.id) return null;

    const cryptoParts = transaction.crypto.split(' ');
    if (cryptoParts.length < 2) return null;

    const crypto = cryptoParts[1].toUpperCase();
    const txHash = transaction.id;

    const explorers: Record<string, string> = {
      BTC: `https://www.blockchain.com/btc/tx/${txHash}`,
      ETH: `https://etherscan.io/tx/${txHash}`,
      BNB: `https://bscscan.com/tx/${txHash}`,
      SOL: `https://solscan.io/tx/${txHash}`,
      XRP: `https://xrpscan.com/tx/${txHash}`,
      USDT: `https://etherscan.io/tx/${txHash}`,
      USDC: `https://etherscan.io/tx/${txHash}`,
    };

    return explorers[crypto] || null;
  };

  const formatDate = (dateString: string): string => {
    return new Date(`${dateString}T00:00:00Z`).toLocaleDateString(locale, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
  };

  const explorerUrl = getExplorerUrl();

  return (
    <GlassDialog
      open={open}
      onClose={onClose}
      titleId="tx-detail-modal-title"
      title={t('profile.transactionDetails')}
      titleVariant="title"
      className="max-w-[600px] px-4 pb-8 pt-4 sm:px-[27px] sm:pb-[35px] sm:pt-[19px]"
    >
      <div className="space-y-6 pt-6 sm:pt-[31px]">
        {/* Main Amount Display */}
        <div className="text-center">
          <div
            className={`text-4xl font-bold tabular-nums mb-2 ${
              transaction.effect === '0'
                ? 'text-[#8c8c8c]'
                : transaction.effect.startsWith('+')
                  ? 'text-[#4ade80]'
                  : 'text-[#ef4444]'
            }`}
          >
            {transaction.usd}
          </div>
          <div className="text-sm text-[#8c8c8c]">
            {t(CATEGORY_LABEL[transaction.category])} •{' '}
            {formatDate(transaction.date)}
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          <div
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              transaction.status === 'DEPOSIT_CONFIRMED' ||
              transaction.status === 'WITHDRAW_COMPLETED'
                ? 'bg-[#4ade80]/20 text-[#4ade80]'
                : transaction.status === 'DEPOSIT_FAILED' ||
                    transaction.status === 'WITHDRAW_REJECTED'
                  ? 'bg-[#ef4444]/20 text-[#ef4444]'
                  : 'bg-[#eab308]/20 text-[#eab308]'
            }`}
          >
            {t(STATUS_LABEL[transaction.status])}
          </div>
        </div>

        {/* Transaction Details */}
        <div className="space-y-4 border-t border-[#404040] pt-6">
          {/* Transaction ID */}
          <div className="flex justify-between items-start gap-4">
            <span className="text-sm text-[#8c8c8c]">{t('tx.id')}</span>
            <div className="text-right">
              <div className="text-sm font-mono text-white break-all">
                {transaction.id}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(transaction.id)}
                className="text-xs text-[#4ade80] hover:underline mt-1"
              >
                {t('common.copy')}
              </button>
            </div>
          </div>

          {/* Crypto Amount */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#8c8c8c]">{t('tx.cryptoAmount')}</span>
            <span className="text-sm font-medium text-white">
              {transaction.crypto}
            </span>
          </div>

          {/* Amount in Display Currency */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#8c8c8c]">
              {t('tx.amount')}
            </span>
            <span className="text-sm font-medium text-white">
              {transaction.usd}
            </span>
          </div>

          {/* Type */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#8c8c8c]">{t('tx.type')}</span>
            <span className="text-sm font-medium text-white capitalize">
              {transaction.category.toLowerCase()}
            </span>
          </div>

          {/* Wallet Effect */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#8c8c8c]">{t('tx.walletEffect')}</span>
            <span
              className={`text-sm font-medium ${
                transaction.effect === '0'
                  ? 'text-[#8c8c8c]'
                  : transaction.effect.startsWith('+')
                    ? 'text-[#4ade80]'
                    : 'text-[#ef4444]'
              }`}
            >
              {transaction.effect}
            </span>
          </div>

          {/* Date and Time */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#8c8c8c]">{t('tx.date')}</span>
            <span className="text-sm font-medium text-white">
              {formatDate(transaction.date)}
            </span>
          </div>

          {/* Explorer Link */}
          {explorerUrl && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#8c8c8c]">{t('tx.explorer')}</span>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#4ade80] hover:underline font-medium"
              >
                {t('common.viewOnExplorer')} ↗
              </a>
            </div>
          )}

          {/* Network/Provider Info */}
          {transaction.category === 'DEPOSIT' && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#8c8c8c]">{t('tx.provider')}</span>
              <span className="text-sm font-medium text-white">
                Crypto Network
              </span>
            </div>
          )}

          {transaction.category === 'WITHDRAWAL' && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#8c8c8c]">{t('tx.provider')}</span>
              <span className="text-sm font-medium text-white">
                Crypto Network
              </span>
            </div>
          )}
        </div>

      </div>
    </GlassDialog>
  );
};

export default TransactionDetailModal;
