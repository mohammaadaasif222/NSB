import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import { toast } from 'react-toastify';

import { useWallet } from '@/context/WalletContext';
import { getDepositAddress } from '@/services/wallet';
import { trackDepositAbandoned, trackDepositStart } from '@/utils/events';
import type { Currency, DepositAddress } from '@/types';
import CurrencyPicker from '../shared/CurrencyPicker';
import NetworkPicker from '../shared/NetworkPicker';
import AddressDisplay from '../shared/AddressDisplay';

/**
 * Deposit tab.
 *
 * Flow:
 *   1. Player picks currency  (defaults to the wallet's active currency).
 *   2. If the currency has more than one network, player picks a network.
 *   3. Backend returns the permanent deposit address (created lazily on
 *      first call). We show the address + QR + copy button.
 *
 * The address is FROZEN in state once fetched — a re-render for a poll
 * refresh must not blank the QR while the player is scanning it. Only a
 * currency/network change re-fetches.
 */
const DepositTab: FC = () => {
  const { summary, currencies } = useWallet();

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
    getDepositAddress({ currency, network })
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
  }, [currency, network]);

  if (eligible.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-400">
        No currencies available for deposit yet. Ask an operator to sync the catalogue.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Segmented crypto / local currency toggle — mirrors the design.
          Only "Crypto" is wired today; fiat on-ramp lands with the buy tab. */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900 rounded-xl">
        <button
          type="button"
          className="h-8 rounded-lg bg-black/60 text-white text-xs font-semibold"
        >
          Crypto
        </button>
        <button
          type="button"
          disabled
          className="h-8 rounded-lg text-slate-500 text-xs font-semibold cursor-not-allowed"
        >
          Local currency
        </button>
      </div>

      <CurrencyPicker
        label="Currency"
        currencies={eligible}
        value={currency}
        onChange={setCurrency}
      />

      {/*
       * Always render the network picker, even when a currency happens to
       * have only one enabled network today. Stablecoins live on multiple
       * chains (USDT on TRC20/ERC20/BEP20, USDC on ERC20/SOL/BSC…) — a
       * disappearing dropdown makes the player think there's no choice,
       * and adding a second network later would silently change the UI
       * shape.
       *
       * When the list is empty (a currency the operator disabled every
       * network on) show a placeholder rather than nothing, so the reason
       * a deposit can't proceed is visible.
       */}
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
      ) : address ? (
        <AddressDisplay address={address} />
      ) : null}

      <p className="text-center text-[11px] text-slate-400 pt-2">Need help with your deposit?</p>
    </div>
  );
};

export default DepositTab;
