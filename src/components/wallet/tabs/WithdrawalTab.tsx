import { useState, useEffect, type FC } from 'react';
import { toast } from 'react-toastify';
import api from '@/services/api';
import { useMe } from '@/context/UserContext';

const WithdrawalTab: FC = () => {
  const { me } = useMe();

  // Currencies & Methods
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);

  // Payment Methods
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loadingMethods, setLoadingMethods] = useState(false);

  // Banks
  const [banks, setBanks] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [loadingBanks, setLoadingBanks] = useState(false);

  // Form fields
  const [amount, setAmount] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState(me?.first_name || '');
  const [beneficiaryLastname, setBeneficiaryLastname] = useState(me?.last_name || '');
  const [documentId, setDocumentId] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [accountType, setAccountType] = useState('');
  const [phone, setPhone] = useState('');

  // UI State
  const [step, setStep] = useState<'currency' | 'method' | 'amount' | 'form' | 'success'>('currency');
  const [loading, setLoading] = useState(false);
  const [cashoutId, setCashoutId] = useState<string | null>(null);

  // Fetch currencies on mount
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await api.get('/wallet/currencies') as any;
        const fiats = response.data.currencies.filter((c: any) => c.type === 'fiat');
        setCurrencies(fiats);
        setLoadingCurrencies(false);
      } catch (err) {
        console.error('Error fetching currencies:', err);
        toast.error('Failed to load currencies');
        setLoadingCurrencies(false);
      }
    };

    fetchCurrencies();
  }, []);

  // Fetch payment methods when currency is selected
  useEffect(() => {
    if (selectedCurrency) {
      const fetchMethods = async () => {
        try {
          setLoadingMethods(true);
          const response = await api.get(`/wallet/withdrawal/d24/methods?currency=${selectedCurrency}`) as any;
          setPaymentMethods(response.data.methods || []);
          setSelectedMethod('');
          setBanks([]);
        } catch (err) {
          console.error('Error fetching methods:', err);
          toast.error('Failed to load payment methods');
        } finally {
          setLoadingMethods(false);
        }
      };

      fetchMethods();
    }
  }, [selectedCurrency]);

  // Fetch banks when payment method is selected
  useEffect(() => {
    if (selectedMethod && selectedCurrency) {
      const fetchBanks = async () => {
        try {
          setLoadingBanks(true);
          const currency = currencies.find((c) => c.code === selectedCurrency);
          const countryCode = currency?.country_code || 'BR';

          const response = await api.get(`/wallet/withdrawal/d24/banks?country=${countryCode}`) as any;
          setBanks(response.data.banks || []);
          setSelectedBank('');
        } catch (err) {
          console.error('Error fetching banks:', err);
          toast.error('Failed to load banks');
        } finally {
          setLoadingBanks(false);
        }
      };

      fetchBanks();
    }
  }, [selectedMethod, selectedCurrency, currencies]);

  const handleCurrencySelect = (code: string) => {
    setSelectedCurrency(code);
    setStep('method');
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    setStep('amount');
  };

  const handleAmountSubmit = () => {
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setStep('form');
  };

  const handleSubmitWithdrawal = async () => {
    try {
      if (!selectedBank || !bankAccount) {
        toast.error('Please select a bank and enter account details');
        return;
      }

      if (!beneficiaryName || !beneficiaryLastname) {
        toast.error('Please enter beneficiary name');
        return;
      }

      setLoading(true);

      const currency = currencies.find((c) => c.code === selectedCurrency);

      const response = await api.post('/wallet/withdrawal/d24/cashout', {
        amount,
        currency: selectedCurrency,
        country: currency?.country_code || 'BR',
        beneficiary_name: beneficiaryName,
        beneficiary_lastname: beneficiaryLastname,
        bank_code: selectedBank,
        bank_account: bankAccount,
        account_type: accountType,
        document_id: documentId,
        document_type: documentType,
        email: me?.email,
        phone,
      }) as any;

      console.log('[Withdrawal] Cashout created:', response.data);
      setCashoutId(response.data.cashout_id);
      setStep('success');
      toast.success('Withdrawal request submitted successfully!');
    } catch (err: any) {
      console.error('[Withdrawal] Error:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to submit withdrawal';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedCurrency('');
    setSelectedMethod('');
    setAmount('');
    setBeneficiaryName(me?.first_name || '');
    setBeneficiaryLastname(me?.last_name || '');
    setDocumentId('');
    setDocumentType('');
    setBankAccount('');
    setAccountType('');
    setPhone('');
    setSelectedBank('');
    setCashoutId(null);
    setStep('currency');
  };

  // ─────────────────────────────────────────────────────────────────────
  // STEP 1: Currency Selection
  // ─────────────────────────────────────────────────────────────────────
  if (step === 'currency') {
    if (loadingCurrencies) {
      return (
        <div className="flex justify-center py-12">
          <div className="text-slate-400">Loading currencies...</div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-slate-300 font-semibold mb-4">Select Currency to Withdraw</h3>
        <div className="grid grid-cols-2 gap-3">
          {currencies.map((currency) => (
            <button
              key={currency.code}
              onClick={() => handleCurrencySelect(currency.code)}
              className="p-4 rounded-lg border border-slate-700 hover:border-emerald-500 hover:bg-slate-800/50 transition text-left"
            >
              <p className="font-semibold text-slate-100">{currency.code}</p>
              <p className="text-xs text-slate-400">{currency.name}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // STEP 2: Payment Method Selection
  // ─────────────────────────────────────────────────────────────────────
  if (step === 'method') {
    if (loadingMethods) {
      return (
        <div className="flex justify-center py-12">
          <div className="text-slate-400">Loading payment methods...</div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-300 font-semibold">Select Withdrawal Method</h3>
          <button
            onClick={() => setStep('currency')}
            className="text-xs text-slate-400 hover:text-slate-300"
          >
            ← Change
          </button>
        </div>

        <div className="bg-slate-800/30 p-3 rounded-lg mb-4 border border-slate-700">
          <p className="text-slate-300">Currency: <span className="font-semibold text-emerald-400">{selectedCurrency}</span></p>
        </div>

        <div className="space-y-2">
          {paymentMethods.map((method) => (
            <button
              key={method}
              onClick={() => handleMethodSelect(method)}
              className="w-full p-4 rounded-lg border border-slate-700 hover:border-emerald-500 hover:bg-slate-800/50 transition text-left"
            >
              <p className="font-semibold text-slate-100">{method}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // STEP 3: Amount Input
  // ─────────────────────────────────────────────────────────────────────
  if (step === 'amount') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-300 font-semibold">Enter Withdrawal Amount</h3>
          <button
            onClick={() => setStep('method')}
            className="text-xs text-slate-400 hover:text-slate-300"
          >
            ← Change
          </button>
        </div>

        <div className="bg-slate-800/30 p-3 rounded-lg mb-4 border border-slate-700 space-y-2">
          <p className="text-slate-300">Currency: <span className="font-semibold text-emerald-400">{selectedCurrency}</span></p>
          <p className="text-slate-300">Method: <span className="font-semibold text-emerald-400">{selectedMethod}</span></p>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-300 mb-2 block">Amount ({selectedCurrency})</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          onClick={handleAmountSubmit}
          className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium"
        >
          Continue
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // STEP 4: Beneficiary & Bank Details Form
  // ─────────────────────────────────────────────────────────────────────
  if (step === 'form') {
    return (
      <div className="space-y-4 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-slate-900 pt-2">
          <h3 className="text-slate-300 font-semibold">Withdrawal Details</h3>
          <button
            onClick={() => setStep('amount')}
            className="text-xs text-slate-400 hover:text-slate-300"
          >
            ← Change
          </button>
        </div>

        <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700 space-y-1 text-sm">
          <p><span className="text-slate-400">Currency:</span> <span className="text-emerald-400 font-semibold">{selectedCurrency}</span></p>
          <p><span className="text-slate-400">Amount:</span> <span className="text-emerald-400 font-semibold">{amount}</span></p>
          <p><span className="text-slate-400">Method:</span> <span className="text-emerald-400 font-semibold">{selectedMethod}</span></p>
        </div>

        {/* Beneficiary Name */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-2 block">First Name *</label>
          <input
            type="text"
            value={beneficiaryName}
            onChange={(e) => setBeneficiaryName(e.target.value)}
            placeholder="First name"
            className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Beneficiary Lastname */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-2 block">Last Name *</label>
          <input
            type="text"
            value={beneficiaryLastname}
            onChange={(e) => setBeneficiaryLastname(e.target.value)}
            placeholder="Last name"
            className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Document Type */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-2 block">Document Type (optional)</label>
          <input
            type="text"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            placeholder="e.g., CPF, DNI, RUN"
            className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Document ID */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-2 block">Document ID (optional)</label>
          <input
            type="text"
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
            placeholder="Document number"
            className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Bank Selection */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-2 block">Select Bank *</label>
          {loadingBanks ? (
            <div className="text-slate-400 text-sm">Loading banks...</div>
          ) : (
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="">Select a bank...</option>
              {banks.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name} ({bank.code})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Bank Account */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-2 block">Bank Account *</label>
          <input
            type="text"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            placeholder="Enter account number"
            className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Account Type */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-2 block">Account Type (optional)</label>
          <select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-slate-100 focus:outline-none focus:border-emerald-500"
          >
            <option value="">Select account type...</option>
            <option value="C">Checking</option>
            <option value="S">Savings</option>
          </select>
        </div>

        {/* Phone */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-2 block">Phone (optional)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1234567890"
            className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmitWithdrawal}
          disabled={loading}
          className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Submit Withdrawal'}
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // STEP 5: Success
  // ─────────────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="space-y-4 text-center py-8">
        <div className="text-4xl">✅</div>
        <h3 className="text-xl font-semibold text-emerald-400">Withdrawal Submitted!</h3>

        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-2 text-left">
          <p><span className="text-slate-400">Cashout ID:</span> <code className="text-emerald-400 font-mono text-sm">{cashoutId}</code></p>
          <p><span className="text-slate-400">Currency:</span> <span className="font-semibold">{selectedCurrency}</span></p>
          <p><span className="text-slate-400">Amount:</span> <span className="font-semibold">{amount}</span></p>
          <p><span className="text-slate-400">Status:</span> <span className="text-blue-400">PENDING</span></p>
        </div>

        <div className="bg-blue-900/30 border border-blue-600 p-3 rounded-lg">
          <p className="text-blue-300 text-sm">
            Your withdrawal is being processed. You'll receive a confirmation email shortly.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium"
        >
          New Withdrawal
        </button>
      </div>
    );
  }

  return null;
};

export default WithdrawalTab;
