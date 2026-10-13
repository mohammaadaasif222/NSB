import { useState, type FC } from 'react';
import { toast } from 'react-toastify';
import apiService from '@/services/api';
import { useTranslation } from '@/context/I18nContext';
import { TIMEZONE_OPTIONS, timezoneLabelKey } from '@/types/profile';
import RlSelect, { type RlOption } from '@/components/inputs/RlSelect';
import ProfileModalShell from './ProfileModalShell';

interface Props {
  currentTimezone: string;
  onClose: () => void;
  onSaved: (timezone: string) => void;
}

const ChangeTimezoneModal: FC<Props> = ({ currentTimezone, onClose, onSaved }) => {
  const { t } = useTranslation();
  /** The zone strings are what the API stores; each is shown under a translated label. */
  const tzOptions: RlOption<string>[] = TIMEZONE_OPTIONS.map((tz) => {
    const key = timezoneLabelKey(tz);
    return { value: tz, label: key ? t(key) : tz };
  });
  const [timezone, setTimezone] = useState(currentTimezone || TIMEZONE_OPTIONS[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (): Promise<void> => {
    if (timezone === currentTimezone) {
      onClose();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await apiService.patch('/users/me', { timezone });
      if (res?.success) {
        toast.success(t('acct.tz.updated'));
        onSaved(timezone);
        onClose();
      } else {
        setError(res?.message || t('acct.tz.failed'));
      }
    } catch (err) {
      const e = err as { message?: string };
      setError(e?.message || t('acct.tz.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileModalShell
      title={t('acct.tz.title')}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
    >
      <div className="space-y-1.75">
        <label
          htmlFor="profile-timezone"
          className="block text-sm leading-5 font-medium text-[#f0f1f5]"
        >
          {t('acct.tz.label')}
        </label>

        {/* `RlSelect`, not a native one: the option list a `<select>` opens is
            drawn by the operating system, square and outside the page, and no
            stylesheet reaches it. In a glass dialog that reads as a different
            application. */}
        <RlSelect
          id="profile-timezone"
          value={timezone}
          options={tzOptions}
          onChange={setTimezone}
        />

        {error && (
          <p role="alert" className="text-sm leading-5 text-[#ef4462]">
            {error}
          </p>
        )}
      </div>
    </ProfileModalShell>
  );
};

export default ChangeTimezoneModal;
