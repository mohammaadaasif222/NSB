import type { FC, ReactNode } from 'react';
import { SUPPORT_ORGS } from '@/components/responsible/rgContent';
import { useTranslation } from '@/context/I18nContext';
import { ArrowUpRightIcon } from '@/components/icons';

/**
 * The furniture shared by the five Responsible Gambling sections.
 *
 * Built from the same `rl-*` glass utilities the account area uses, and with
 * literal colours for the same reason it has them: the per-user theme remap
 * keys off `.bg-slate-*` / `.text-slate-*`, and a harm-reduction warning that
 * changes colour with the player's chosen skin is not a warning.
 */

/** The brand's danger red — the value inside `rl-chip-danger`. */
const DANGER = '#e33827';

/** A section's own title and standfirst, above its first card. */
export const SectionIntro: FC<{ title: string; lead?: string }> = ({ title, lead }) => (
  <header className="space-y-2">
    <h2 className="rl-h-card text-[#f0f1f5]">{title}</h2>
    {lead && <p className="max-w-2xl text-sm leading-6 text-[#9da2b4]">{lead}</p>}
  </header>
);

/**
 * A card on the panel. Softer than the panel it sits on, square-ish rather
 * than capsule — the account area's rule for a card taller than one row.
 */
export const RgCard: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`rl-field-card rounded-[34px] p-5 sm:p-6 ${className}`}>{children}</div>;

export type CalloutTone = 'info' | 'warn' | 'danger';

const TONE: Record<CalloutTone, { border: string; bg: string; ink: string }> = {
  info: { border: 'rgba(255,255,255,0.14)', bg: 'rgba(255,255,255,0.05)', ink: '#9da2b4' },
  warn: { border: 'rgba(252,213,53,0.32)', bg: 'rgba(252,213,53,0.08)', ink: '#fcd535' },
  danger: { border: 'rgba(227,56,39,0.38)', bg: 'rgba(227,56,39,0.10)', ink: DANGER },
};

/** A boxed note. `danger` is reserved for things that cannot be undone. */
export const Callout: FC<{
  tone?: CalloutTone;
  icon?: ReactNode;
  title?: string;
  children: ReactNode;
}> = ({ tone = 'info', icon, title, children }) => {
  const { border, bg, ink } = TONE[tone];

  return (
    <div className="rounded-2xl border p-4 sm:p-5" style={{ borderColor: border, background: bg }}>
      <div className="flex gap-3">
        {icon && (
          <span className="mt-0.5 shrink-0" style={{ color: ink }}>
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          {title && (
            <p className="text-sm leading-5 font-semibold" style={{ color: ink }}>
              {title}
            </p>
          )}
          <div className={`text-sm leading-6 text-[#9da2b4] ${title ? 'mt-1.5' : ''}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

/** A labelled statistic — "Limit", "Used", "Resets". */
export const Stat: FC<{ label: string; value: ReactNode; tone?: 'default' | 'muted' }> = ({
  label,
  value,
  tone = 'default',
}) => (
  <div className="min-w-0">
    <p className="text-xs leading-4 text-[#9da2b4]">{label}</p>
    <p
      className={`mt-1 truncate text-base leading-6 font-medium ${
        tone === 'muted' ? 'text-[#9da2b4]' : 'text-[#f0f1f5]'
      }`}
    >
      {value}
    </p>
  </div>
);

/**
 * The independent services, rendered wherever a player might need them.
 *
 * Shown on FAQs, under a self-assessment result and beside self-exclusion —
 * the three places someone is most likely to be looking for a way out. They
 * open in a new tab so leaving does not cost the player their session.
 */
export const SupportList: FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {!compact && <p className="text-sm leading-6 text-[#9da2b4]">{t('rgc.supportLead')}</p>}

      <ul className="grid gap-2.5 sm:grid-cols-2">
        {SUPPORT_ORGS.map((org) => (
          <li key={org.name}>
            <a
              href={org.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rl-glass rl-glass-hover flex h-full items-start gap-3 rounded-2xl p-4 transition-colors"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm leading-5 font-medium text-[#f0f1f5]">
                  {org.name}
                </span>
                <span className="mt-1 block text-xs leading-5 text-[#9da2b4]">
                  {t(org.descriptionKey)}
                </span>
              </span>
              <ArrowUpRightIcon size={16} className="mt-0.5 shrink-0 text-[#9da2b4]" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
