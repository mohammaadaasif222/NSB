import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { RangeCalendarIcon, RangeCloseIcon } from '@/components/profile/statistic/statisticIcons';
import { STAT_RANGES, type StatRange } from './statRanges';

interface Props {
  active: StatRange;
  onSelect: (range: StatRange) => void;
  rangeLabel: string;
}

/* Chip and date pill share a height and a radius; only the ink and the
   surface change between them. */
const PILL =
  'flex h-[calc(var(--u)*32)] shrink-0 items-center rounded-full text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[1.67] whitespace-nowrap';

/**
 * The period chips and the explicit date range beside them.
 *
 * The date range is display-only: there is no picker, and a control that
 * opened one it could not apply would be worse than a label.
 */
const RangeFilter: FC<Props> = ({ active, onSelect, rangeLabel }) => {
  const { t } = useTranslation();

  return (
    /* Full width on its own line, so `ms-auto` still carries the pill to the
       panel's edge once the title has moved above it. */
    <div className="scrollbar-none flex w-full items-center gap-2.5 overflow-x-auto lg:w-auto lg:flex-1 lg:flex-wrap lg:gap-[calc(var(--u)*11)] lg:overflow-visible">
      {STAT_RANGES.map(({ key, labelKey }) => {
        const selected = key === active;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            aria-pressed={selected}
            /* 15 of side padding, the design's own. This one escaped the
               sweep to `--u` because the class sits in a template literal. */
            className={`${PILL} justify-center px-[calc(var(--u)*15)] ${
              selected
                ? 'rl-chip-active font-medium text-[#ffe779]'
                : 'rl-chip font-normal text-[#9da2b4] hover:rl-chip-active hover:font-medium hover:text-[#ffe779]'
            }`}
          >
            {t(labelKey)}
          </button>
        );
      })}

      {/* Tighter on its closing edge than its opening one — the clear button
          is a disc that carries its own margin, the calendar is not. */}
      <span
        className={`${PILL} max-lg:rl-glass-btn lg:rl-chip ms-auto gap-1.5 ps-3 pe-1 max-lg:absolute max-lg:-top-14 max-lg:end-0 lg:gap-[calc(var(--u)*10)] lg:ps-[calc(var(--u)*15)] lg:pe-[calc(var(--u)*5)]`}
        aria-label={t('stats.range')}
      >
        <span className="flex h-[calc(var(--u)*16)] w-[calc(var(--u)*16)] shrink-0 items-center justify-center text-[#f0f1f5] max-[399px]:hidden">
          <RangeCalendarIcon />
        </span>

        <span className="text-[#9da2b4] max-[369px]:text-[11px] lg:tabular-nums">{rangeLabel || '—'}</span>

        <span
          title={t('common.soon')}
          aria-label={`${t('stats.clearRange')} — ${t('common.soon')}`}
          className="flex h-[calc(var(--u)*22)] w-[calc(var(--u)*22)] shrink-0 cursor-default items-center justify-center rounded-full bg-[#252937] text-[#f0f1f5]"
        >
          <RangeCloseIcon />
        </span>
      </span>
    </div>
  );
};

export default RangeFilter;
