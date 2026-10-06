import type { FC, ReactNode } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { SoonToggle } from '@/components/profile/SectionShell';
import { CurrencyCoinIcon, PrefChevronIcon } from '@/components/profile/preferences/prefIcons';
import type { PrefGroup, PrefRow } from './preferenceGroups';

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
 */
export const PrefCard: FC<{ children: ReactNode; rows: number }> = ({ children, rows }) => (
  <div
    className={`rl-field-card space-y-6.5 py-5.5 ps-6.5 pe-5 ${
      rows > 1 ? 'rounded-[34px]' : 'rounded-[44px]'
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
  <div className="flex h-7.5 items-center gap-3">
    <p className="min-w-0 flex-1 truncate text-base leading-6 font-medium text-[#f0f1f5]">
      {label}
    </p>
    <div className="shrink-0">{children}</div>
  </div>
);

/** The sentence under a card. */
export const PrefNote: FC<{ children: ReactNode }> = ({ children }) => (
  <p className="mt-2.75 ps-5 text-xs leading-[14.4px] text-[#9da2b4]">{children}</p>
);

const RowControl: FC<{ row: PrefRow; label: string }> = ({ row, label }) => {
  const { t } = useTranslation();

  if (row.kind === 'toggle') {
    return <SoonToggle label={label} />;
  }

  // No currency picker exists, so the value reads as a label rather than a
  // control that would open a list it cannot apply.
  return (
    <span
      title={t('common.soon')}
      className="flex cursor-default items-center gap-1.25 text-base leading-6 text-white"
    >
      {row.coin && <CurrencyCoinIcon />}
      {row.value}
      <PrefChevronIcon />
    </span>
  );
};

const PrefGroupView: FC<{ group: PrefGroup }> = ({ group }) => {
  const { t } = useTranslation();

  return (
    <section className="space-y-1.5">
      <h3 className="text-base leading-6 font-normal text-[#9da2b4]">{t(group.labelKey)}</h3>

      <div className="space-y-5">
        {group.blocks.map((block, i) => (
          <div key={block.rows[0]?.key ?? i}>
            <PrefCard rows={block.rows.length}>
              {block.rows.map((row) => {
                const label = t(row.labelKey);
                return (
                  <PrefRowShell key={row.key} label={label}>
                    <RowControl row={row} label={label} />
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
