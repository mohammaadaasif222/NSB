import { useState, useEffect, type FC } from 'react';
import { toast } from 'react-toastify';

import { useTranslation } from '@/context/I18nContext';
import { getDisplayCurrencies } from '@/services/wallet';

const LocalCurrencyWithdrawalTab: FC = () => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [displayCurrencies, setDisplayCurrencies] = useState<any[]>([]);

  // Fetch enabled display currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await getDisplayCurrencies();
        const enabledCurrencies = response?.data || [];
        setDisplayCurrencies(enabledCurrencies);

        if (enabledCurrencies.length > 0) {
          setCurrency(enabledCurrencies[0].code);
        } else {
          setCurrency('USD');
        }
      } catch (error) {
        console.error('Failed to fetch display currencies:', error);
        setCurrency('USD');
      } finally {
        setLoadingCurrencies(false);
      }
    };

    fetchCurrencies();
  }, []);

  const handlePercentage = (percentage: number) => {
    // TODO: Get available balance and calculate percentage
    // For now, just show a placeholder
    toast.info(`${percentage}% of available balance`);
  };

  const handleWithdraw = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error(t('acct.wallet.invalidAmount'));
      return;
    }

    if (!currency) {
      toast.error(t('acct.wallet.selectCurrency') || 'Please select a currency');
      return;
    }

    if (!bank) {
      toast.error('Please select a bank');
      return;
    }

    if (!accountNumber) {
      toast.error('Please enter account number');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call withdrawal API endpoint
      // const res = await createD24Withdrawal({
      //   amount,
      //   currency,
      //   bank,
      //   accountNumber,
      // });

      toast.success('Withdrawal request submitted');
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err && 'message' in err
          ? String((err as { message: string }).message)
          : 'Withdrawal failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Currency selector */}
      <div>
        <label className="text-xs font-semibold text-slate-300 mb-2 block">
          {t('pref.currency')}
        </label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          disabled={loadingCurrencies || displayCurrencies.length === 0}
          className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {displayCurrencies.length > 0 ? (
            displayCurrencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))
          ) : (
            <option value="USD">USD</option>
          )}
        </select>
      </div>

      {/* Select Bank */}
      <div>
        <label className="text-xs font-semibold text-slate-300 mb-2 block">
          Select Bank
        </label>
        <select
          value={bank}
          onChange={(e) => setBank(e.target.value)}
          className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
        >
          <option value="">Select Bank</option>
          <option value="bank1">Bank 1</option>
          <option value="bank2">Bank 2</option>
          <option value="bank3">Bank 3</option>
        </select>
      </div>

      {/* Account Number */}
      <div>
        <label className="text-xs font-semibold text-slate-300 mb-2 block">
          Account Number
        </label>
        <input
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="XXXX XXXX XXXX XXXX"
          className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Amount input */}
      <div>
        <label className="text-xs font-semibold text-slate-300 mb-2 block">
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-slate-400 text-sm font-semibold">
            {displayCurrencies.find((c) => c.code === currency)?.symbol || '$'}
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder="Enter Amount"
            className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 pl-8 pr-12 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Percentage buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handlePercentage(25)}
          className="flex-1 h-10 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:border-slate-600 hover:text-slate-100 transition-all"
        >
          25%
        </button>
        <button
          type="button"
          onClick={() => handlePercentage(50)}
          className="flex-1 h-10 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:border-slate-600 hover:text-slate-100 transition-all"
        >
          50%
        </button>
        <button
          type="button"
          onClick={() => handlePercentage(75)}
          className="flex-1 h-10 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:border-slate-600 hover:text-slate-100 transition-all"
        >
          75%
        </button>
        <button
          type="button"
          onClick={() => handlePercentage(100)}
          className="flex-1 h-10 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:border-slate-600 hover:text-slate-100 transition-all"
        >
          100%
        </button>
      </div>

      {/* Withdraw button */}
      <button
        type="button"
        onClick={handleWithdraw}
        disabled={loading || loadingCurrencies || !amount || Number(amount) <= 0 || !currency || !bank || !accountNumber}
        className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
          loading || loadingCurrencies || !amount || Number(amount) <= 0 || !currency || !bank || !accountNumber
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
            : 'bg-yellow-400 hover:bg-yellow-300 text-black shadow-lg'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </span>
        ) : (
          'Withdraw'
        )}
      </button>

      {/* Help link */}
      <p className="text-center text-xs text-slate-400">
        <button type="button" className="text-blue-400 hover:text-blue-300">
          Need help with your Withdrawal?
        </button>
      </p>
    </div>
  );
};

export default LocalCurrencyWithdrawalTab;
