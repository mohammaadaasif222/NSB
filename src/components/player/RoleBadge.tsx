import type { FC, ReactNode } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { isVip } from '@/constants/roles';

type Tone = 'blue' | 'green' | 'red' | 'amber' | 'slate';

const TONES: Record<Tone, string> = {
  blue: 'bg-blue-600/15 text-blue-300 border-blue-500/30',
  green: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  red: 'bg-red-500/10 text-red-300 border-red-500/30',
  amber: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  slate: 'bg-slate-800 text-slate-300 border-slate-700',
};

export const Badge: FC<{ tone?: Tone; children: ReactNode }> = ({ tone = 'slate', children }) => (
  <span
    className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${TONES[tone]}`}
  >
    {children}
  </span>
);

/** "Player" or "VIP Player", translated. */
const RoleBadge: FC<{ role: string | null | undefined }> = ({ role }) => {
  const { t } = useTranslation();
  const vip = isVip(role);
  return <Badge tone={vip ? 'amber' : 'blue'}>{vip ? t('role.vip') : t('role.player')}</Badge>;
};

export default RoleBadge;
