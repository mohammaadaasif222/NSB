import { useEffect, useState, type FC } from 'react';
import { toast } from 'react-toastify';

import { useTranslation } from '@/context/I18nContext';
import { FieldGroup, SettingRow } from '@/components/profile/SectionShell';
import { getPinStatus, savePin, type PinStatus } from '@/services/transactionPin';

const INPUT =
  'h-[calc(var(--u)*40)] min-h-9 w-full rounded-full bg-white/5 px-4 text-[length:max(min(11px,14px),calc(var(--u)*14))] text-[#f0f1f5] placeholder:text-[#9da2b4] focus:outline-none focus:ring-1 focus:ring-white/30';

/** Set or change the transaction PIN asked for on every withdrawal. */
const TransactionPinGroup: FC = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<PinStatus | null>(null);
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void getPinStatus()
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      setStatus(await savePin(pin, password));
      toast.success(t('acct.pin.saved'));
      setOpen(false);
      setPin('');
      setPassword('');
    } catch (err) {
      toast.error((err as { message?: string })?.message || t('acct.pin.failed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <FieldGroup label={t('acct.pin.title')}>
      <SettingRow
        title={status?.enabled ? t('acct.pin.statusOn') : t('acct.pin.statusOff')}
        detail={t('acct.pin.hint')}
        action={
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rl-glass-btn rounded-full px-4 py-1.5 text-[13px] font-medium text-[#f0f1f5]"
          >
            {status?.enabled ? t('acct.pin.change') : t('acct.pin.save')}
          </button>
        }
      />
      {open && (
        <div className="space-y-2 px-[calc(var(--u)*18)] py-[calc(var(--u)*9)]">
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder={t('acct.pin.newPin')}
            className={INPUT}
          />
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('acct.pin.password')}
            className={INPUT}
          />
          <button
            type="button"
            disabled={saving || !/^\d{4,6}$/.test(pin) || !password}
            onClick={() => void save()}
            className="rl-glass-btn rounded-full px-5 py-2 text-[13px] font-medium text-[#f0f1f5] disabled:opacity-40"
          >
            {t('acct.pin.save')}
          </button>
        </div>
      )}
    </FieldGroup>
  );
};

export default TransactionPinGroup;
