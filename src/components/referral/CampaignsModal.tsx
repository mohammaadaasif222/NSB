import { useState, type FC } from 'react';
import ProfileModalShell from '@/components/modals/profile/ProfileModalShell';
import TextField from '@/components/ui/TextField';
import { useTranslation } from '@/context/I18nContext';
import type { ReferralCode } from '@/types';

const CODE_PATTERN = /^[A-Za-z0-9_-]{3,32}$/;

interface Props {
  codes: ReferralCode[];
  selected: string | null;
  onSelect: (code: string) => void;
  onToggle: (id: string, active: boolean) => Promise<void>;
  onCreate: (code: string, name: string) => Promise<boolean>;
  onClose: () => void;
}

/** The player's referral codes: pick the one to share, switch codes off, make a new one. */
const CampaignsModal: FC<Props> = ({ codes, selected, onSelect, onToggle, onCreate, onClose }) => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const valid = CODE_PATTERN.test(code.trim()) && name.trim().length > 0;

  const create = async (): Promise<void> => {
    if (!valid) return;
    setSaving(true);
    const created = await onCreate(code.trim().toUpperCase(), name.trim());
    setSaving(false);
    if (created) {
      onSelect(code.trim().toUpperCase());
      setCode('');
      setName('');
    }
  };

  return (
    <ProfileModalShell
      title={t('aff.campaigns')}
      onClose={onClose}
      onSubmit={() => void create()}
      loading={saving}
      submitLabel={t('aff.createCode')}
      submitDisabled={!valid}
    >
      <ul className="space-y-2">
        {codes.map((c) => (
          <li
            key={c.id}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
              selected === c.code ? 'border-[#f5c451]/60 bg-white/8' : 'border-white/10 bg-white/4'
            }`}
          >
            <button
              type="button"
              disabled={!c.is_active}
              onClick={() => onSelect(c.code)}
              className="min-w-0 flex-1 text-start disabled:opacity-50"
            >
              <p className="truncate text-sm font-semibold text-[#f0f1f5]">{c.code}</p>
              <p className="truncate text-xs text-[#9da2b4]">
                {t('aff.codeStats', { name: c.name, clicks: c.clicks, referrals: c.referrals })}
              </p>
            </button>
            <button
              type="button"
              onClick={() => void onToggle(c.id, !c.is_active)}
              className="rl-chip shrink-0 px-3 py-1.5 text-xs text-[#f0f1f5]"
            >
              {c.is_active ? t('aff.disable') : t('aff.enable')}
            </button>
          </li>
        ))}
      </ul>

      <div className="space-y-3 border-t border-white/10 pt-4">
        <p className="text-sm text-[#9da2b4]">{t('aff.newCodeHint')}</p>
        <TextField
          id="ref-code"
          label={t('aff.newCode')}
          placeholder={t('aff.newCode')}
          value={code}
          maxLength={32}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          invalid={code.length > 0 && !CODE_PATTERN.test(code)}
        />
        <TextField
          id="ref-name"
          label={t('aff.codeName')}
          placeholder={t('aff.codeName')}
          value={name}
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
    </ProfileModalShell>
  );
};

export default CampaignsModal;
