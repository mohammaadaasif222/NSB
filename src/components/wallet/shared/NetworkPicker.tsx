import type { FC } from 'react';
import type { CurrencyNetwork } from '@/types';
import { useTranslation } from '@/context/I18nContext';
import WalletField from './WalletField';
import WalletSelect from './WalletSelect';

interface Props {
  label: string;
  networks: CurrencyNetwork[];
  value: string;
  onChange: (code: string) => void;
}

/**
 * The Network row, in the same pill as Currency: the chain's name, as the
 * design writes it ("Ethereum (ERC-20)"). The list keeps the technical code
 * (ERC20 / TRC20 / BEP20) and the confirmations at each row's end, for the
 * player who cares about the protocol.
 */
const NetworkPicker: FC<Props> = ({ label, networks, value, onChange }) => {
  const { t } = useTranslation();

  return (
    <WalletField htmlFor="wallet-network" label={label}>
      <WalletSelect
        id="wallet-network"
        options={networks.map((n) => ({
          value: n.code,
          label: n.name,
          detail: [
            n.code !== n.name ? n.code : null,
            n.deposit_confirmations === 1
              ? t('acct.wallet.confirmationOne')
              : t('acct.wallet.confirmationMany', { count: n.deposit_confirmations }),
          ]
            .filter(Boolean)
            .join(' · '),
        }))}
        value={value}
        onChange={onChange}
        placeholder={t('acct.wallet.selectNetwork')}
      />
    </WalletField>
  );
};

export default NetworkPicker;
