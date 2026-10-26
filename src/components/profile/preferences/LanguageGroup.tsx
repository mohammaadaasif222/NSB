import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import LanguagePicker from '@/components/LanguagePicker';
import { PrefCard, PrefRowShell } from '@/components/profile/preferences/PrefGroupView';

/**
 * The interface language.
 *
 * The one genuinely working control in this tab: the i18n provider stores the
 * choice locally, so the picker is real rather than a `SoonToggle`. It is
 * drawn bare — flag, name and chevron, no pill — which is how the design
 * closes every value row here.
 */
const LanguageGroup: FC = () => {
  const { t } = useTranslation();

  return (
    <section className="space-y-1 lg:space-y-[calc(var(--u)*6)]">
      <h3 className="text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-normal text-[#9da2b4]">
        {t('profile.language')}
      </h3>

      <PrefCard rows={1}>
        <PrefRowShell label={t('pref.selectLanguage')}>
          <LanguagePicker plain />
        </PrefRowShell>
      </PrefCard>
    </section>
  );
};

export default LanguageGroup;
