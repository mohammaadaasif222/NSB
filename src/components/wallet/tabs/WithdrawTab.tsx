import { useCallback, useEffect, useMemo, useState, type FC } from 'react';
import { toast } from 'react-toastify';

import api from '@/services/api';
import { useWallet } from '@/context/WalletContext';
import { useTranslation } from '@/context/I18nContext';
import { useCurrencyConversion } from '@/context/CurrencyConversionContext';
import { requestWithdrawal } from '@/services/wallet';
import { getPinStatus } from '@/services/transactionPin';
import { useSeonGuard } from '@/context/SeonGuardContext';
import { isStepUpCancelled } from '@/lib/seon-guard';
import kycApi from '@/services/kyc.api';
import type { KycErrorCode, PlayerKycProfile } from '@/types/kyc';
import { readKycError } from '@/utils/kyc-status';
import KycGateNotice from '../KycGateNotice';
import type { Currency, WalletBalance } from '@/types';
import CurrencyPicker from '../shared/CurrencyPicker';
import NetworkPicker from '../shared/NetworkPicker';
import LocalCurrencyWithdrawalTab from './LocalCurrencyWithdrawalTab';
import AccountReviewGate from '@/components/risk/AccountReviewGate';
import { useMe } from '@/context/UserContext';

interface Props {
  /**
   * Closes the wallet dialog.
   *
   * Every KYC refusal here sends the player to the account area, and the
   * wallet is an overlay owned by PlayerTopBar — navigating without closing it
   * would leave it sitting on top of the verification page.
   */
  onLeave?: () => void;
}

type WithdrawalType = 'crypto' | 'local';

/**
 * Withdraw tab with display currency model.
 *
 * Shows balance in user's active display currency.
 * Single input field for display currency amount (e.g., EUR, GBP, INR).
 * User enters amount in their display currency only.
 * Crypto amount is calculated at approval time using LIVE rates.
 */
const WithdrawTab: FC<Props> = ({ onLeave }) => {
  // Handles a fraud step-up: on a 428 it prompts for the one-time code and
  // resubmits this exact request.
  const { run } = useSeonGuard();
  const { t } = useTranslation();
  const { summary, currencies, refresh } = useWallet();
  const { me, refresh: refreshMe } = useMe();
  const restriction = me?.account_restriction;
  // A disposable-contact lock stays out of sight until the player asks to withdraw.
  const [contactAsked, setContactAsked] = useState(false);
  const withdrawLocked =
    !!restriction?.blocked_actions.includes('WITHDRAW') &&
    (restriction.requires !== 'CONTACT_VERIFICATION' || contactAsked);
  const onRestricted = (err: unknown): boolean => {
    const errors = (err as { errors?: { code?: string; requires?: string } })?.errors;
    if (errors?.code !== 'ACCOUNT_RESTRICTED') return false;
    if (errors.requires === 'CONTACT_VERIFICATION') setContactAsked(true);
    void refreshMe();
    return true;
  };
  const { convertToDisplayCurrency } = useCurrencyConversion();

  const displayCurrency = summary?.preferences.active_currency ?? 'USD';
  const [withdrawalType, setWithdrawalType] = useState<WithdrawalType>('crypto');

  const eligible = useMemo(
    () =>
      currencies.filter(
        (c) => c.category === 'CRYPTO' && c.is_withdrawal_enabled && c.networks.length > 0
      ),
    [currencies]
  );

  const [currency, setCurrency] = useState<string>(() => {
    const active = summary?.preferences.active_currency;
    if (active && eligible.some((c) => c.code === active)) return active;
    return eligible[0]?.code ?? '';
  });

  const currencyRow: Currency | undefined = useMemo(
    () => eligible.find((c) => c.code === currency),
    [eligible, currency]
  );

  const enabledNetworks = useMemo(
    () => currencyRow?.networks.filter((n) => n.is_enabled) ?? [],
    [currencyRow]
  );

  const [network, setNetwork] = useState<string>(() => {
    return enabledNetworks[0]?.code ?? '';
  });

  useEffect(() => {
    if (!enabledNetworks.length) {
      setNetwork('');
      return;
    }
    if (!enabledNetworks.some((n) => n.code === network)) {
      setNetwork(enabledNetworks[0].code);
    }
  }, [enabledNetworks, network]);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (!currency) {
        setExchangeRate(null);
        return;
      }
      try {
        setLoadingRate(true);
        const response = (await api.get(`/wallet/rates?fiat=${displayCurrency}`)) as any;
        const rates = response.data as Array<{ from: string; to: string; rate: string }>;
        if (rates && Array.isArray(rates)) {
          const rate = rates.find((r) => r.from === currency && r.to === displayCurrency);
          if (rate) {
            setExchangeRate(rate.rate);
          } else {
            setExchangeRate(null);
          }
        } else {
          setExchangeRate(null);
        }
      } catch (err) {
        console.error('Failed to fetch exchange rate:', err);
        setExchangeRate(null);
      } finally {
        setLoadingRate(false);
      }
    };

    void fetchExchangeRate();
  }, [currency, displayCurrency]);

  /* ── Balance (USD-native unified model) ─────────────────────────── */

  const balanceRow: WalletBalance | null = useMemo(() => {
    if (!summary) return null;
    return summary.balance ?? null;
  }, [summary]);

  // Available balance in USD (only REAL balance, excluding bonus), less
  // anything deposit rollover is still holding back.
  const availableUSD = balanceRow?.withdrawable_amount ?? balanceRow?.real_amount ?? '0';
  const heldBack = useMemo(() => {
    if (!balanceRow) return false;
    const flooredReal = Math.floor(Number(balanceRow.real_amount) * 100) / 100;
    return Number(balanceRow.withdrawable_amount) < flooredReal;
  }, [balanceRow]);

  // Available balance in display currency
  const availableDisplay = useMemo(() => {
    if (!balanceRow) return '0';
    const converted = convertToDisplayCurrency(availableUSD, 'USD');
    return converted.displayAmount;
  }, [balanceRow, availableUSD, convertToDisplayCurrency]);

  /* ── KYC Compliance State ─────────────────────────────────────── */

  const [kyc, setKyc] = useState<PlayerKycProfile | null>(null);
  const [kycLoading, setKycLoading] = useState(true);
  /**
   * A KYC refusal the withdrawal request itself came back with, kept so the
   * gate can quote the API's own reason.
   *
   * The profile alone is not enough: `TIER_UPGRADE_REQUIRED` stops a player
   * whose Level 2 is approved, so reading the profile would resolve to no gate
   * at all and the tab would look like nothing had happened.
   */
  const [kycRefusal, setKycRefusal] = useState<{
    code: KycErrorCode;
    message: string;
  } | null>(null);

  // An approved profile is only Level 2, and the minimum is configurable to
  // 4 — so the profile alone cannot answer whether this player may withdraw.
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);

  const fetchKyc = useCallback(async () => {
    try {
      setKycLoading(true);
      const [data, tiers] = await Promise.all([kycApi.getKycMe(), kycApi.getTiers()]);
      setKyc(data);
      setCurrentLevel(tiers?.currentTier ?? null);
    } catch {
      setKyc(null);
      setCurrentLevel(null);
    } finally {
      setKycLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchKyc();
  }, [fetchKyc]);

  const isKycMandatory = summary?.kyc_mandatory_for_withdrawal ?? true;
  /** The backend's own default, so a moved baseline is not second-guessed. */
  const minLevel = summary?.kyc_withdrawal_min_level ?? 2;
  // Above Level 2 the tier view answers; the profile is the fallback if that
  // request failed. Either way the backend decides — this picks what to show.
  const isKycApproved =
    !isKycMandatory ||
    (minLevel <= 2
      ? kyc?.status === 'APPROVED'
      : currentLevel !== null
        ? currentLevel >= minLevel
        : kyc?.status === 'APPROVED');
  /**
   * The profile itself blocks withdrawals. Nothing in the form can change
   * that, so the form is not worth rendering — the gate takes its place.
   */
  const isHardGated = !kycLoading && isKycMandatory && !isKycApproved;
  // Verified but short of the baseline. Reuses TIER_UPGRADE_REQUIRED so an
  // approved player is not told to verify their identity again.
  const gatedByLevel = isHardGated && kyc?.status === 'APPROVED';
  /**
   * A refusal against an otherwise-approved profile: a tier upgrade, or a hold
   * placed after approval. The form STAYS — a tier refusal means the amount
   * was over a cap, and a smaller one would go through. Replacing the form
   * here would take away the one thing that fixes it.
   */
  const softRefusal = !isHardGated ? kycRefusal : null;

  /* ── Form state ────────────────────────────────────────────────── */

  const [toAddress, setToAddress] = useState('');
  const [pinRequired, setPinRequired] = useState(false);
  const [pin, setPin] = useState('');

  useEffect(() => {
    void getPinStatus()
      .then((s) => setPinRequired(!!s?.enabled))
      .catch(() => undefined);
  }, []);
  const [displayAmount, setDisplayAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<string | null>(null);
  const [loadingRate, setLoadingRate] = useState(false);

  /**
   * A refusal was about the request that produced it. Editing any part of that
   * request makes it stale, so it goes — otherwise a player who drops the
   * amount under the cap is still reading why the previous one was refused.
   */
  const clearRefusal = (): void => setKycRefusal(null);

  const calculatedCryptoAmount = useMemo(() => {
    if (!displayAmount || !exchangeRate || Number(exchangeRate) === 0) return null;
    try {
      const displayNum = Number(displayAmount);
      const rate = Number(exchangeRate);
      if (!isFinite(displayNum) || !isFinite(rate) || displayNum <= 0) return null;
      const crypto = displayNum / rate;
      return crypto.toFixed(8);
    } catch {
      return null;
    }
  }, [displayAmount, exchangeRate]);

  // Handle display amount input
  const handleDisplayChange = (value: string) => {
    const cleanValue = value.replace(/[^\d.]/g, '');
    setDisplayAmount(cleanValue);
    clearRefusal();
  };

  const setPercent = (pct: 25 | 50 | 75 | 100): void => {
    clearRefusal();
    const n = Number(availableUSD);
    if (!isFinite(n) || n <= 0) {
      setDisplayAmount('0');
      return;
    }

    // Calculate percentage of available USD
    const percentUSD = (n * pct) / 100;

    // Convert to display currency
    const converted = convertToDisplayCurrency(percentUSD.toFixed(2), 'USD');
    const displayNum = Number(converted.displayAmount);

    // Update display amount
    setDisplayAmount(displayNum.toFixed(2).replace(/\.?0+$/, ''));
  };

  const networkRow = useMemo(
    () => enabledNetworks.find((n) => n.code === network) ?? null,
    [enabledNetworks, network]
  );

  const minWithdrawal = Number(networkRow?.min_withdrawal ?? '0');

  const belowMinimum = useMemo(() => {
    if (!minWithdrawal || !calculatedCryptoAmount) return false;
    const asCrypto = Number(calculatedCryptoAmount);
    return Number.isFinite(asCrypto) && asCrypto > 0 && asCrypto < minWithdrawal;
  }, [minWithdrawal, calculatedCryptoAmount]);

  const canSubmit =
    isKycApproved &&
    !belowMinimum &&
    !!currency &&
    !!network &&
    !!toAddress.trim() &&
    !!displayAmount &&
    (!pinRequired || /^\d{4,6}$/.test(pin)) &&
    !submitting;

  const submit = async (): Promise<void> => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      // Wrapped so a fraud step-up prompts for a code and resubmits the
      // IDENTICAL request — the amount and destination cannot change between
      // the challenge and its clearance.
      const res = await run((headers) =>
        requestWithdrawal(
          {
            currency,
            network,
            amount: displayAmount, // Amount is now in display currency (e.g., EUR, GBP, INR)
            to_address: toAddress.trim(),
            ...(pinRequired ? { transaction_pin: pin } : {}),
          },
          headers
        )
      );
      if (res?.success && res.data) {
        setToAddress('');
        setDisplayAmount('');
        setPin('');
        void refresh();
      } else {
        toast.error(res?.message || t('acct.wallet.withdrawFailed'));
      }
    } catch (err: any) {
      // Closing the code prompt is a decision, not a failure — no error toast.
      if (isStepUpCancelled(err)) return;

      // Every KYC refusal — Level 2 missing, compliance hold, or a tier
      // upgrade — arrives with a `requiredLevel`, so one branch opens the
      // right step instead of three.
      // A risk lock placed after the screen opened: re-read the account so the gate shows.
      if (onRestricted(err)) return;

      const kycError = readKycError(err, t('acct.kyc.verificationRequired'));
      if (kycError) {
        // Held on screen rather than toasted alone: the toast fades and the
        // player is left looking at a form that refused them for no visible
        // reason. The gate explains it and offers the one route that fixes it.
        setKycRefusal({ code: kycError.code, message: kycError.message });
        void fetchKyc();
        return;
      }

      const errData = err?.response?.data ?? err;
      const message =
        errData?.message ||
        (typeof err === 'object' && err && 'message' in err
          ? String((err as { message: string }).message)
          : t('acct.wallet.withdrawFailed'));
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (eligible.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-400">
        {t('acct.wallet.noWithdrawCurrencies')}
      </div>
    );
  }

  if (withdrawLocked && restriction) {
    return <AccountReviewGate restriction={restriction} onChanged={refreshMe} />;
  }

  return (
    <div className="space-y-3">
      {/* Withdrawal Type Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          type="button"
          onClick={() => setWithdrawalType('crypto')}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            withdrawalType === 'crypto'
              ? 'text-slate-100 border-b-2 border-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Crypto
        </button>
        <button
          type="button"
          onClick={() => setWithdrawalType('local')}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            withdrawalType === 'local'
              ? 'text-slate-100 border-b-2 border-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Local Currency
        </button>
      </div>

      {withdrawalType === 'crypto' && (
        <>
          <p className="text-[11px] text-slate-400">
            {t('acct.wallet.withdrawIntro')}{' '}
            <span className="text-slate-200 font-semibold">
              {availableDisplay} {displayCurrency}
            </span>
          </p>

          {/* ── KYC gate ────────────────────────────────────────────────
              A hard gate replaces the form rather than sitting above it. The old
              banner left every field live behind a block nothing in the form could
              lift, so a player could pick a network, paste an address and type an
              amount before being told that none of it could be submitted. */}
          {kycLoading && isKycMandatory ? (
            /* Neither the form nor the gate until the profile is in. Rendering the
               form first and replacing it a moment later made an unverified player
               watch the thing they came for appear and then be taken away. */
            <div className="flex h-40 items-center justify-center rounded-xl border border-slate-700 text-xs text-slate-400">
              {t('acct.wallet.checkingKyc')}
            </div>
          ) : isHardGated ? (
            <>
              <KycGateNotice
                profile={kyc}
                action="withdraw"
                onLeave={onLeave}
                apiMessage={kycRefusal?.message}
                errorCode={kycRefusal?.code ?? (gatedByLevel ? 'TIER_UPGRADE_REQUIRED' : undefined)}
              />
              <p className="text-center text-[11px] text-slate-400 pt-1">
                {t('acct.wallet.withdrawHelp')}
              </p>
            </>
          ) : (
            <>
              {/* Above the form, not instead of it — see `softRefusal`. */}
              {softRefusal && (
                <KycGateNotice
                  profile={kyc}
                  action="withdraw"
                  onLeave={onLeave}
                  apiMessage={softRefusal.message}
                  errorCode={softRefusal.code}
                />
              )}

              <CurrencyPicker
                label={t('pref.currency')}
                currencies={eligible}
                value={currency}
                onChange={setCurrency}
              />

              {enabledNetworks.length > 0 ? (
                <NetworkPicker
                  label={t('acct.wallet.network')}
                  networks={enabledNetworks}
                  value={network}
                  onChange={setNetwork}
                />
              ) : (
                <div className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-[11px] text-slate-500">
                  {t('acct.wallet.noNetworkFor', { currency })}
                </div>
              )}

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {t('acct.wallet.addressLabel', { currency })}
                </label>
                <input
                  value={toAddress}
                  onChange={(e) => {
                    setToAddress(e.target.value);
                    clearRefusal();
                  }}
                  placeholder={t('acct.wallet.enterAddress')}
                  className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {pinRequired && (
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    {t('acct.pin.label')}
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder={t('acct.pin.placeholder')}
                    className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 tracking-[0.4em]"
                  />
                </div>
              )}

              {/* Amount Input - Display Currency + Crypto Amount */}
              <div className="space-y-3">
                {/* Two Column Layout: Display Currency = Crypto Amount */}
                <div className="flex items-end gap-2 sm:gap-3">
                  {/* Display Currency Amount Input */}
                  <div className="flex-1 space-y-2">
                    <label className="block text-[10px] text-slate-500">
                      Amount ({displayCurrency})
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={displayAmount}
                      onChange={(e) => handleDisplayChange(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-12 rounded-xl bg-slate-900 border border-slate-700 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 tabular-nums"
                    />
                  </div>

                  {/* Equals Sign - Centered in the middle */}
                  <span className="text-2xl sm:text-3xl text-slate-400 font-light pb-1">=</span>

                  {/* Crypto Amount Input (Read-only) */}
                  <div className="flex-1 space-y-2">
                    <label className="block text-[10px] text-slate-500">Amount ({currency})</label>
                    <input
                      type="text"
                      value={
                        loadingRate
                          ? 'Loading...'
                          : !displayAmount
                            ? '0.00'
                            : calculatedCryptoAmount || '—'
                      }
                      readOnly
                      className="w-full h-12 rounded-xl bg-slate-900 border border-slate-700 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none cursor-not-allowed tabular-nums"
                    />
                  </div>
                </div>

                {/* Quick percentage buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 75, 100].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPercent(p as 25 | 50 | 75 | 100)}
                      className="h-8 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-semibold hover:bg-slate-700 transition-colors"
                    >
                      {p === 100 ? t('acct.wallet.max') : `${p}%`}
                    </button>
                  ))}
                </div>

                {displayAmount && Number(displayAmount) > Number(availableDisplay) && (
                  <p className="mt-1 text-[11px] text-red-400">
                    {heldBack
                      ? t('acct.wallet.heldByRollover')
                      : t('acct.wallet.insufficient')}
                  </p>
                )}

                {belowMinimum && (
                  <p className="mt-1 text-[11px] text-red-400">
                    {t('acct.wallet.belowMinWithdrawal', {
                      amount: `${minWithdrawal} ${currency}`,
                    })}
                  </p>
                )}
              </div>

              {/* The only action on this screen now. The gate above owns the
              verification route, so there is no second button competing for it. */}
              <button
                type="button"
                onClick={() => void submit()}
                disabled={!canSubmit}
                className="w-full h-11 rounded-xl bg-white text-black text-sm font-semibold disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
              >
                {submitting ? t('acct.wallet.submitting') : t('acct.wallet.tabWithdraw')}
              </button>

              <p className="text-center text-[11px] text-slate-400 pt-1">
                {t('acct.wallet.withdrawHelp')}
              </p>
            </>
          )}
        </>
      )}

      {withdrawalType === 'local' && <LocalCurrencyWithdrawalTab onRestricted={onRestricted} />}
    </div>
  );
};

export default WithdrawTab;
