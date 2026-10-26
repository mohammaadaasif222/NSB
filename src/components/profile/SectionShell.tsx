import type { FC, ReactNode } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { TOGGLE_SIZE } from '@/components/profile/ToggleSwitch';

/**
 * The shared furniture of an account section: a labelled group, the rows
 * inside it, and the placeholder used where a section has no API behind it.
 *
 * Built from the lobby's `rl-*` glass utilities rather than the slate palette,
 * so the account area matches the shell it sits in. Colours are literal for
 * the same reason the utilities are: the per-user theme remap keys off
 * `.bg-slate-*` / `.text-slate-*`, and nothing here should be caught by it.
 *
 * SIZED IN `--u`, the design pixel `PlayerLayout` sets: from `lg` up it is the
 * viewport's share of the design's 1920 frame, capped at 1px. Every number
 * below is the design's own, multiplied by it, so the whole account area comes
 * down at exactly the rate the shell around it does. At fixed sizes it did
 * not: on a 1270 laptop the shell shrank to 0.661 while these rows stayed at
 * 1.0, and a card that is correct next to a rail at 1920 reads oversized next
 * to the same rail at 1270.
 *
 * Type carries an 11px floor (`max(min(11px, n), n * --u)`), the same one the
 * lobby uses — proportion matters until a label stops being readable, and then
 * it does not. Line heights are unitless so they follow the scaled size.
 *
 * Classes are written out in full: Tailwind only emits a class it can see
 * whole in the source, so a calc assembled at runtime yields no CSS.
 */

/**
 * A tab's own heading — "Statistic", "Preferences", "Security".
 *
 * NOT `rl-h-section`. That utility is a three-step ladder (30 below 640, 36 to
 * 1535, 44 above) and the middle step is wrong here: the design draws this at
 * 44 on its 1920 frame, so a 1251 laptop should get 44 × 0.651 = 28.7. The
 * ladder gave 36 — a quarter too big — which is what pushed the Statistic
 * filter chips off the heading's line and onto a row of their own.
 *
 * `rl-h-section` is left alone; it still carries the Responsible Gambling,
 * Referral and legal pages, which are not on `--u`.
 *
 * Below `lg` the unit is 1px, so the design's 44 would land at 44 on a phone.
 * The old 30 is kept there instead.
 */
export const SECTION_HEADING =
  'text-[30px] leading-[1.2] font-semibold tracking-[-0.88px] text-[#f0f1f5] lg:text-[length:max(min(11px,44px),calc(var(--u)*44))] lg:leading-[1.18]';

/** A titled group of rows, as in "Email Account" / "2FA" / "Linked Accounts". */
export const FieldGroup: FC<{ label: string; children: ReactNode; cardClassName?: string }> = ({
  label,
  children,
  cardClassName = '',
}) => (
  <section className="space-y-[calc(var(--u)*6)]">
    <h3 className="text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-normal text-[#9da2b4]">
      {label}
    </h3>
    {/* One card per group, with the rows plain inside it — the design has no
        second border around each row.

        The 18px the design insets its rows by is split in half, 9 here and 9
        on each row: consecutive rows then sit 18px apart and the first and
        last still clear the card edge by 18, while a child that brings its own
        padding — a bare button, say — is not boxed in twice. */}
    <div
      className={`rl-field-card overflow-hidden rounded-[calc(var(--u)*44)] py-[calc(var(--u)*9)] max-lg:![box-shadow:none] max-lg:before:hidden ${cardClassName}`}
    >
      {children}
    </div>
  </section>
);

/**
 * The tile a line icon sits in. Brand marks are passed to `SettingRow` bare,
 * since their own colour is the point; a monochrome glyph needs the tile to
 * hold its weight beside them.
 */
export const IconTile: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="flex h-[calc(var(--u)*38)] w-[calc(var(--u)*38)] shrink-0 items-center justify-center rounded-[calc(var(--u)*12)] bg-white/7 text-white/70">
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
  <div
    className={`flex items-center px-[calc(var(--u)*18)] py-[calc(var(--u)*9)] lg:gap-[calc(var(--u)*12)] ${layout === 'inline' ? 'gap-3' : 'gap-[18px]'}`}
  >
    {icon && <span className="flex shrink-0 items-center justify-center">{icon}</span>}

    <div
      className={
        layout === 'inline'
          ? 'flex min-w-0 flex-1 flex-wrap items-baseline gap-x-1.5 gap-y-0.5 lg:gap-x-[calc(var(--u)*12)]'
          : 'min-w-0 flex-1'
      }
    >
      <p className="truncate text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-medium text-[#f0f1f5]">
        {title}
      </p>
      {detail !== undefined && (
        <p
          className={`max-w-full truncate text-[#9da2b4] lg:text-[length:max(min(11px,14px),calc(var(--u)*14))] lg:leading-[1.43] ${layout === 'inline' ? 'text-[12px] leading-5' : 'mt-0.5 text-[14px] leading-[1.43]'}`}
        >
          {detail}
        </p>
      )}
    </div>

    {action && <div className="shrink-0">{action}</div>}
  </div>
);

/**
 * The small pill every "Change" action on the account uses.
 *
 * Lived in `ProfileInfoRow.tsx` beside a row component nothing imported. The
 * row is gone; this is the half that was being used, and it belongs with the
 * rest of the shared row furniture.
 */
export const RowButton: FC<{ onClick: () => void; children: ReactNode }> = ({
  onClick,
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="rl-btn-ghost rounded-full px-[calc(var(--u)*14)] py-[calc(var(--u)*6)] text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[1.5] font-medium whitespace-nowrap"
  >
    {children}
  </button>
);

/** Inert switch for a setting whose backend does not exist yet. */
export const SoonToggle: FC<{ label: string; narrow?: boolean }> = ({ label, narrow = false }) => {
  const { t } = useTranslation();
  const size = TOGGLE_SIZE[narrow ? 'narrow' : 'wide'];

  return (
    <span
      role="switch"
      aria-checked="false"
      aria-disabled="true"
      aria-label={`${label} — ${t('common.soon')}`}
      title={t('common.soon')}
      className={`relative block ${size.track} shrink-0 cursor-default rounded-full bg-white/20`}
    >
      <span className={`absolute ${size.knob} ${size.off} rounded-full bg-[#f0f1f5]`} />
    </span>
  );
};
