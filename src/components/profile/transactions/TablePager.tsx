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
    'rl-pager-step h-[calc(var(--u)*48)] w-[calc(var(--u)*104)] shrink-0 text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-medium text-[#f0f1f5] disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-[calc(var(--u)*20)]"
      aria-label={t('acct.tx.pagination')}
    >
      <button type="button" onClick={() => onPage(page - 1)} disabled={page === 1} className={step}>
        {t('tx.prev')}
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
        const current = n === page;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onPage(n)}
            aria-current={current ? 'page' : undefined}
            className={`h-[calc(var(--u)*48)] w-[calc(var(--u)*48)] shrink-0 text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-medium tabular-nums text-[#f0f1f5] ${
              current ? 'rl-pager-page-on' : 'rl-pager-page'
            }`}
          >
            {n}
          </button>
        );
      })}

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
