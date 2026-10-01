import { useEffect, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { FieldGroup, SettingRow } from '@/components/profile/SectionShell';
import { ReceiptIcon, WalletIcon } from '@/components/icons';
import { analytics } from '@/services/analytics';
import type { Balance } from '@/types';

/** Exact decimal string in, display string out — never through a float. */
const formatAmount = (amount: string): string =>
  Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface Props {
  balance: Balance | null;
  loading: boolean;
}

/**
 * What the wallet holds now, and the ledger that would explain how it got
 * there. The balances are real (GET /balance/me); there is no transactions
 * endpoint yet, so the history below is an empty state rather than invented
 * rows.
 */
const TransactionsSection: FC<Props> = ({ balance, loading }) => {
  const { t } = useTranslation();

  // The closest thing to a cashier the app has today. Traffic here is the
  // baseline for the buy/redeem flows when they arrive.
  useEffect(() => {
    analytics.wallet.viewed();
  }, []);

  return (
    <div className="space-y-6">
      <FieldGroup label={t('profile.wallet')}>
        {loading && <SettingRow title={t('common.loading')} />}

        {!loading && !balance && <SettingRow title="—" detail={t('profile.loadFailed')} />}

        {!loading && balance && (
          <>
            <SettingRow
              icon={<WalletIcon size={15} />}
              title={`${formatAmount(balance.real_amount)} ${balance.currency}`}
              detail={t('wallet.real')}
            />
            <SettingRow
              icon={<WalletIcon size={15} />}
              title={`${formatAmount(balance.bonus_amount)} ${balance.currency}`}
              detail={t('wallet.bonus')}
            />
            <SettingRow
              icon={<WalletIcon size={15} />}
              title={`${formatAmount(balance.total_amount)} ${balance.currency}`}
              detail={t('wallet.total')}
            />
          </>
        )}
      </FieldGroup>

      <FieldGroup label={t('profile.transactions')}>
        <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-600">
            <ReceiptIcon size={20} />
          </span>
          <p className="text-xs text-slate-500">{t('profile.noTransactions')}</p>
        </div>
      </FieldGroup>
    </div>
  );
};

export default TransactionsSection;
