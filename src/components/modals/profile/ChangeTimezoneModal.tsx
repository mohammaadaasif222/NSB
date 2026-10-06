import { useState, type FC } from 'react';
import { toast } from 'react-toastify';
import apiService from '@/services/api';
import { TIMEZONE_OPTIONS } from '@/types/profile';
import RlSelect, { type RlOption } from '@/components/inputs/RlSelect';
import ProfileModalShell from './ProfileModalShell';

interface Props {
  currentTimezone: string;
  onClose: () => void;
  onSaved: (timezone: string) => void;
}

/** The zone strings are their own labels — nothing to map, just the shape. */
const TZ_OPTIONS: RlOption<string>[] = TIMEZONE_OPTIONS.map((tz) => ({ value: tz, label: tz }));

const ChangeTimezoneModal: FC<Props> = ({ currentTimezone, onClose, onSaved }) => {
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
        toast.success('Time zone updated successfully');
        onSaved(timezone);
        onClose();
      } else {
        setError(res?.message || 'Failed to update time zone');
      }
    } catch (err) {
      const e = err as { message?: string };
      setError(e?.message || 'Failed to update time zone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileModalShell
      title="Change Time Zone"
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
    >
      <div className="space-y-1.75">
        <label
          htmlFor="profile-timezone"
          className="block text-sm leading-5 font-medium text-[#f0f1f5]"
        >
          Time Zone
        </label>

        {/* `RlSelect`, not a native one: the option list a `<select>` opens is
            drawn by the operating system, square and outside the page, and no
            stylesheet reaches it. In a glass dialog that reads as a different
            application. */}
        <RlSelect
          id="profile-timezone"
          value={timezone}
          options={TZ_OPTIONS}
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
