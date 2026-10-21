import { useEffect, useState, type FC } from 'react';
import ProfileModalShell from '@/components/modals/profile/ProfileModalShell';
import { REGION_RESTRICTED_EVENT } from '@/services/api';

/** Shown when sign-up or sign-in is refused because of the player's country. */
const RegionRestrictedModal: FC = () => {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const show = (e: Event) => setMessage((e as CustomEvent<string>).detail);
    window.addEventListener(REGION_RESTRICTED_EVENT, show);
    return () => window.removeEventListener(REGION_RESTRICTED_EVENT, show);
  }, []);

  if (!message) return null;
  return (
    <ProfileModalShell
      title="Not available in your region"
      onClose={() => setMessage(null)}
      onSubmit={() => setMessage(null)}
      loading={false}
      submitLabel="OK"
    >
      <p className="text-base leading-6 text-[#9da2b4]">{message}</p>
    </ProfileModalShell>
  );
};

export default RegionRestrictedModal;
