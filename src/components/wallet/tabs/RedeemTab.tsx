import { useRef, useState, type FC, type FormEvent } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/context/I18nContext';
import { useBonuses } from '@/hooks/useBonuses';
import { WALLET_INPUT, WALLET_PILL } from '../shared/WalletField';

/**
 * Redeem a promotional or gift card code, as the design draws it: the heading
 * and what a code does, the code, Redeem Code, and the terms it is redeemed
 * under.
 *
 * A code is a coupon on the bonuses API — the same claim the bonuses page
 * makes, toasts and wallet refresh included (useBonuses).
 */
const RedeemTab: FC = () => {
  const { t } = useTranslation();
  const { claim, busyId } = useBonuses();
  const [code, setCode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const couponCode = code.trim().toUpperCase();
  // The link sits wherever each language puts it in the sentence.
  const [termsBefore, termsAfter = ''] = t('acct.wallet.redeemTerms').split('{terms}');

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    // The button stays live, as drawn; without a code it points at the field.
    if (!couponCode) {
      inputRef.current?.focus();
      return;
    }
    if (await claim({ couponCode })) setCode('');
  };

  return (
    <form onSubmit={submit} noValidate className="text-center">
      <h3 className="text-[22px] font-semibold leading-8 text-[#f0f1f5] sm:text-[28px] sm:leading-9">
        {t('acct.wallet.redeemTitle')}
      </h3>
      <p className="mx-auto mt-3 max-w-[386px] text-[14px] leading-5 text-[#9da2b4]">
        {t('acct.wallet.redeemBody')}
      </p>

      <div className={`${WALLET_PILL} mt-8`}>
        <input
          ref={inputRef}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder={t('acct.wallet.redeemCode')}
          aria-label={t('acct.wallet.redeemCode')}
          autoComplete="off"
          spellCheck={false}
          className={`${WALLET_INPUT} text-start tracking-wide`}
        />
      </div>

      <Button
        type="submit"
        fullWidth
        loading={busyId !== null && busyId === couponCode}
        className="mt-7"
      >
        {t('acct.wallet.redeemSubmit')}
      </Button>

      <p className="mx-auto mt-7 max-w-[440px] text-[14px] leading-5 text-[#9da2b4]">
        {termsBefore}
        <Link
          href="/terms-of-service"
          className="underline-offset-2 hover:text-[#f0f1f5] hover:underline"
        >
          {t('acct.wallet.redeemTermsLink')}
        </Link>
        {termsAfter}
      </p>
    </form>
  );
};

export default RedeemTab;
