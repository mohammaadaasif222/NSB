import { useCallback, useEffect, useMemo, useState, type FC } from 'react';
import { toast } from 'react-toastify';

import { useWallet } from '@/context/WalletContext';
import { useCurrencyConversion } from '@/context/CurrencyConversionContext';
import { requestWithdrawal } from '@/services/wallet';
import { useSeonGuard } from '@/context/SeonGuardContext';
import { isStepUpCancelled } from '@/lib/seon-guard';
import kycApi from '@/services/kyc.api';
import type { PlayerKycProfile } from '@/types/kyc';
import { readKycError } from '@/utils/kyc-status';
import KycVerifyModal from '@/components/modals/profile/KycVerifyModal';
import { ShieldCheckIcon, AlertTriangleIcon } from '@/components/icons';
import type { Currency, WalletBalance } from '@/types';
import CurrencyPicker from '../shared/CurrencyPicker';
import NetworkPicker from '../shared/NetworkPicker';

/**
 * Withdraw tab with display currency model.
 *
 * Shows balance in user's active display currency.
 * Single input field for display currency amount (e.g., EUR, GBP, INR).
 * User enters amount in their display currency only.
 * Crypto amount is calculated at approval time using LIVE rates.
 */
const WithdrawTab: FC = () => {
  // Handles a fraud step-up: on a 428 it prompts for the one-time code and
  // resubmits this exact request.
  const { run } = useSeonGuard();
  const { summary, currencies, refresh } = useWallet();
  const { convertToDisplayCurrency } = useCurrencyConversion();

  const displayCurrency = summary?.preferences.active_currency ?? 'USD';

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

  /* ── Balance (USD-native unified model) ─────────────────────────── */

  const balanceRow: WalletBalance | null = useMemo(() => {
    if (!summary) return null;
    return summary.balance ?? null;
  }, [summary]);

  // Available balance in USD (only REAL balance, excluding bonus)
  const availableUSD = balanceRow?.real_amount ?? '0';

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
   * Which verification level the modal should open, or null when closed.
   *
   * A level rather than a boolean: a tier upgrade and a missing Level 2 both
   * open this modal, but they must present different steps.
   */
  const [kycModalTier, setKycModalTier] = useState<number | null>(null);

  const fetchKyc = useCallback(async () => {
    try {
      setKycLoading(true);
      const data = await kycApi.getKycMe();
      setKyc(data);
    } catch {
      setKyc(null);
    } finally {
      setKycLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchKyc();
  }, [fetchKyc]);

  const isKycMandatory = summary?.kyc_mandatory_for_withdrawal ?? true;
  const isKycApproved = !isKycMandatory || kyc?.status === 'APPROVED';

  /* ── Form state ────────────────────────────────────────────────── */

  const [toAddress, setToAddress] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Handle display amount input
  const handleDisplayChange = (value: string) => {
    const cleanValue = value.replace(/[^\d.]/g, '');
    setDisplayAmount(cleanValue);
  };

  const setPercent = (pct: 25 | 50 | 75 | 100): void => {
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

  const canSubmit =
    isKycApproved &&
    !!currency && !!network && !!toAddress.trim() && !!displayAmount &&
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
          },
          headers
        )
      );
      if (res?.success && res.data) {
        setToAddress('');
        setDisplayAmount('');
        void refresh();
      } else {
        toast.error(res?.message || 'Withdrawal failed');
      }
    } catch (err: any) {
      // Closing the code prompt is a decision, not a failure — no error toast.
      if (isStepUpCancelled(err)) return;

      // Every KYC refusal — Level 2 missing, compliance hold, or a tier
      // upgrade — arrives with a `requiredLevel`, so one branch opens the
      // right step instead of three.
      const kycError = readKycError(err);
      if (kycError) {
        setKycModalTier(kycError.requiredLevel);
        void fetchKyc();
        toast.error(kycError.message);
        return;
      }

      const errData = err?.response?.data ?? err;
      const message =
        errData?.message ||
        (typeof err === 'object' && err && 'message' in err
          ? String((err as { message: string }).message)
          : 'Withdrawal failed');
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (eligible.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-400">
        No currencies available for withdrawal yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-slate-400">
        Withdraw to any crypto wallet · Available to withdraw:{' '}
        <span className="text-slate-200 font-semibold">
          {availableDisplay} {displayCurrency}
        </span>
      </p>

      {/* ── KYC Compliance Notice ───────────────────────────────── */}
      {!kycLoading && isKycMandatory && !isKycApproved && (
        <div className="rounded-xl p-3 bg-amber-500/10 border border-amber-500/30 text-amber-200">
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5 shrink-0">
              <AlertTriangleIcon size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-white">Identity Verification Required</p>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                  {kyc?.status === 'REJECTED'
                    ? 'Rejected'
                    : kyc?.status === 'PENDING_REVIEW' || kyc?.status === 'IN_PROGRESS'
                      ? 'In Review'
                      : 'Unverified'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                {kyc?.status === 'PENDING_REVIEW' || kyc?.status === 'IN_PROGRESS'
                  ? 'Your verification documents are being reviewed. Withdrawals will unlock once approved.'
                  : kyc?.status === 'REJECTED'
                    ? 'Your identity documents need to be re-submitted before you can withdraw.'
                    : 'To comply with regulatory standards and protect your account, identity verification must be completed before requesting withdrawals.'}
              </p>
              <button
                type="button"
                onClick={() => setKycModalTier(2)}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
              >
                <ShieldCheckIcon size={13} />
                {kyc?.status === 'PENDING_REVIEW' || kyc?.status === 'IN_PROGRESS'
                  ? 'Check Verification'
                  : kyc?.status === 'REJECTED'
                    ? 'Retry Verification'
                    : 'Verify Identity Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      <CurrencyPicker
        label="Currency"
        currencies={eligible}
        value={currency}
        onChange={setCurrency}
      />

      {enabledNetworks.length > 0 ? (
        <NetworkPicker
          label="Network"
          networks={enabledNetworks}
          value={network}
          onChange={setNetwork}
        />
      ) : (
        <div className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-[11px] text-slate-500">
          No enabled network for {currency}.
        </div>
      )}

      <div>
        <label className="block text-[11px] text-slate-400 mb-1">{currency} Address</label>
        <input
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          placeholder="Enter Address"
          className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
        />
      </div>

      {/* Amount Input - Display Currency Only */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] text-slate-400">Withdrawal Amount</label>
          <div className="flex gap-3 items-center text-[11px]">
            <span className="text-slate-500">
              Balance: {availableDisplay} {displayCurrency}
            </span>
          </div>
        </div>

        {/* Display Currency Amount Input */}
        <div>
          <label className="block text-[10px] text-slate-500 mb-1">
            {displayCurrency} Amount
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={displayAmount}
            onChange={(e) => handleDisplayChange(e.target.value)}
            placeholder={`Enter ${displayCurrency} amount`}
            className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 tabular-nums"
          />
        </div>

        {/* Info Text */}
        <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-2.5">
          <p className="text-[10px] text-blue-200 leading-relaxed">
            ℹ️ Crypto amount will be calculated at approval based on live {currency} rates.
          </p>
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
              {p === 100 ? 'Max' : `${p}%`}
            </button>
          ))}
        </div>

        {displayAmount && Number(displayAmount) > Number(availableDisplay) && (
          <p className="mt-1 text-[11px] text-red-400">Insufficient balance</p>
        )}
      </div>

      {isKycApproved ? (
        <button
          type="button"
          onClick={() => void submit()}
          disabled={!canSubmit}
          className="w-full h-11 rounded-xl bg-white text-black text-sm font-semibold disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
        >
          {submitting ? 'Submitting…' : 'Withdraw'}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setKycModalTier(2)}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
        >
          <ShieldCheckIcon size={16} />
          Verify Identity to Enable Withdrawals
        </button>
      )}

      {kycModalTier !== null && (
        <KycVerifyModal
          tier={kycModalTier}
          onClose={() => {
            setKycModalTier(null);
            void fetchKyc();
          }}
          onSubmitted={() => {
            void fetchKyc();
          }}
        />
      )}

      <p className="text-center text-[11px] text-slate-400 pt-1">Need help with your Withdraw?</p>
    </div>
  );
};

export default WithdrawTab;
