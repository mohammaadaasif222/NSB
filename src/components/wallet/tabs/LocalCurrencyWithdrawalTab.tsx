import { useState, useEffect, type FC, type InputHTMLAttributes, type ReactNode } from 'react';
import { toast } from 'react-toastify';
import api from '@/services/api';
import { useMe } from '@/context/UserContext';
import { getDisplayCurrencies } from '@/services/wallet';
import { getPinStatus } from '@/services/transactionPin';
import { useSeonGuard } from '@/context/SeonGuardContext';
import { isStepUpCancelled } from '@/lib/seon-guard';
import { useTranslation } from '@/context/I18nContext';
import Button from '@/components/ui/Button';
import WalletField, {
  WALLET_INPUT,
  WALLET_NOTE,
  WALLET_PILL,
  WALLET_VALUE,
} from '../shared/WalletField';
import WalletSelect from '../shared/WalletSelect';
import PaymentMethodGrid from '../shared/PaymentMethodGrid';

interface Props {
  /** True when the error was an account lock the parent now shows. */
  onRestricted?: (err: unknown) => boolean;
  /** True when the error was a KYC refusal the parent now shows. */
  onKycRefused?: (err: unknown) => boolean;
  /** What can be withdrawn, in the currency the balance is held in — for the % shortcuts. */
  available?: { amount: string; currency: string };
}

const LocalCurrencyWithdrawalTab: FC<Props> = ({ onRestricted, onKycRefused, available }) => {
  const { t } = useTranslation();
  const { me } = useMe();
  // On a 428 it asks for the one-time code and resubmits.
  const { run } = useSeonGuard();

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

          const response = (await api.get(
            `/wallet/deposit/d24/payment-methods?country=${countryCode}`
          )) as any;
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

          const response = (await api.get(
            `/wallet/withdrawal/d24/banks?country=${countryCode}`
          )) as any;
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

          const response = (await api.get(
            `/wallet/deposit/d24/document-types?country=${countryCode}`
          )) as any;
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

      const response = (await run((headers) =>
        api.post(
          '/wallet/withdrawal/d24/cashout',
          {
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
          },
          { headers }
        )
      )) as any;

      console.log('[Withdrawal] Cashout created:', response.data);
      setCashoutId(response.data.cashout_id);
      setStep('success');
      toast.success('Withdrawal request submitted. It will be paid once it has been reviewed.');
    } catch (err: any) {
      console.error('[Withdrawal] Error:', err);
      if (isStepUpCancelled(err)) return;
      if (onRestricted?.(err)) return;
      if (onKycRefused?.(err)) return;
      const errorMsg =
        err?.response?.data?.message || err?.message || 'Failed to submit withdrawal';
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

  const currencyRow = currencies.find((c) => c.code === selectedCurrency);
  const sign = currencyRow?.symbol || '$';
  // The shortcuts need the balance in this currency; offered only when it is
  // the one the balance is held in.
  const availableHere =
    available && available.currency === selectedCurrency ? Number(available.amount) : NaN;
  const setPercent = (pct: number): void => {
    if (!Number.isFinite(availableHere) || availableHere <= 0) return;
    setAmount(((availableHere * pct) / 100).toFixed(2).replace(/\.?0+$/, ''));
  };
  const pill = (
    id: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
    placeholder: string,
    extra: Partial<InputHTMLAttributes<HTMLInputElement>> = {}
  ) => (
    <WalletField htmlFor={id} label={label}>
      <div className={WALLET_PILL}>
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className={WALLET_INPUT}
          {...extra}
        />
      </div>
    </WalletField>
  );

  // ─────────────────────────────────────────────────────────────────────
  // STEP 1: Select Currency & Payment Method
  // ─────────────────────────────────────────────────────────────────────
  if (step === 'amount') {
    return (
      <div className="space-y-4">
        <WalletField htmlFor="lw-currency" label={t('pref.currency')}>
          {loadingCurrencies ? (
            <div className={WALLET_PILL}>
              <span className="text-[16px] leading-6 text-[#9da2b4]">{t('common.loading')}</span>
            </div>
          ) : (
            <WalletSelect
              id="lw-currency"
              options={currencies.map((c) => ({ value: c.code, label: c.code, detail: c.name }))}
              value={selectedCurrency}
              onChange={setSelectedCurrency}
              placeholder={t('acct.wallet.selectCurrency')}
            />
          )}
        </WalletField>

        {selectedCurrency &&
          (loadingMethods ? (
            <p className={`${WALLET_NOTE} py-8 text-center`}>{t('acct.local.loadingMethods')}</p>
          ) : paymentMethods.length > 0 ? (
            <PaymentMethodGrid
              label={t('acct.local.withdrawMethod')}
              methods={paymentMethods.map((m) => ({
                key: m.code,
                name: m.name ?? m.code,
                logo: m.logo,
              }))}
              selected={selectedMethod}
              onSelect={(code) => {
                setSelectedMethod(code);
                // Automatically proceed to form step
                setTimeout(() => setStep('form'), 100);
              }}
            />
          ) : (
            <p className={`${WALLET_NOTE} py-8 text-center`}>
              {t('acct.local.noMethods', { currency: selectedCurrency })}
            </p>
          ))}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // STEP 2: The design's form — the beneficiary, the bank, the account and
  // the amount, 14 apart — with the details D24 also asks for after the
  // account number.
  // ─────────────────────────────────────────────────────────────────────
  if (step === 'form') {
    return (
      <div>
        <div className="space-y-3.5">
          {/* The method picked, with the way back to the tiles. */}
          <WalletField label={t('acct.local.paymentMethod')}>
            <div className={WALLET_PILL}>
              <span className={`min-w-0 flex-1 truncate ${WALLET_VALUE}`}>
                {paymentMethods.find((m) => m.code === selectedMethod)?.name ?? selectedMethod} ·{' '}
                {selectedCurrency}
              </span>
              <button
                type="button"
                onClick={() => setStep('amount')}
                className="shrink-0 text-[14px] font-medium leading-5 text-[#ffe779] hover:underline"
              >
                {t('profile.change')}
              </button>
            </div>
          </WalletField>

          <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-x-[21px]">
            {pill(
              'lw-first',
              `${t('auth.firstName')} *`,
              beneficiaryName,
              setBeneficiaryName,
              t('acct.local.enterName'),
              { autoComplete: 'given-name' }
            )}
            {pill(
              'lw-last',
              `${t('auth.lastName')} *`,
              beneficiaryLastname,
              setBeneficiaryLastname,
              t('acct.local.enterName'),
              { autoComplete: 'family-name' }
            )}
          </div>

          <WalletField htmlFor="lw-bank" label={`${t('acct.local.selectBank')} *`}>
            {loadingBanks ? (
              <div className={WALLET_PILL}>
                <span className="text-[16px] leading-6 text-[#9da2b4]">{t('common.loading')}</span>
              </div>
            ) : (
              <WalletSelect
                id="lw-bank"
                options={banks.map((b) => ({ value: String(b.code), label: b.name as string }))}
                value={selectedBank}
                onChange={setSelectedBank}
                placeholder={t('acct.local.selectBank')}
              />
            )}
          </WalletField>

          {pill(
            'lw-account',
            `${t('acct.local.accountNumber')} *`,
            bankAccount,
            setBankAccount,
            'XXXX XXXX XXXX XXXX',
            { inputMode: 'numeric' }
          )}

          <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-x-[21px]">
            {pill(
              'lw-branch',
              `${t('acct.local.branchCode')} *`,
              bankBranch,
              setBankBranch,
              t('acct.local.branchCode')
            )}
            <WalletField htmlFor="lw-account-type" label={t('acct.local.accountType')}>
              <WalletSelect
                id="lw-account-type"
                options={[
                  { value: 'C', label: t('acct.local.checking') },
                  { value: 'S', label: t('acct.local.savings') },
                ]}
                value={accountType as '' | 'C' | 'S'}
                onChange={setAccountType}
                placeholder={t('acct.local.selectType')}
              />
            </WalletField>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-x-[21px]">
            <WalletField htmlFor="lw-doc-type" label={t('acct.local.documentType')}>
              {loadingDocumentTypes ? (
                <div className={WALLET_PILL}>
                  <span className="text-[16px] leading-6 text-[#9da2b4]">
                    {t('common.loading')}
                  </span>
                </div>
              ) : documentTypes.length > 0 ? (
                <WalletSelect
                  id="lw-doc-type"
                  options={documentTypes.map((type) => ({ value: type, label: type }))}
                  value={documentType}
                  onChange={setDocumentType}
                  placeholder={t('acct.local.selectType')}
                />
              ) : (
                <div className={WALLET_PILL}>
                  <input
                    id="lw-doc-type"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    placeholder="CPF"
                    className={WALLET_INPUT}
                  />
                </div>
              )}
            </WalletField>
            {pill(
              'lw-doc',
              t('acct.local.documentId'),
              documentId,
              setDocumentId,
              t('acct.local.documentPlaceholder')
            )}
          </div>

          {pinRequired &&
            pill(
              'lw-pin',
              `${t('acct.pin.label')} *`,
              pin,
              (v) => setPin(v.replace(/\D/g, '').slice(0, 6)),
              t('acct.pin.placeholder'),
              {
                type: 'password',
                inputMode: 'numeric',
                maxLength: 6,
                className: `${WALLET_INPUT} tracking-[0.4em]`,
              }
            )}

          {/* The amount, its sign at the end, and the quick shares under it. */}
          <div>
            <WalletField
              htmlFor="lw-amount"
              label={`${t('acct.wallet.amountIn', { currency: selectedCurrency })} *`}
            >
              <div className={WALLET_PILL}>
                <input
                  id="lw-amount"
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
                  placeholder={t('acct.wallet.enterAmountPlain')}
                  className={`${WALLET_INPUT} tabular-nums`}
                />
                <span
                  aria-hidden="true"
                  className="shrink-0 text-[18px] font-bold leading-6 text-[#9da2b4]"
                >
                  {sign}
                </span>
              </div>
            </WalletField>
            {Number.isFinite(availableHere) && availableHere > 0 && (
              <div className="mt-[9px] flex gap-2.5 sm:gap-1.5">
                {[25, 50, 75, 100].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPercent(p)}
                    className="h-9 w-[72px] rounded-full bg-white/20 text-[16px] leading-6 text-[#f0f1f5] transition-colors hover:bg-white/30 sm:h-[40.5px] sm:w-[57px] sm:text-[14px] sm:leading-5"
                  >
                    {p}%
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button
          type="button"
          fullWidth
          onClick={handleSubmitWithdrawal}
          disabled={loading}
          className="mt-[23px]"
        >
          {loading ? t('acct.buy.processing') : t('acct.wallet.tabWithdraw')}
        </Button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // STEP 3: Success
  // ─────────────────────────────────────────────────────────────────────
  if (step === 'success') {
    const row = (label: string, value: ReactNode) => (
      <div className="flex items-center justify-between gap-3 py-1.5">
        <span className="text-[#9da2b4]">{label}</span>
        <span className="min-w-0 truncate text-end font-medium text-[#f0f1f5]">{value}</span>
      </div>
    );

    return (
      <div className="py-2 text-center">
        <h3 className="text-[22px] font-semibold leading-8 text-[#f0f1f5]">
          {t('acct.local.successTitle')}
        </h3>
        <p className="mx-auto mt-2 max-w-[400px] text-[14px] leading-5 text-[#9da2b4]">
          {t('acct.local.successBody')}
        </p>

        <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 px-5 py-3 text-start text-[14px] leading-5">
          {row(t('acct.local.cashoutId'), <code className="font-mono">{cashoutId}</code>)}
          {row(t('pref.currency'), selectedCurrency)}
          {row(t('tx.amount'), amount)}
          {row(
            t('acct.local.status'),
            <span className="text-[#ffe779]">{t('acct.local.pending')}</span>
          )}
        </div>

        <Button type="button" fullWidth onClick={handleReset} className="mt-[23px]">
          {t('acct.local.newWithdrawal')}
        </Button>
      </div>
    );
  }

  return null;
};

export default LocalCurrencyWithdrawalTab;
