import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { useSound } from '@/context/SoundContext';
import ToggleSwitch from '@/components/profile/ToggleSwitch';
import { PrefCard, PrefNote, PrefRowShell } from '@/components/profile/preferences/PrefGroupView';

/**
 * Interface sound effects. Wired, like Language: the sound provider stores the
 * choice on this device, so this is a live switch rather than a `SoonToggle`.
 */
const SoundGroup: FC = () => {
  const { t } = useTranslation();
  const { enabled, setEnabled } = useSound();

  return (
    <section className="space-y-1 lg:space-y-[calc(var(--u)*6)]">
      <h3 className="text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-normal text-[#9da2b4]">
        {t('pref.sound')}
      </h3>

      <div>
        <PrefCard rows={1}>
          <PrefRowShell label={t('pref.soundEffects')}>
            <ToggleSwitch enabled={enabled} onToggle={() => setEnabled(!enabled)} narrow />
          </PrefRowShell>
        </PrefCard>
        <PrefNote>{t('pref.soundEffectsNote')}</PrefNote>
      </div>
    </section>
  );
};

export default SoundGroup;
