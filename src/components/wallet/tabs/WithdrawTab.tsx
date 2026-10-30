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
import Button from '@/components/ui/Button';
import SegmentedTabs from '@/components/player/SegmentedTabs';
import { WALLET_TRACK } from '@/components/wallet/shared/WalletTabBar';
import WalletField, {
  WALLET_ERROR,
  WALLET_INPUT,
  WALLET_NOTE,
  WALLET_PILL,
  WALLET_VALUE,
} from '../shared/WalletField';
import { currencySign } from '../shared/currencySign';

/** The amount as typed: 18px bold; the "0.00" before it, 16px grey. */
const AMOUNT_INPUT = `${WALLET_INPUT} tabular-nums placeholder:text-[16px] placeholder:font-normal placeholder:text-[#9da2b4]`;

/** "Need help…", centred under the button. */
const HELP = 'mt-[26px] text-center text-[16px] font-medium leading-6 text-[#f0f1f5] sm:mt-3.5';

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
  const { t, locale } = useTranslation();
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
  /** A KYC refusal from the local-currency form, shown as the same gate as crypto. */
  const onKycRefused = (err: unknown): boolean => {
    const kycError = readKycError(err, t('acct.kyc.verificationRequired'));
    if (!kycError) return false;
    setKycRefusal({ code: kycError.code, message: kycError.message });
    void fetchKyc();
    return true;
  };

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
      <div className="py-8 text-center text-[14px] leading-5 text-[#9da2b4]">
        {t('acct.wallet.noWithdrawCurrencies')}
      </div>
    );
  }

  if (withdrawLocked && restriction) {
    return <AccountReviewGate restriction={restriction} onChanged={refreshMe} onLeave={onLeave} />;
  }

  return (
    <div>
      {/* The design's glass Crypto / Local currency switch. */}
      <SegmentedTabs
        items={[
          { key: 'crypto', label: t('acct.wallet.crypto') },
          { key: 'local', label: t('acct.wallet.localCurrency') },
        ]}
        active={withdrawalType}
        onChange={setWithdrawalType}
        label={t('acct.wallet.tabWithdraw')}
        className={WALLET_TRACK}
      />

      {/* Where it goes, and how much can go — over either form. */}
      <p className="mt-5 text-center text-[12px] leading-6 text-[#9da2b4] sm:mt-7 sm:text-[16px]">
        {withdrawalType === 'crypto'
          ? t('acct.wallet.withdrawIntro')
          : t('acct.local.withdrawIntroBank')}{' '}
        <span className="font-medium text-[#f0f1f5]">
          {availableDisplay} {displayCurrency}
        </span>
      </p>

      {withdrawalType === 'crypto' && (
        <>

          {/* ── KYC gate ────────────────────────────────────────────────
              A hard gate replaces the form rather than sitting above it. The old
              banner left every field live behind a block nothing in the form could
              lift, so a player could pick a network, paste an address and type an
              amount before being told that none of it could be submitted. */}
          {kycLoading && isKycMandatory ? (
            /* Neither the form nor the gate until the profile is in. Rendering the
               form first and replacing it a moment later made an unverified player
               watch the thing they came for appear and then be taken away. */
            <div className={`${WALLET_NOTE} mt-[26px] flex h-40 items-center justify-center`}>
              {t('acct.wallet.checkingKyc')}
            </div>
          ) : isHardGated ? (
            <div className="mt-[26px]">
              <KycGateNotice
                profile={kyc}
                action="withdraw"
                onLeave={onLeave}
                apiMessage={kycRefusal?.message}
                errorCode={kycRefusal?.code ?? (gatedByLevel ? 'TIER_UPGRADE_REQUIRED' : undefined)}
              />
              <p className={HELP}>{t('acct.wallet.withdrawHelp')}</p>
            </div>
          ) : (
            <>
              {/* The design's rows, 14 apart: Currency, Network, the address,
                  then the amount. */}
              <div className="mt-[22px] space-y-3.5 sm:mt-[26px]">
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
                  <p className={WALLET_NOTE}>{t('acct.wallet.noNetworkFor', { currency })}</p>
                )}

                <WalletField
                  htmlFor="withdraw-address"
                  label={t('acct.wallet.addressLabel', { currency })}
                >
                  <div className={WALLET_PILL}>
                    <input
                      id="withdraw-address"
                      value={toAddress}
                      onChange={(e) => {
                        setToAddress(e.target.value);
                        clearRefusal();
                      }}
                      placeholder={t('acct.wallet.enterAddress')}
                      autoComplete="off"
                      spellCheck={false}
                      className={WALLET_INPUT}
                    />
                  </div>
                </WalletField>

                {pinRequired && (
                  <WalletField htmlFor="withdraw-pin" label={t('acct.pin.label')}>
                    <div className={WALLET_PILL}>
                      <input
                        id="withdraw-pin"
                        type="password"
                        inputMode="numeric"
                        autoComplete="off"
                        maxLength={6}
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder={t('acct.pin.placeholder')}
                        className={`${WALLET_INPUT} tracking-[0.4em]`}
                      />
                    </div>
                  </WalletField>
                )}

                {/* The amount in the display currency = the coin it buys. Side
                    by side with the shortcuts under both on desktop; a phone
                    stacks them — the amount, the shortcuts, then the coin. */}
                <div className="grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-end sm:gap-x-1.5">
                  <WalletField
                    htmlFor="withdraw-amount"
                    label={t('acct.wallet.amountIn', { currency: displayCurrency })}
                  >
                    <div className={WALLET_PILL}>
                      <input
                        id="withdraw-amount"
                        type="text"
                        inputMode="decimal"
                        value={displayAmount}
                        onChange={(e) => handleDisplayChange(e.target.value)}
                        placeholder="0.00"
                        className={AMOUNT_INPUT}
                      />
                      <span
                        aria-hidden="true"
                        className="shrink-0 text-[18px] font-bold leading-6 text-[#9da2b4]"
                      >
                        {currencySign(displayCurrency, locale)}
                      </span>
                    </div>
                  </WalletField>

                  <span
                    aria-hidden="true"
                    className="hidden h-14 items-center text-[16px] leading-6 text-[#9da2b4] sm:order-2 sm:flex"
                  >
                    =
                  </span>

                  <div className="order-3 mt-[18px] sm:mt-0">
                    <WalletField label={t('acct.wallet.amountIn', { currency })}>
                      <div className={WALLET_PILL} aria-live="polite">
                        <span
                          className={`min-w-0 flex-1 truncate tabular-nums ${
                            displayAmount && calculatedCryptoAmount && !loadingRate
                              ? WALLET_VALUE
                              : 'text-[16px] leading-6 text-[#9da2b4]'
                          }`}
                        >
                          {loadingRate
                            ? t('common.loading')
                            : !displayAmount
                              ? '0.00'
                              : calculatedCryptoAmount || '—'}
                        </span>
                      </div>
                    </WalletField>
                  </div>

                  {/* The design's quick shares of the balance. */}
                  <div className="order-2 mt-[9px] flex gap-2.5 sm:order-4 sm:col-span-3 sm:gap-1.5">
                    {([25, 50, 75, 100] as const).map((p) => (
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
                </div>

                {displayAmount && Number(displayAmount) > Number(availableDisplay) && (
                  <p className={WALLET_ERROR}>
                    {heldBack ? t('acct.wallet.heldByRollover') : t('acct.wallet.insufficient')}
                  </p>
                )}

                {belowMinimum && (
                  <p className={WALLET_ERROR}>
                    {t('acct.wallet.belowMinWithdrawal', {
                      amount: `${minWithdrawal} ${currency}`,
                    })}
                  </p>
                )}
              </div>

              {/* The only action on this screen now. The gate above owns the
              verification route, so there is no second button competing for it. */}
              <Button
                type="button"
                fullWidth
                onClick={() => void submit()}
                disabled={!canSubmit}
                className="mt-[22px] sm:mt-[23px]"
              >
                {submitting ? t('acct.wallet.submitting') : t('acct.wallet.tabWithdraw')}
              </Button>

              <p className={HELP}>{t('acct.wallet.withdrawHelp')}</p>
            </>
          )}
        </>
      )}

      {withdrawalType === 'local' && (
        <div className="mt-[22px] sm:mt-[26px]">
          {isHardGated ? (
          <KycGateNotice
            profile={kyc}
            action="withdraw"
            onLeave={onLeave}
            apiMessage={kycRefusal?.message}
            errorCode={kycRefusal?.code ?? (gatedByLevel ? 'TIER_UPGRADE_REQUIRED' : undefined)}
          />
        ) : (
          <>
            {softRefusal && (
              <KycGateNotice
                profile={kyc}
                action="withdraw"
                onLeave={onLeave}
                apiMessage={softRefusal.message}
                errorCode={softRefusal.code}
              />
            )}
            <LocalCurrencyWithdrawalTab
              onRestricted={onRestricted}
              onKycRefused={onKycRefused}
              available={{ amount: String(availableDisplay), currency: displayCurrency }}
            />
            <p className={HELP}>{t('acct.wallet.withdrawHelp')}</p>
          </>
          )}
        </div>
      )}
    </div>
  );
};

export default WithdrawTab;
