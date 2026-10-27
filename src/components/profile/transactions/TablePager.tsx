import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';

interface Props {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}

/**
 * Numbered pagination for the ledger.
 *
 * Separate from `player/Pager`: that one is `<Link>`-driven, because a games
 * listing page is a real shareable address. This table is filtered in place
 * inside a tab, so its page is local state and each control is a button.
 *
 * The steps are fixed at the design's 104 rather than left to size themselves
 * — "Previous" and "Next" are different lengths, and the design sets them
 * level so the row stays symmetrical about the numbers.
 */
const TablePager: FC<Props> = ({ page, totalPages, onPage }) => {
  const { t } = useTranslation();

  if (totalPages <= 1) {
    return null;
  }

  const step =
    'rl-pager-step h-[34px] min-w-[84px] shrink-0 px-[15px] text-[14px] leading-5 font-medium lg:h-[calc(var(--u)*48)] lg:w-[calc(var(--u)*104)] lg:min-w-0 lg:px-0 lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[1.5]';

  return (
    <nav
      className="flex items-center justify-between lg:flex-wrap lg:justify-center lg:gap-[calc(var(--u)*20)]"
      aria-label={t('acct.tx.pagination')}
    >
      <button type="button" onClick={() => onPage(page - 1)} disabled={page === 1} className={step}>
        {t('tx.prev')}
      </button>

      <div className="flex items-center gap-4 lg:contents">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
          const current = n === page;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onPage(n)}
              aria-current={current ? 'page' : undefined}
              className={`h-[34px] w-[34px] shrink-0 text-[16px] leading-6 font-medium tabular-nums lg:h-[calc(var(--u)*48)] lg:w-[calc(var(--u)*48)] lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[1.5] ${
                current
                  ? 'rl-pager-page-on max-lg:![background:rgba(249,208,40,0.2)]'
                  : 'rl-pager-page max-lg:![background:rgba(255,255,255,0.05)]'
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className={step}
      >
        {t('tx.next')}
      </button>
    </nav>
  );
};

export default TablePager;
