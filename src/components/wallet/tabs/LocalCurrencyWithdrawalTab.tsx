import { useState, useEffect, type FC } from 'react';
import { toast } from 'react-toastify';
import api from '@/services/api';
import { useMe } from '@/context/UserContext';
import { getDisplayCurrencies } from '@/services/wallet';
import { getPinStatus } from '@/services/transactionPin';

const LocalCurrencyWithdrawalTab: FC = () => {
  const { me } = useMe();

  // Currencies & Methods
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);

  // Payment Methods
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loadingMethods, setLoadingMethods] = useState(false);

  // Banks
  const [banks, setBanks] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [loadingBanks, setLoadingBanks] = useState(false);

  // Document Types
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false);

  // Form fields
  const [amount, setAmount] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState(me?.first_name || '');
  const [beneficiaryLastname, setBeneficiaryLastname] = useState(me?.last_name || '');
  const [documentId, setDocumentId] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [accountType, setAccountType] = useState('');

  // UI State
  const [step, setStep] = useState<'amount' | 'form' | 'success'>('amount');
  const [loading, setLoading] = useState(false);
  const [cashoutId, setCashoutId] = useState<string | null>(null);
  // Once the player has set a transaction PIN, every withdrawal asks for it.
  const [pinRequired, setPinRequired] = useState(false);
  const [pin, setPin] = useState('');

  useEffect(() => {
    void getPinStatus()
      .then((status) => setPinRequired(!!status?.enabled))
      .catch(() => undefined);
  }, []);

  // Fetch currencies on mount
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await getDisplayCurrencies();
        const fiats = response?.data || [];
        setCurrencies(fiats);
        if (fiats.length > 0) {
          setSelectedCurrency(fiats[0].code);
        }
        setLoadingCurrencies(false);
      } catch (err) {
        console.error('[Withdrawal] Error fetching currencies:', err);
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
          const currency = currencies.find((c) => c.code === selectedCurrency);
          const countryCode = currency?.country_code || 'BR';

          const response = await api.get(`/wallet/deposit/d24/payment-methods?country=${countryCode}`) as any;
          const methods = response.data?.data || response.data?.methods || [];
          setPaymentMethods(methods);
          setSelectedMethod('');
          setBanks([]);
        } catch (err) {
          console.error('[Withdrawal] Error fetching methods:', err);
          toast.error('Failed to load payment methods');
        } finally {
          setLoadingMethods(false);
        }
      };

      fetchMethods();
    }
  }, [selectedCurrency, currencies]);

  // Fetch banks when method is selected
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
          console.error('[Withdrawal] Error fetching banks:', err);
          toast.error('Failed to load banks');
        } finally {
          setLoadingBanks(false);
        }
      };

      fetchBanks();
    }
  }, [selectedMethod, selectedCurrency, currencies]);

  // Fetch document types when currency changes
  useEffect(() => {
    if (selectedCurrency) {
      const fetchDocumentTypes = async () => {
        try {
          setLoadingDocumentTypes(true);
          const currency = currencies.find((c) => c.code === selectedCurrency);
          const countryCode = currency?.country_code || 'BR';

          const response = await api.get(`/wallet/deposit/d24/document-types?country=${countryCode}`) as any;
          const docTypesData = response.data?.data?.document_types || [];
          // Extract type codes from objects
          const docTypeCodes = docTypesData.map((type: any) =>
            typeof type === 'string' ? type : type.code || type.name || type
          );
          setDocumentTypes(docTypeCodes);
          setDocumentType('');
        } catch (err) {
          console.error('[Withdrawal] Error fetching document types:', err);
          setDocumentTypes([]);
        } finally {
          setLoadingDocumentTypes(false);
        }
      };

      fetchDocumentTypes();
    }
  }, [selectedCurrency, currencies]);

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

      if (!amount || Number(amount) <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      if (pinRequired && !/^\d{4,6}$/.test(pin)) {
        toast.error('Please enter your transaction PIN');
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
        bank_branch: bankBranch,
        bank_account: bankAccount,
        account_type: accountType,
        document_id: documentId,
        document_type: documentType,
        email: me?.email,
        ...(pinRequired ? { transaction_pin: pin } : {}),
      }) as any;

      console.log('[Withdrawal] Cashout created:', response.data);
      setCashoutId(response.data.cashout_id);
      setStep('success');
      toast.success('Withdrawal request submitted. It will be paid once it has been reviewed.');
    } catch (err: any) {
      console.error('[Withdrawal] Error:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to submit withdrawal';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPin('');
    setAmount('');
    setBeneficiaryName(me?.first_name || '');
    setBeneficiaryLastname(me?.last_name || '');
    setDocumentId('');
    setDocumentType('');
    setBankBranch('');
    setBankAccount('');
    setAccountType('');
    setSelectedBank('');
    setCashoutId(null);
    setStep('amount');
  };

  // Common UI: Currency Dropdown + Payment Methods
  const renderCurrencyAndMethods = () => (
    <div className="space-y-4">
      {/* Currency Dropdown */}
      <div>
        <label className="text-xs font-semibold text-slate-300 mb-2 block">Select Currency</label>
        {loadingCurrencies ? (
          <div className="text-slate-400 text-xs">Loading currencies...</div>
        ) : (
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-slate-100 focus:outline-none focus:border-emerald-500 text-sm"
          >
            <option value="">Select a currency...</option>
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Payment Methods */}
      {selectedCurrency && (
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-2 block">Payment Method</label>
          {loadingMethods ? (
            <div className="text-slate-400 text-xs">Loading payment methods...</div>
          ) : paymentMethods.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 max-h-48 overflow-y-auto">
              {paymentMethods.map((method) => (
                <button
                  key={method.code}
                  onClick={() => {
                    setSelectedMethod(method.code);
                    // Automatically proceed to form step
                    setTimeout(() => setStep('form'), 100);
                  }}
                  className={`p-4 rounded-lg border transition flex flex-col items-center justify-center ${
                    selectedMethod === method.code
                      ? 'border-emerald-500 bg-emerald-900/20'
                      : 'border-slate-700 hover:border-emerald-500 hover:bg-slate-800/50'
                  }`}
                  title={method.name}
                >
                  {method.logo ? (
                    <img
                      src={method.logo}
                      alt={method.name}
                      className="w-12 h-12 object-contain mb-2"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 mb-2 bg-slate-700 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-300">{method.code.substring(0, 2)}</span>
                    </div>
                  )}
                  <p className="text-xs font-semibold text-slate-100 text-center">{method.code}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-xs">No methods available for this currency</p>
          )}
        </div>
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────
  // STEP 1: Select Currency & Payment Method
  // ─────────────────────────────────────────────────────────────────────
  if (step === 'amount') {
    return (
      <div className="space-y-4">
        <h3 className="text-slate-300 font-semibold text-sm">Select Withdrawal Method</h3>

        {renderCurrencyAndMethods()}

      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // STEP 2: Amount & Beneficiary Details Form
  // ─────────────────────────────────────────────────────────────────────
  if (step === 'form') {
    return (
      <div className="space-y-3 max-h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-slate-300 font-semibold text-sm">Withdrawal Information</h3>
          <button
            onClick={() => setStep('amount')}
            className="text-xs text-slate-400 hover:text-slate-300"
          >
            ← Change
          </button>
        </div>

        <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700 space-y-1 text-xs">
          <p><span className="text-slate-400">Currency:</span> <span className="text-emerald-400 font-semibold">{selectedCurrency}</span></p>
          <p><span className="text-slate-400">Method:</span> <span className="text-emerald-400 font-semibold">{selectedMethod}</span></p>
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1 block">Amount ({selectedCurrency}) *</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full h-9 rounded-lg bg-slate-900 border border-slate-700 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>

        {/* Beneficiary Name */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1 block">First Name *</label>
          <input
            type="text"
            value={beneficiaryName}
            onChange={(e) => setBeneficiaryName(e.target.value)}
            placeholder="First name"
            className="w-full h-9 rounded-lg bg-slate-900 border border-slate-700 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>

        {/* Beneficiary Lastname */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1 block">Last Name *</label>
          <input
            type="text"
            value={beneficiaryLastname}
            onChange={(e) => setBeneficiaryLastname(e.target.value)}
            placeholder="Last name"
            className="w-full h-9 rounded-lg bg-slate-900 border border-slate-700 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>

        {/* Document Type */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1 block">Document Type</label>
          {loadingDocumentTypes ? (
            <div className="text-slate-400 text-xs">Loading document types...</div>
          ) : documentTypes.length > 0 ? (
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full h-9 rounded-lg bg-slate-900 border border-slate-700 px-3 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
            >
              <option value="">Select document type...</option>
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              placeholder="e.g., CPF"
              className="w-full h-9 rounded-lg bg-slate-900 border border-slate-700 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
            />
          )}
        </div>

        {/* Document ID */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1 block">Document ID</label>
          <input
            type="text"
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
            placeholder="Document number"
            className="w-full h-9 rounded-lg bg-slate-900 border border-slate-700 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>

        {/* Bank Selection */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1 block">Select Bank *</label>
          {loadingBanks ? (
            <div className="text-slate-400 text-xs">Loading banks...</div>
          ) : (
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="w-full h-9 rounded-lg bg-slate-900 border border-slate-700 px-3 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
            >
              <option value="">Select a bank...</option>
              {banks.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Bank Account */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1 block">Bank Account Number *</label>
          <input
            type="text"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            placeholder="Full account number"
            className="w-full h-9 rounded-lg bg-slate-900 border border-slate-700 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>

        {/* Bank Branch */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1 block">Bank Branch Code *</label>
          <input
            type="text"
            value={bankBranch}
            onChange={(e) => setBankBranch(e.target.value)}
            placeholder="Branch code"
            className="w-full h-9 rounded-lg bg-slate-900 border border-slate-700 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>

        {/* Account Type */}
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1 block">Account Type</label>
          <select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            className="w-full h-9 rounded-lg bg-slate-900 border border-slate-700 px-3 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
          >
            <option value="">Select type...</option>
            <option value="C">Checking</option>
            <option value="S">Savings</option>
          </select>
        </div>

        {pinRequired && (
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Transaction PIN *</label>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="4-6 digits"
              className="w-full h-9 rounded-lg bg-slate-900 border border-slate-700 px-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 text-xs tracking-[0.4em]"
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmitWithdrawal}
          disabled={loading}
          className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium disabled:opacity-50 text-sm mt-2"
        >
          {loading ? 'Processing...' : 'Submit Withdrawal'}
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // STEP 3: Success
  // ─────────────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="space-y-4 text-center py-6">
        <div className="text-3xl">✅</div>
        <h3 className="text-lg font-semibold text-emerald-400">Withdrawal Submitted!</h3>

        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 space-y-2 text-left text-xs">
          <p><span className="text-slate-400">Cashout ID:</span> <code className="text-emerald-400 font-mono text-xs break-all">{cashoutId}</code></p>
          <p><span className="text-slate-400">Currency:</span> <span className="font-semibold">{selectedCurrency}</span></p>
          <p><span className="text-slate-400">Amount:</span> <span className="font-semibold">{amount}</span></p>
          <p><span className="text-slate-400">Status:</span> <span className="text-blue-400">PENDING</span></p>
        </div>

        <div className="bg-blue-900/30 border border-blue-600 p-2 rounded-lg">
          <p className="text-blue-300 text-xs">
            Your withdrawal is being processed. Check your email for confirmation.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium text-sm"
        >
          New Withdrawal
        </button>
      </div>
    );
  }

  return null;
};

export default LocalCurrencyWithdrawalTab;
