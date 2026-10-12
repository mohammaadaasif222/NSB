import { useState, type FC } from 'react';
import { toast } from 'react-toastify';
import { Check } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { THEME_OPTIONS, type ThemeName } from '@/types/profile';
import { useTranslation } from '@/context/I18nContext';
import ProfileModalShell from './ProfileModalShell';

interface Props {
  currentTheme: ThemeName;
  onClose: () => void;
  onSaved: (theme: ThemeName) => void;
}

const ThemeModal: FC<Props> = ({ currentTheme, onClose, onSaved }) => {
  const { saveTheme } = useTheme();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<ThemeName>(currentTheme);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (): Promise<void> => {
    if (selected === currentTheme) {
      onClose();
      return;
    }
    setLoading(true);
    const ok = await saveTheme(selected);
    setLoading(false);
    if (ok) {
      toast.success(t('acct.theme.updated'));
      onSaved(selected);
      onClose();
    } else {
      toast.error(t('acct.theme.failed'));
    }
  };

  return (
    <ProfileModalShell
      title={t('acct.theme.title')}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel={t('acct.theme.apply')}
    >
      {/* The dialog's own field, one per theme — same 34 radius and white-5%
          fill, so the grid reads as a row of controls rather than a second
          palette inside a glass dialog. The chosen one takes the gold the rest
          of the app uses for "this is the one". */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {THEME_OPTIONS.map((opt) => {
          const active = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelected(opt.value)}
              aria-pressed={active}
              className={`rl-modal-field flex h-14 items-center gap-3 px-5 text-start transition-colors ${
                active ? 'border-(--rl-gold)/60 bg-white/10' : 'hover:bg-white/8'
              }`}
            >
              <span
                className="h-6 w-6 shrink-0 rounded-full border border-white/20"
                style={{ background: opt.swatch }}
              />
              <span className="flex-1 truncate text-base leading-6 font-medium text-[#f0f1f5]">
                {t(opt.label)}
              </span>
              {active && <Check size={16} className="shrink-0 text-(--rl-gold)" />}
            </button>
          );
        })}
      </div>
    </ProfileModalShell>
  );
};

export default ThemeModal;
