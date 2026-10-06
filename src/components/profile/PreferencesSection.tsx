import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { SECTION_HEADING } from '@/components/profile/SectionShell';
import type { ApiUser } from '@/types/profile';
import PersonalGroup from '@/components/profile/preferences/PersonalGroup';
import LanguageGroup from '@/components/profile/preferences/LanguageGroup';
import PrefGroupView from '@/components/profile/preferences/PrefGroupView';
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
 * Two of these are real: the display name and time zone persist through
 * PATCH /users/me, and the language is a client-side choice the i18n provider
 * stores locally. Everything else is inert — see `preferenceGroups.ts`, which
 * is the one file to replace when those fields exist.
 *
 * The theme picker the old version carried is not in the design; it stays
 * reachable from the top bar and the lobby rail.
 */
const PreferencesSection: FC<Props> = ({ me, onChangeUsername, onChangeTimezone }) => {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className={SECTION_HEADING}>{t('profile.preferences')}</h2>

      <div className="mt-[calc(var(--u)*23)] space-y-[calc(var(--u)*30)]">
        <PersonalGroup
          me={me}
          onChangeUsername={onChangeUsername}
          onChangeTimezone={onChangeTimezone}
        />

        {GROUPS_ABOVE_LANGUAGE.map((group) => (
          <PrefGroupView key={group.key} group={group} />
        ))}

        <LanguageGroup />

        {GROUPS_BELOW_LANGUAGE.map((group) => (
          <PrefGroupView key={group.key} group={group} />
        ))}
      </div>
    </div>
  );
};

export default PreferencesSection;
