import { useState, type FC } from 'react';
import { toast } from 'react-toastify';
import type { DepositAddress } from '@/types';
import { useTranslation } from '@/context/I18nContext';

/**
 * QR rendering is delegated to `api.qrserver.com` — a free image endpoint
 * that takes the payload as a query string and returns a PNG. Keeps the
 * bundle small (no local QR generation lib) at the cost of one network
 * request per address. The URL is stable and the response is cache-
 * friendly, so a re-open of the same address costs nothing after first
 * paint.
 */
const qrUrl = (payload: string, size = 220): string =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    payload
  )}&bgcolor=ffffff&color=000000&margin=2`;

interface Props {
  address: DepositAddress;
}

const AddressDisplay: FC<Props> = ({ address }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(address.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      toast.success(t('acct.wallet.addressCopied'));
    } catch {
      toast.error(t('acct.wallet.copyFailed'));
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-[11px] text-slate-400">
        {t('acct.wallet.addressLabel', {
          currency:
            address.network_code !== address.currency_code
              ? `${address.currency_code} (${address.network_code})`
              : address.currency_code,
        })}
      </label>

      <button
        type="button"
        onClick={() => void copy()}
        title={t('acct.wallet.clickToCopy')}
        className="group w-full min-h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-left text-xs text-slate-100 font-mono break-all hover:border-slate-600 transition-colors"
      >
        {address.address}
        <span className="block text-[10px] text-slate-500 group-hover:text-blue-400 mt-1">
          {copied ? `${t('ref.copied')} ✓` : t('acct.wallet.tapToCopy')}
        </span>
      </button>

      {address.tag && (
        <div className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
          {t('acct.wallet.includeTag')}{' '}
          <span className="font-mono font-semibold">{address.tag}</span>
        </div>
      )}

      {/*
       * The single most expensive mistake a player can make: sending a
       * different currency, or a different network's version of this
       * currency, to this address. CoinsPaid's model gives one address per
       * (currency, network), so a USDT-on-Solana address will NOT credit
       * a SOL or a USDC-on-Solana deposit. Spell the constraint out
       * before the QR is scanned, not after the funds are lost.
       */}
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-200 leading-snug">
        <span className="font-semibold text-red-100">
          ⚠{' '}
          {t('acct.wallet.sendOnly', {
            currency: address.currency_code,
            network: address.network_name,
          })}
        </span>{' '}
        {t('acct.wallet.wrongNetworkWarning')}
      </div>

      <div className="mt-2 flex justify-center">
        <div className="p-2 bg-white rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrUrl(address.qr_payload)}
            alt={t('acct.wallet.qrAlt', { currency: address.currency_code })}
            width={220}
            height={220}
            className="block w-56 h-56"
          />
        </div>
      </div>

      <p className="text-center text-[11px] text-slate-500 pt-1">
        {t('acct.wallet.minDeposit', {
          amount: `${address.min_deposit} ${address.currency_code}`,
        })}{' '}
        • {t('acct.wallet.confirmations', { count: address.deposit_confirmations })}
      </p>
    </div>
  );
};

export default AddressDisplay;
