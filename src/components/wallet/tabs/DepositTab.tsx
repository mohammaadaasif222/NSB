import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

import { useWallet } from '@/context/WalletContext';
import { getDepositAddress } from '@/services/wallet';
import { useSeonGuard } from '@/context/SeonGuardContext';
import { isStepUpCancelled } from '@/lib/seon-guard';
import { readKycError } from '@/utils/kyc-status';
import { trackDepositAbandoned, trackDepositStart } from '@/utils/events';
import type { Currency, DepositAddress } from '@/types';
import CurrencyPicker from '../shared/CurrencyPicker';
import NetworkPicker from '../shared/NetworkPicker';
import AddressDisplay from '../shared/AddressDisplay';
import KycVerifyModal from '@/components/modals/profile/KycVerifyModal';
import LocalCurrencyTab from './LocalCurrencyTab';

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
  const router = useRouter();
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
  const [kycBlock, setKycBlock] = useState<{ message: string; level: number } | null>(null);
  const [kycModalTier, setKycModalTier] = useState<number | null>(null);
  // Bumped to re-run the address fetch once verification has been attempted.
  const [retry, setRetry] = useState(0);

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
          toast.error(res?.message || 'Could not fetch deposit address');
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // Closing the code prompt is a decision, not a failure.
        if (isStepUpCancelled(err)) return;

        // A deposit address is withheld until Level 1 is complete. That is a
        // step the player can take right now, so say so and offer it rather
        // than reporting it as a failure to fetch something.
        const kycError = readKycError(err);
        if (kycError) {
          setAddress(null);
          setKycBlock({ message: kycError.message, level: kycError.requiredLevel });
          return;
        }

        const message =
          typeof err === 'object' && err && 'message' in err
            ? String((err as { message: string }).message)
            : 'Could not fetch deposit address';
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
  }, [currency, network, run, retry]);

  if (eligible.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-400">
        No currencies available for deposit yet. Ask an operator to sync the catalogue.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Segmented crypto / local currency toggle */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900 rounded-xl">
        <button
          type="button"
          onClick={() => setDepositType('crypto')}
          className={`h-8 rounded-lg text-xs font-semibold transition-all ${
            depositType === 'crypto'
              ? 'bg-black/60 text-white'
              : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          Crypto
        </button>
        <button
          type="button"
          onClick={() => setDepositType('local')}
          className={`h-8 rounded-lg text-xs font-semibold transition-all ${
            depositType === 'local'
              ? 'bg-black/60 text-white'
              : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          Local currency
        </button>
      </div>

      {/* CRYPTO DEPOSIT FLOW */}
      {depositType === 'crypto' && (
        <>
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
              No enabled network for {currency} — ask an operator to enable one.
            </div>
          )}

          {loading ? (
            <div className="h-64 rounded-xl border border-slate-700 flex items-center justify-center text-xs text-slate-400">
              Loading address…
            </div>
      ) : kycBlock ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
          {/* Named as the level, because that is what the account area calls
              it: a player sent to "complete verification" and shown a page
              headed "Level 1 — Personal Information" has to work out for
              themselves that those are the same thing. The gate asks only for
              a name, a date of birth and an address; the passport and selfie
              are Level 2 and are not being requested here. */}
          <p className="text-xs font-semibold text-amber-300">
            {kycBlock.level === 1
              ? 'Level 1 verification pending'
              : 'Verification needed first'}
          </p>
          <p className="text-[11px] leading-relaxed text-slate-300">{kycBlock.message}</p>
          <button
            type="button"
            onClick={() => {
              if (kycBlock.level !== 1) {
                setKycModalTier(kycBlock.level);
                return;
              }
              // Closed first, then navigated: the wallet is an overlay that
              // outlives a route change, so the other order lands the player
              // on the verification page with the dialog still covering it.
              onLeave?.();
              void router.push('/profile?section=verification');
            }}
            className="w-full h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs font-semibold text-amber-200 hover:bg-amber-500/25 transition-colors"
          >
            {kycBlock.level === 1 ? 'Complete Level 1' : 'Complete verification'}
          </button>
        </div>
          ) : address ? (
            <AddressDisplay address={address} />
          ) : null}

          <p className="text-center text-[11px] text-slate-400 pt-2">Need help with your deposit?</p>

      {kycModalTier !== null && (
        <KycVerifyModal
          tier={kycModalTier}
          onClose={() => {
            setKycModalTier(null);
            // Completing Level 1 is exactly what unblocks this, so re-ask for
            // the address instead of leaving the refusal on screen.
            setRetry((n) => n + 1);
          }}
          onSubmitted={() => setRetry((n) => n + 1)}
        />
      )}
        </>
      )}

      {/* FIAT DEPOSIT FLOW (D24) */}
      {depositType === 'local' && <LocalCurrencyTab />}
    </div>
  );
};

export default DepositTab;
