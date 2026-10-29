import type { FC, ReactNode } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { SoonToggle } from '@/components/profile/SectionShell';
import ToggleSwitch from '@/components/profile/ToggleSwitch';
import { CurrencyCoinIcon, PrefChevronIcon } from '@/components/profile/preferences/prefIcons';
import type { PrefGroup, PrefRow } from './preferenceGroups';

/**
 * Live wiring for one or more rows in a group. The parent passes the current
 * value and an `onToggle`; rows whose key isn't in this map still render the
 * inert `SoonToggle` so unmigrated prefs stay visually consistent.
 */
export interface PrefToggleWire {
  value: boolean;
  onToggle: (next: boolean) => void;
  busy?: boolean;
}
export type PrefToggleWires = Record<string, PrefToggleWire | undefined>;

/**
 * A labelled group of preference cards.
 *
 * Its own renderer rather than `FieldGroup`: a group here can hold several
 * cards, and each card can be followed by a sentence explaining what the
 * switch does — neither of which the shared group supports.
 */

/**
 * The card the rows sit in.
 *
 * 22 of padding, 30 per row and 26 between them, which is what makes the
 * design's two heights exact: 22+30+22 for one row, 22+30+26+30+22 for two.
 * Wider on its opening edge than its closing one, as the design has it — the
 * controls on the right hang closer to the edge than the labels on the left.
 *
 * All of it in `--u`, the design pixel the shell sets — see the note at the
 * head of `SectionShell`.
 */
export const PrefCard: FC<{ children: ReactNode; rows: number }> = ({ children, rows }) => (
  <div
    className={`rl-field-card space-y-[calc(var(--u)*26)] py-[calc(var(--u)*22)] ps-[18px] pe-4 max-lg:![box-shadow:none] max-lg:before:hidden lg:ps-[calc(var(--u)*26)] lg:pe-[calc(var(--u)*20)] ${
      rows > 1 ? 'rounded-[calc(var(--u)*34)]' : 'rounded-[calc(var(--u)*44)]'
    }`}
  >
    {children}
  </div>
);

/** The label / control line inside a card. */
export const PrefRowShell: FC<{ children: ReactNode; label: ReactNode }> = ({
  children,
  label,
}) => (
  <div className="flex min-h-[30px] items-center gap-3 lg:h-[calc(var(--u)*30)] lg:gap-[calc(var(--u)*12)]">
    <p className="min-w-0 flex-1 text-[16px] leading-6 font-medium text-[#f0f1f5] lg:truncate lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[1.5]">
      {label}
    </p>
    <div className="shrink-0">{children}</div>
  </div>
);

/** The sentence under a card. */
export const PrefNote: FC<{ children: ReactNode }> = ({ children }) => (
  <p className="mt-2.5 ps-2.5 text-[12px] leading-4 text-[#9da2b4] lg:mt-[calc(var(--u)*11)] lg:ps-[calc(var(--u)*20)] lg:text-[length:max(min(11px,12px),calc(var(--u)*12))] lg:leading-[1.2]">
    {children}
  </p>
);

const RowControl: FC<{ row: PrefRow; label: string; wire?: PrefToggleWire }> = ({
  row,
  label,
  wire,
}) => {
  const { t } = useTranslation();

  if (row.kind === 'toggle') {
    if (wire) {
      return (
        <ToggleSwitch
          enabled={wire.value}
          onToggle={() => wire.onToggle(!wire.value)}
          label={label}
          disabled={wire.busy}
          narrow
        />
      );
    }
    return <SoonToggle label={label} narrow />;
  }

  // No currency picker exists, so the value reads as a label rather than a
  // control that would open a list it cannot apply.
  return (
    <span
      title={t('common.soon')}
      className="flex cursor-default items-center gap-[calc(var(--u)*5)] text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] text-white"
    >
      {row.coin && <CurrencyCoinIcon />}
      {row.value}
      <PrefChevronIcon />
    </span>
  );
};

const PrefGroupView: FC<{ group: PrefGroup; wires?: PrefToggleWires }> = ({
  group,
  wires,
}) => {
  const { t } = useTranslation();

  return (
    <section className="space-y-1 lg:space-y-[calc(var(--u)*6)]">
      <h3 className="text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-normal text-[#9da2b4]">
        {t(group.labelKey)}
      </h3>

      <div className="space-y-6 lg:space-y-[calc(var(--u)*20)]">
        {group.blocks.map((block, i) => (
          <div key={block.rows[0]?.key ?? i}>
            <PrefCard rows={block.rows.length}>
              {block.rows.map((row) => {
                const label = t(row.labelKey);
                return (
                  <PrefRowShell key={row.key} label={label}>
                    <RowControl row={row} label={label} wire={wires?.[row.key]} />
                  </PrefRowShell>
                );
              })}
            </PrefCard>

            {block.noteKey && <PrefNote>{t(block.noteKey)}</PrefNote>}
          </div>
        ))}
      </div>
    </section>
  );
};

export default PrefGroupView;
