import type { FC, ReactNode } from 'react';
import { useTranslation } from '@/context/I18nContext';

/**
 * The shared furniture of an account section: a labelled group, the rows
 * inside it, and the placeholder used where a section has no API behind it.
 */

/** A titled group of rows, as in "Email Account" / "2FA" / "Linked Accounts". */
export const FieldGroup: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <section className="space-y-2">
    <h3 className="text-xs font-medium text-slate-400">{label}</h3>
    <div className="space-y-2 rounded-2xl bg-slate-800/40 border border-slate-800 p-2.5">
      {children}
    </div>
  </section>
);

interface RowProps {
  icon?: ReactNode;
  title: ReactNode;
  /** Secondary text, shown beside the title on wide rows and under it when tight. */
  detail?: ReactNode;
  action?: ReactNode;
}

/** One row inside a FieldGroup. */
export const SettingRow: FC<RowProps> = ({ icon, title, detail, action }) => (
  <div className="flex items-center gap-3 rounded-xl bg-slate-900 border border-slate-800 px-3 py-3">
    {icon && (
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-400">
        {icon}
      </span>
    )}

    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-slate-100">{title}</p>
      {detail !== undefined && (
        <p className="mt-0.5 truncate text-[11px] text-slate-500">{detail}</p>
      )}
    </div>

    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

/** The "nothing here yet" body for a section with no endpoint behind it. */
export const SectionPlaceholder: FC<{ icon: ReactNode; note?: string }> = ({ icon, note }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-slate-800/40 border border-slate-800 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/15 text-blue-300">
        {icon}
      </span>
      <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-300">
        {t('soon.heading')}
      </span>
      <p className="max-w-sm text-sm leading-relaxed text-slate-400">{note ?? t('soon.body')}</p>
    </div>
  );
};

/** Inert switch for a setting whose backend does not exist yet. */
export const SoonToggle: FC<{ label: string }> = ({ label }) => {
  const { t } = useTranslation();

  return (
    <span
      role="switch"
      aria-checked="false"
      aria-disabled="true"
      aria-label={`${label} — ${t('common.soon')}`}
      title={t('common.soon')}
      className="relative block h-6 w-11 flex-shrink-0 cursor-default rounded-full bg-slate-700"
    >
      <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-slate-400" />
    </span>
  );
};
