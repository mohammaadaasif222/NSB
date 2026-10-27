import { useEffect, useMemo, useRef, useState, type FC, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/context/I18nContext';
import { useWallet } from '@/context/WalletContext';
import { useMe } from '@/context/UserContext';
import AccountReviewGate from '@/components/risk/AccountReviewGate';
import WalletField, { WALLET_INPUT, WALLET_PILL } from '../shared/WalletField';
import WalletSelect from '../shared/WalletSelect';
import { currencySign } from '../shared/currencySign';
import api from '@/services/api';
import { getPinStatus } from '@/services/transactionPin';

/**
 * Tip another player: the amount large across the top, the wallet it comes
 * out of, the player's username, and Send Tip — as the design draws it.
 *
 * The transaction PIN is asked for once the player has set one, as on
 * withdrawals.
 */
const TipTab: FC<{ onLeave?: () => void }> = ({ onLeave }) => {
  const { t, locale } = useTranslation();
  const { summary, currencies } = useWallet();
  const { me, refresh: refreshMe } = useMe();
  // Shown once a tip is refused for a lock, with the step that lifts it.
  const [restricted, setRestricted] = useState(false);
  const restriction = me?.account_restriction;

  // The amount is in the player's fiat, as the design's "$0.00 … USD": their
  // display currency when that is a fiat, dollars otherwise.
  const display = summary?.balance?.display_currency;
  const fiat = currencies.some((c) => c.code === display && c.category === 'FIAT')
    ? (display as string)
    : 'USD';
  const sign = useMemo(() => currencySign(fiat, locale), [fiat, locale]);
  const wallet = summary?.balance?.currency ?? fiat;

  const [amount, setAmount] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [pinRequired, setPinRequired] = useState(false);
  const [pin, setPin] = useState('');
  const amountRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const pinRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void getPinStatus()
      .then((s) => setPinRequired(!!s?.enabled))
      .catch(() => undefined);
  }, []);

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!(Number.parseFloat(amount) > 0)) {
      amountRef.current?.focus();
      return;
    }
    if (!username.trim()) {
      usernameRef.current?.focus();
      return;
    }
    if (pinRequired && !/^\d{4,6}$/.test(pin)) {
      pinRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      await api.post('/tips/send', {
        recipient_username: username.trim(),
        amount: Number.parseFloat(amount),
        ...(pinRequired ? { transaction_pin: pin } : {}),
      });
      toast.success(t('acct.wallet.tipSent'));
      setAmount('');
      setUsername('');
      setPin('');
    } catch (error: any) {
      if (error?.errors?.code === 'ACCOUNT_RESTRICTED') {
        setRestricted(true);
        void refreshMe();
        return;
      }
      const message = error?.message || t('acct.wallet.tipFailed');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (restricted && restriction?.blocked_actions.includes('TIP')) {
    return <AccountReviewGate restriction={restriction} onChanged={refreshMe} onLeave={onLeave} />;
  }

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
        <WalletField htmlFor="tip-wallet" label={t('profile.wallet')}>
          <WalletSelect
            id="tip-wallet"
            options={[{ value: wallet, label: wallet }]}
            value={wallet}
            onChange={() => undefined}
            placeholder={wallet}
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

        {pinRequired && (
          <WalletField htmlFor="tip-pin" label={t('acct.pin.label')}>
            <div className={WALLET_PILL}>
              <input
                ref={pinRef}
                id="tip-pin"
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
      </div>

      <Button type="submit" fullWidth className="mt-[25px]" disabled={loading}>
        {loading ? t('common.sending') : t('acct.wallet.sendTip')}
      </Button>
    </form>
  );
};

export default TipTab;
