import type { FC } from 'react';
import { toast } from 'react-toastify';
import type { DepositAddress } from '@/types';
import { useTranslation } from '@/context/I18nContext';
import WalletField, { WALLET_PILL, WALLET_VALUE } from './WalletField';

/**
 * QR rendering is delegated to `api.qrserver.com` — a free image endpoint
 * that takes the payload as a query string and returns a PNG. Keeps the
 * bundle small (no local QR generation lib) at the cost of one network
 * request per address. The URL is stable and the response is cache-
 * friendly, so a re-open of the same address costs nothing after first
 * paint.
 */
const qrUrl = (payload: string, size = 360): string =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    payload
  )}&bgcolor=ffffff&color=000000&margin=0`;

interface Props {
  address: DepositAddress;
}

/**
 * Where to send a deposit, as the design draws it: the address in the form's
 * glass pill (a click copies it), the 197px QR on its white card 18 below,
 * and under it, in two centred lines, what may be sent there and the minimum.
 */
const AddressDisplay: FC<Props> = ({ address }) => {
  const { t } = useTranslation();

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(address.address);
      toast.success(t('acct.wallet.addressCopied'));
    } catch {
      toast.error(t('acct.wallet.copyFailed'));
    }
  };

  return (
    <div>
      <WalletField
        htmlFor="wallet-address"
        label={t('acct.wallet.addressLabel', {
          currency:
            address.network_code !== address.currency_code
              ? `${address.currency_code} (${address.network_code})`
              : address.currency_code,
        })}
      >
        <button
          id="wallet-address"
          type="button"
          onClick={() => void copy()}
          title={t('acct.wallet.clickToCopy')}
          className={`${WALLET_PILL} w-full text-start transition-colors hover:border-white/30`}
        >
          <span className={`min-w-0 flex-1 truncate ${WALLET_VALUE}`}>{address.address}</span>
        </button>
      </WalletField>

      {address.tag && (
        <p className="mt-3 rounded-[20px] border border-[#ffe779]/30 bg-[#ffe779]/10 px-4 py-2.5 text-[14px] leading-5 text-[#ffe779]">
          {t('acct.wallet.includeTag')}{' '}
          <span className="font-mono font-semibold">{address.tag}</span>
        </p>
      )}

      {/* The design's 197px white card, the code inset 5% each side. */}
      <div className="mx-auto mt-[18px] w-[197px] rounded-[20px] bg-white p-[10px]">
        <img
          src={qrUrl(address.qr_payload)}
          alt={t('acct.wallet.qrAlt', { currency: address.currency_code })}
          width={177}
          height={177}
          className="block h-[177px] w-[177px]"
        />
      </div>

      {/*
       * The single most expensive mistake a player can make: sending a
       * different currency, or a different network's version of this
       * currency, to this address. One address per (currency, network), so
       * the constraint is spelled out before the QR is scanned.
       */}
      <p className="mx-auto mt-2 max-w-[400px] text-center text-[14px] leading-5 text-[#f0f1f5]">
        {t('acct.wallet.sendOnly', {
          currency: address.currency_code,
          network: address.network_name,
        })}
        <br />
        {t('acct.wallet.minDeposit', {
          amount: `${address.min_deposit} ${address.currency_code}`,
        })}{' '}
        · {t('acct.wallet.confirmations', { count: address.deposit_confirmations })}
      </p>
    </div>
  );
};

export default AddressDisplay;
