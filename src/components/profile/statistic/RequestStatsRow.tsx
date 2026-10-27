import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import {
  RequestChevronIcon,
  RequestStatsIcon,
} from '@/components/profile/statistic/statisticIcons';

/**
 * The way out of this page: ask support for a fuller breakdown.
 *
 * Built on the same card as the Profile tab's groups, but on its own metrics —
 * the design insets this row by 16 against their 18, and gives it a 42px mark
 * against their 38, so it is written out rather than pushed through
 * `SettingRow`.
 */
const RequestStatsRow: FC<{ onOpen: () => void }> = ({ onOpen }) => {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onOpen}
      className="rl-field-card flex h-[calc(var(--u)*74)] w-full items-center gap-[calc(var(--u)*16)] rounded-[calc(var(--u)*44)] px-[calc(var(--u)*16)] text-start hover:bg-white/8 max-lg:![box-shadow:none] max-lg:before:hidden"
    >
      <span className="flex shrink-0 items-center justify-center text-[#f0f1f5]">
        <RequestStatsIcon />
      </span>

      <span className="min-w-0 flex-1 truncate text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-medium text-[#f0f1f5]">
        {t('stats.requestStatistics')}
      </span>

      <span className="flex shrink-0 items-center justify-center text-[#94a59e]">
        <RequestChevronIcon />
      </span>
    </button>
  );
};

export default RequestStatsRow;
