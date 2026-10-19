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
    if (!transaction.tx_hash) return null;

    const cryptoParts = transaction.crypto.split(' ');
    if (cryptoParts.length < 2) return null;

    const crypto = cryptoParts[1].toUpperCase();
    const txHash = transaction.tx_hash;

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

  const getProviderLabel = (
    provider?: string | null,
    networkCode?: string | null,
  ): string => {
    if (!provider) return 'Unknown';

    // Fiat providers → show "Bank Transfer (D24)" style
    if (provider === 'D24' || networkCode === 'FIAT') {
      return 'Bank Transfer';
    }

    // Crypto providers → show provider name + network
    const providerNames: Record<string, string> = {
      COINSPAID: 'CoinsPaid',
      CRYPTOMUS: 'Cryptomus',
      CHANGELLY: 'Changelly',
      INTERNAL: 'Internal',
    };

    const providerName = providerNames[provider] || provider;
    return networkCode ? `${providerName} (${networkCode})` : providerName;
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
            className={`text-5xl sm:text-6xl font-bold tabular-nums mb-3 ${
              transaction.effect === '0'
                ? 'text-[#8c8c8c]'
                : transaction.effect.startsWith('+')
                  ? 'text-[#4ade80]'
                  : 'text-[#ef4444]'
            }`}
          >
            {transaction.usd}
          </div>
          <div className="text-base sm:text-lg text-[#8c8c8c]">
            {t(CATEGORY_LABEL[transaction.category])} •{' '}
            {formatDate(transaction.date)}
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          <div
            className={`px-5 py-2.5 rounded-full text-base sm:text-lg font-medium ${
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
        <div className="space-y-5 border-t border-[#404040] pt-6">
          {/* Transaction ID */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
            <span className="text-base sm:text-lg text-[#8c8c8c]">{t('tx.id')}</span>
            <div className="text-right">
              <div className="text-sm sm:text-base font-mono text-white break-all">
                {transaction.id}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(transaction.id)}
                className="text-sm sm:text-base text-[#4ade80] hover:underline mt-2"
              >
                {t('common.copy')}
              </button>
            </div>
          </div>

          {/* Currency Amount - Label depends on fiat vs crypto */}
          {(transaction.category === 'DEPOSIT' || transaction.category === 'WITHDRAWAL') && (
            <div className="flex justify-between items-center gap-4">
              <span className="text-base sm:text-lg text-[#8c8c8c]">
                {transaction.network_code === 'FIAT' || transaction.provider === 'D24'
                  ? 'Amount'
                  : t('tx.cryptoAmount')}
              </span>
              <span className="text-base sm:text-lg font-medium text-white text-right">
                {transaction.crypto}
              </span>
            </div>
          )}

          {/* Recipient/Sender for Tips */}
          {transaction.category === 'TIP' && (
            <div className="flex justify-between items-center gap-4">
              <span className="text-base sm:text-lg text-[#8c8c8c]">
                {transaction.status === 'TIP_SENT' ? 'Sent to' : 'Received from'}
              </span>
              <span className="text-base sm:text-lg font-medium text-white text-right capitalize">
                {/* Username would be stored in crypto field for tips */}
                {transaction.crypto}
              </span>
            </div>
          )}

          {/* Amount in Display Currency */}
          <div className="flex justify-between items-center gap-4">
            <span className="text-base sm:text-lg text-[#8c8c8c]">
              {t('tx.amount')}
            </span>
            <span className="text-base sm:text-lg font-medium text-white text-right">
              {transaction.usd}
            </span>
          </div>

          {/* Type */}
          <div className="flex justify-between items-center gap-4">
            <span className="text-base sm:text-lg text-[#8c8c8c]">{t('tx.type')}</span>
            <span className="text-base sm:text-lg font-medium text-white capitalize text-right">
              {transaction.category.toLowerCase()}
            </span>
          </div>

          {/* Wallet Effect */}
          <div className="flex justify-between items-center gap-4">
            <span className="text-base sm:text-lg text-[#8c8c8c]">{t('tx.walletEffect')}</span>
            <span
              className={`text-base sm:text-lg font-medium text-right ${
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
          <div className="flex justify-between items-center gap-4">
            <span className="text-base sm:text-lg text-[#8c8c8c]">{t('tx.date')}</span>
            <span className="text-base sm:text-lg font-medium text-white text-right">
              {formatDate(transaction.date)}
            </span>
          </div>

          {/* Explorer Link - Show for deposits and withdrawals with transaction hash */}
          {explorerUrl && (transaction.category === 'DEPOSIT' || transaction.category === 'WITHDRAWAL') && (
            <div className="flex justify-between items-center gap-4">
              <span className="text-base sm:text-lg text-[#8c8c8c]">{t('tx.explorer')}</span>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base sm:text-lg text-[#4ade80] hover:underline font-medium text-right"
              >
                {t('common.viewOnExplorer')} ↗
              </a>
            </div>
          )}

          {/* Network/Provider Info - Only for deposits and withdrawals */}
          {(transaction.category === 'DEPOSIT' || transaction.category === 'WITHDRAWAL') && (
            <div className="flex justify-between items-center gap-4">
              <span className="text-base sm:text-lg text-[#8c8c8c]">{t('tx.provider')}</span>
              <span className="text-base sm:text-lg font-medium text-white text-right">
                {getProviderLabel(transaction.provider, transaction.network_code)}
              </span>
            </div>
          )}
        </div>

      </div>
    </GlassDialog>
  );
};

export default TransactionDetailModal;
