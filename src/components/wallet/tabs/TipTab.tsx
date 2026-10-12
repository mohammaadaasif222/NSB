import { useMemo, useRef, useState, type FC, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/context/I18nContext';
import { useWallet } from '@/context/WalletContext';
import WalletField, { WALLET_INPUT, WALLET_PILL } from '../shared/WalletField';
import WalletSelect from '../shared/WalletSelect';

/** The display currency's own sign — "$" for USD, "€" for EUR. */
const currencySign = (code: string, locale: string): string => {
  try {
    return (
      new Intl.NumberFormat(locale, { style: 'currency', currency: code })
        .formatToParts(0)
        .find((p) => p.type === 'currency')?.value ?? code
    );
  } catch {
    return code;
  }
};

/**
 * Tip another player: the amount large across the top, the wallet it comes
 * out of, the player's username, and Send Tip — as the design draws it.
 *
 * There is no tipping endpoint yet, so sending says so rather than pretending
 * to have sent. The form is complete; wiring it is the submit handler alone.
 */
const TipTab: FC = () => {
  const { t, locale } = useTranslation();
  const { summary, currencies } = useWallet();

  // The amount is in the player's fiat, as the design's "$0.00 … USD": their
  // display currency when that is a fiat, dollars otherwise.
  const display = summary?.balance?.display_currency;
  const fiat = currencies.some((c) => c.code === display && c.category === 'FIAT')
    ? (display as string)
    : 'USD';
  const sign = useMemo(() => currencySign(fiat, locale), [fiat, locale]);

  // The player's own wallet first, then every crypto the catalogue lists.
  const active = summary?.preferences.active_currency ?? '';
  const options = useMemo(() => {
    const crypto = currencies.filter((c) => c.category === 'CRYPTO');
    const codes = [...new Set([active, ...crypto.map((c) => c.code)].filter(Boolean))];
    return codes.map((code) => ({
      value: code,
      label: code,
      detail: currencies.find((c) => c.code === code)?.name,
    }));
  }, [active, currencies]);
  const [picked, setPicked] = useState('');
  const wallet = picked || active;

  const [amount, setAmount] = useState('');
  const [username, setUsername] = useState('');
  const amountRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);

  // The button stays live, as drawn; an incomplete form sends the player to
  // what is missing instead.
  const submit = (e: FormEvent): void => {
    e.preventDefault();
    if (!(Number.parseFloat(amount) > 0)) {
      amountRef.current?.focus();
      return;
    }
    if (!username.trim()) {
      usernameRef.current?.focus();
      return;
    }
    toast.info(t('acct.wallet.tipUnavailable'));
  };

  return (
    <form onSubmit={submit} noValidate>
      {/* The amount, typed in place: the design's 44px "$0.00". */}
      <label className="mt-4 flex items-center justify-center text-[36px] font-semibold leading-[44px] text-[#f0f1f5] sm:text-[44px] sm:leading-[52px]">
        <span aria-hidden="true">{sign}</span>
        <input
          ref={amountRef}
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
          inputMode="decimal"
          placeholder="0.00"
          aria-label={t('acct.wallet.tipAmount')}
          // Sized to what is typed, so the sign sits against the figure.
          size={Math.max(amount.length, 4)}
          className="h-11 min-w-0 max-w-full bg-transparent outline-none [field-sizing:content] sm:h-13 placeholder:text-[#f0f1f5]"
        />
      </label>

      <div className="mt-4 space-y-3.5">
        <WalletField htmlFor="tip-wallet" label={t('acct.wallet.tipWallet')}>
          <WalletSelect
            id="tip-wallet"
            options={options}
            value={wallet}
            onChange={setPicked}
            placeholder={t('acct.wallet.selectCurrency')}
            trailing={fiat}
          />
        </WalletField>

        <WalletField htmlFor="tip-username" label={t('acct.wallet.tipTo')}>
          <div className={WALLET_PILL}>
            <input
              ref={usernameRef}
              id="tip-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('acct.wallet.tipUsername')}
              autoComplete="off"
              spellCheck={false}
              className={WALLET_INPUT}
            />
          </div>
        </WalletField>
      </div>

      <Button type="submit" fullWidth className="mt-[25px]">
        {t('acct.wallet.sendTip')}
      </Button>
    </form>
  );
};

export default TipTab;
