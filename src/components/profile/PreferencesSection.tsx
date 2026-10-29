import { useState, type FC } from 'react';
import { toast } from 'react-toastify';
import apiService from '@/services/api';
import { useMe } from '@/context/UserContext';
import { useTranslation } from '@/context/I18nContext';
import { SECTION_HEADING } from '@/components/profile/SectionShell';
import type { ApiUser } from '@/types/profile';
import PersonalGroup from '@/components/profile/preferences/PersonalGroup';
import LanguageGroup from '@/components/profile/preferences/LanguageGroup';
import SoundGroup from '@/components/profile/preferences/SoundGroup';
import PrefGroupView, {
  type PrefToggleWires,
} from '@/components/profile/preferences/PrefGroupView';
import {
  GROUPS_ABOVE_LANGUAGE,
  GROUPS_BELOW_LANGUAGE,
} from '@/components/profile/preferences/preferenceGroups';

interface Props {
  me: ApiUser;
  onChangeUsername: () => void;
  onChangeTimezone: () => void;
}

/**
 * Account preferences.
 *
 * Three of these are real: the display name and time zone persist through
 * PATCH /users/me, and the language and sound effects are client-side choices
 * their providers store locally. Everything else is inert — see `preferenceGroups.ts`, which
 * is the one file to replace when those fields exist.
 *
 * The theme picker the old version carried is not in the design; it stays
 * reachable from the top bar and the lobby rail.
 */
const PreferencesSection: FC<Props> = ({ me, onChangeUsername, onChangeTimezone }) => {
  const { t } = useTranslation();
  const { updateMe } = useMe();
  const [savingAcceptTips, setSavingAcceptTips] = useState(false);
  const [savingDisableNotes, setSavingDisableNotes] = useState(false);

  // Optimistic PATCH /users/me — flip the cached copy first so the switch
  // moves immediately; roll back and toast if the server rejects. Generic
  // helper so new toggles stay a one-liner at the call site.
  const patchMe = async <K extends keyof ApiUser>(
    field: K,
    next: ApiUser[K],
    setBusy: (busy: boolean) => void,
  ): Promise<void> => {
    const previous = me[field];
    setBusy(true);
    updateMe({ [field]: next } as Partial<ApiUser>);
    try {
      const res = await apiService.patch('/users/me', { [field]: next });
      if (!res?.success) {
        updateMe({ [field]: previous } as Partial<ApiUser>);
        toast.error(res?.message || 'Could not save — please try again');
      }
    } catch (err) {
      updateMe({ [field]: previous } as Partial<ApiUser>);
      toast.error((err as { message?: string })?.message || 'Could not save — please try again');
    } finally {
      setBusy(false);
    }
  };

  const wiresByGroup: Record<string, PrefToggleWires> = {
    tipping: {
      acceptTips: {
        value: me.accept_tips,
        onToggle: (next) => void patchMe('accept_tips', next, setSavingAcceptTips),
        busy: savingAcceptTips,
      },
      disableTipsNotes: {
        value: me.disable_tip_notifications,
        onToggle: (next) =>
          void patchMe('disable_tip_notifications', next, setSavingDisableNotes),
        busy: savingDisableNotes,
      },
    },
  };

  return (
    <div>
      <h2 className={`${SECTION_HEADING} max-lg:hidden`}>{t('profile.preferences')}</h2>

      <div className="space-y-6 lg:mt-[calc(var(--u)*23)] lg:space-y-[calc(var(--u)*30)]">
        <PersonalGroup
          me={me}
          onChangeUsername={onChangeUsername}
          onChangeTimezone={onChangeTimezone}
        />

        {GROUPS_ABOVE_LANGUAGE.map((group) => (
          <PrefGroupView key={group.key} group={group} wires={wiresByGroup[group.key]} />
        ))}

        <LanguageGroup />

        <SoundGroup />

        {GROUPS_BELOW_LANGUAGE.map((group) => (
          <PrefGroupView key={group.key} group={group} wires={wiresByGroup[group.key]} />
        ))}
      </div>
    </div>
  );
};

export default PreferencesSection;
