import type { FC, ReactNode } from 'react';
import { useTranslation } from '@/context/I18nContext';

/**
 * The shared furniture of an account section: a labelled group, the rows
 * inside it, and the placeholder used where a section has no API behind it.
 *
 * Built from the lobby's `rl-*` glass utilities rather than the slate palette,
 * so the account area matches the shell it sits in. Colours are literal for
 * the same reason the utilities are: the per-user theme remap keys off
 * `.bg-slate-*` / `.text-slate-*`, and nothing here should be caught by it.
 */

/** A titled group of rows, as in "Email Account" / "2FA" / "Linked Accounts". */
export const FieldGroup: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <section className="space-y-1.5">
    <h3 className="text-base leading-6 font-normal text-[#9da2b4]">{label}</h3>
    {/* One card per group, with the rows plain inside it — the design has no
        second border around each row.

        The 18px the design insets its rows by is split in half, 9 here and 9
        on each row: consecutive rows then sit 18px apart and the first and
        last still clear the card edge by 18, while a child that brings its own
        padding — `SectionPlaceholder`, a bare button — is not boxed in twice. */}
    <div className="rl-field-card overflow-hidden rounded-[44px] py-2.25">{children}</div>
  </section>
);

/**
 * The tile a line icon sits in. Brand marks are passed to `SettingRow` bare,
 * since their own colour is the point; a monochrome glyph needs the tile to
 * hold its weight beside them.
 */
export const IconTile: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-xl bg-white/7 text-white/70">
    {children}
  </span>
);

interface RowProps {
  icon?: ReactNode;
  title: ReactNode;
  /** Secondary text. */
  detail?: ReactNode;
  /**
   * Where the detail goes. `stacked` puts it under the title; `inline` sets it
   * beside the title, as the email row does with the address next to the host.
   */
  layout?: 'stacked' | 'inline';
  action?: ReactNode;
}

/** One row inside a FieldGroup. */
export const SettingRow: FC<RowProps> = ({ icon, title, detail, layout = 'stacked', action }) => (
  <div className="flex items-center gap-3 px-4.5 py-2.25">
    {icon && <span className="flex shrink-0 items-center justify-center">{icon}</span>}

    <div
      className={
        layout === 'inline'
          ? 'flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-0.5'
          : 'min-w-0 flex-1'
      }
    >
      <p className="truncate text-base leading-6 font-medium text-[#f0f1f5]">{title}</p>
      {detail !== undefined && (
        <p
          className={`max-w-full truncate text-sm leading-5 text-[#9da2b4] ${layout === 'inline' ? '' : 'mt-0.5'}`}
        >
          {detail}
        </p>
      )}
    </div>

    {action && <div className="shrink-0">{action}</div>}
  </div>
);

/** The "nothing here yet" body for a section with no endpoint behind it. */
export const SectionPlaceholder: FC<{ icon: ReactNode; note?: string }> = ({ icon, note }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fcd535]/15 text-[#fcd535]">
        {icon}
      </span>
      <span className="inline-flex items-center rounded-full border border-[#fcd535]/30 bg-[#fcd535]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#fcd535]">
        {t('soon.heading')}
      </span>
      <p className="max-w-sm text-[13px] leading-relaxed text-white/50">{note ?? t('soon.body')}</p>
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
      className="relative block h-7.5 w-17.5 shrink-0 cursor-default rounded-full bg-white/20"
    >
      <span className="absolute left-0.5 top-0.5 h-6.5 w-10.25 rounded-full bg-[#f0f1f5]" />
    </span>
  );
};
