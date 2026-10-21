import type { FC } from 'react';
import type { Currency } from '@/types';
import { useTranslation } from '@/context/I18nContext';
import WalletField from './WalletField';
import WalletSelect from './WalletSelect';

interface Props {
  label: string;
  currencies: Currency[];
  value: string;
  onChange: (code: string) => void;
}

/**
 * The deposit and withdraw forms' Currency row, as the design draws it: the
 * 14px label over the glass pill with the code in 18px bold and the chevron;
 * the list names each coin beside its code.
 */
const CurrencyPicker: FC<Props> = ({ label, currencies, value, onChange }) => {
  const { t } = useTranslation();

  return (
    <WalletField htmlFor="wallet-currency" label={label}>
      <WalletSelect
        id="wallet-currency"
        options={currencies.map((c) => ({ value: c.code, label: c.code, detail: c.name }))}
        value={value}
        onChange={onChange}
        placeholder={t('acct.wallet.selectCurrency')}
      />
    </WalletField>
  );
};

export default CurrencyPicker;
