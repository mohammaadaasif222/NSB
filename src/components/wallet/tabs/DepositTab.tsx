import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import { toast } from 'react-toastify';

import { useWallet } from '@/context/WalletContext';
import { useTranslation } from '@/context/I18nContext';
import { getDepositAddress } from '@/services/wallet';
import { useSeonGuard } from '@/context/SeonGuardContext';
import { isStepUpCancelled } from '@/lib/seon-guard';
import kycApi from '@/services/kyc.api';
import { readKycError } from '@/utils/kyc-status';
import { trackDepositAbandoned, trackDepositStart } from '@/utils/events';
import type { KycErrorCode, PlayerKycProfile } from '@/types/kyc';
import type { Currency, DepositAddress } from '@/types';
import CurrencyPicker from '../shared/CurrencyPicker';
import NetworkPicker from '../shared/NetworkPicker';
import AddressDisplay from '../shared/AddressDisplay';
import KycGateNotice from '../KycGateNotice';
import LocalCurrencyTab from './LocalCurrencyTab';
import SegmentedTabs from '@/components/player/SegmentedTabs';
import { WALLET_TRACK } from '@/components/wallet/shared/WalletTabBar';
import { WALLET_NOTE } from '../shared/WalletField';

type DepositType = 'crypto' | 'local';

/**
 * Deposit tab with crypto and fiat payment options.
 *
 * CRYPTO flow:
 *   1. Player picks currency (defaults to active).
 *   2. Player picks network if multiple available.
 *   3. Backend returns permanent deposit address.
 *   4. Show address + QR for player to send funds.
 *
 * FIAT flow (D24):
 *   1. Player picks fiat currency (USD, EUR, GBP, INR, BRL).
 *   2. Player picks payment method (WIRE, ACH, SEPA, etc).
 *   3. Backend returns D24 checkout URL.
 *   4. Frontend redirects to D24 for payment.
 *   5. D24 sends webhook → balance updates automatically.
 */
interface Props {
  /**
   * Closes the wallet dialog.
   *
   * Needed because the Level 1 refusal sends the player to the account area,
   * and the wallet is an overlay owned by PlayerTopBar — navigating without
   * closing it would leave it sitting on top of the verification page.
   */
  onLeave?: () => void;
}

const DepositTab: FC<Props> = ({ onLeave }) => {
  const { t } = useTranslation();
  const { run } = useSeonGuard();
  const { summary, currencies } = useWallet();
  const [depositType, setDepositType] = useState<DepositType>('crypto');

  // Only crypto currencies with deposits enabled show up in the picker.
  const eligible = useMemo(
    () =>
      currencies.filter(
        (c) => c.category === 'CRYPTO' && c.is_deposit_enabled && c.networks.length > 0
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

  // Reset network when currency changes if the previous network is not
  // valid for the new currency. Default to the first enabled network.
  useEffect(() => {
    if (!enabledNetworks.length) {
      setNetwork('');
      return;
    }
    if (!enabledNetworks.some((n) => n.code === network)) {
      setNetwork(enabledNetworks[0].code);
    }
  }, [enabledNetworks, network]);

  /* ── Address fetch ────────────────────────────────────────────── */

  const [address, setAddress] = useState<DepositAddress | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  // Set when the backend refuses to issue an address until Level 1 is done.
  // Held in state rather than shown as a toast alone: the tab would otherwise
  // sit empty with no explanation once the toast faded.
  const [kycBlock, setKycBlock] = useState<{
    message: string;
    level: number;
    code: KycErrorCode;
  } | null>(null);
  /**
   * Fetched only once a refusal has happened, so the gate can name the actual
   * reason — in review, held by compliance, rejected and why — instead of
   * repeating "verification needed" at a player who has already submitted.
   */
  const [kycProfile, setKycProfile] = useState<PlayerKycProfile | null>(null);

  /* ── Funnel tracking ──────────────────────────────────────────── */

  /*
   * Read by the unmount handler below, which runs with the values captured
   * when the effect was created. Refs give it what is true at the moment the
   * player actually leaves, rather than what was true when the tab opened.
   */
  const openedAt = useRef<number>(Date.now());
  const addressShown = useRef<boolean>(false);
  const latest = useRef<{ currency: string; network: string }>({ currency, network });

  latest.current = { currency, network };
  if (address !== null) addressShown.current = true;

  useEffect(() => {
    // Copied out of the ref here, per react-hooks/exhaustive-deps. It is set
    // once and never reassigned, so this is the same value either way — but
    // the rule cannot know that, and the other two refs below genuinely are
    // read at cleanup time on purpose: they must carry what was true when the
    // player left, not when the tab opened.
    const startedAt = openedAt.current;

    trackDepositStart();

    return () => {
      trackDepositAbandoned({
        address_shown: addressShown.current,
        seconds_on_screen: Math.round((Date.now() - startedAt) / 1000),
        currency: latest.current.currency || null,
        network: latest.current.network || null,
      });
    };
    // Once per mount. The deposit screen opening and closing is the event —
    // changing currency partway through is the same visit, not a new one.
  }, []);

  useEffect(() => {
    if (!currency || !network) {
      setAddress(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setKycBlock(null);
    run((headers) => getDepositAddress({ currency, network }, headers))
      .then((res) => {
        if (cancelled) return;
        if (res?.success && res.data) {
          setAddress(res.data);
        } else {
          toast.error(res?.message || t('acct.wallet.fetchAddressFailed'));
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // Closing the code prompt is a decision, not a failure.
        if (isStepUpCancelled(err)) return;

        // A deposit address is withheld until Level 1 is complete. That is a
        // step the player can take right now, so say so and offer it rather
        // than reporting it as a failure to fetch something.
        const kycError = readKycError(err, t('acct.kyc.verificationRequired'));
        if (kycError) {
          setAddress(null);
          setKycBlock({
            message: kycError.message,
            level: kycError.requiredLevel,
            code: kycError.code,
          });
          // Resolves to null for a player with no profile yet, which is the
          // common case here and exactly what the gate's default copy is for.
          void kycApi
            .getKycMe()
            .then((profile) => {
              if (!cancelled) setKycProfile(profile);
            })
            .catch(() => undefined);
          return;
        }

        const message =
          typeof err === 'object' && err && 'message' in err
            ? String((err as { message: string }).message)
            : t('acct.wallet.fetchAddressFailed');
        toast.error(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // `run` is stable (memoised in SeonGuardProvider), so listing it does not
    // re-fetch the address on every render.
    // No retry trigger any more: verification now happens on the account page,
    // which means the wallet has been closed and this tab unmounted. Reopening
    // it re-runs this effect and re-asks for the address.
    // `t` is left out on purpose: switching language must not re-request the address.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, network, run]);

  if (eligible.length === 0) {
    return (
      <div className="py-8 text-center text-[14px] leading-5 text-[#9da2b4]">
        {t('acct.wallet.noDepositCurrencies')}
      </div>
    );
  }

  return (
    <div>
      {/* The design's glass Crypto / Local currency switch. */}
      <SegmentedTabs
        items={[
          { key: 'crypto', label: t('acct.wallet.crypto') },
          { key: 'local', label: t('acct.wallet.localCurrency') },
        ]}
        active={depositType}
        onChange={setDepositType}
        label={t('acct.wallet.tabDeposit')}
        className={WALLET_TRACK}
      />

      {/* CRYPTO DEPOSIT FLOW — Currency, Network and the address, 14 apart. */}
      {depositType === 'crypto' && (
        <>
          <div className="mt-4 space-y-3.5">
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
              <p className={WALLET_NOTE}>{t('acct.wallet.noEnabledNetwork', { currency })}</p>
            )}

            {loading ? (
              <div className={`${WALLET_NOTE} flex h-64 items-center justify-center`}>
                {t('acct.wallet.loadingAddress')}
              </div>
            ) : kycBlock ? (
              <KycGateNotice
                profile={kycProfile}
                action="deposit"
                onLeave={onLeave}
                apiMessage={kycBlock.message}
                errorCode={kycBlock.code}
              />
            ) : address ? (
              <AddressDisplay address={address} />
            ) : null}
          </div>

          <p className="mt-[22px] text-center text-[16px] font-medium leading-6 text-[#f0f1f5]">
            {t('acct.wallet.depositHelp')}
          </p>
        </>
      )}

      {/* FIAT DEPOSIT FLOW (D24) */}
      {depositType === 'local' && (
        <div className="mt-4">
          <LocalCurrencyTab />
        </div>
      )}
    </div>
  );
};

export default DepositTab;
