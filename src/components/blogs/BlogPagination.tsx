import type { FC } from 'react';

import { useTranslation } from '@/context/I18nContext';

interface Props {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}

/** The shape every control on the row shares; the fills are the `rl-pager-*` utilities. */
const BASE =
  'flex h-11 items-center justify-center text-[15px] font-medium lg:h-[calc(var(--u)*48)] lg:text-[max(12px,calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]';

/**
 * Previous / 1 2 3 4 / Next — the design's 500×48 row, centred under the grid.
 *
 * Buttons rather than links: there is no posts endpoint to page against, so
 * the state is local. Make these `<Link>`s once pages are real URLs, the way
 * the lobby's shelves already are — a page a reader cannot share or go back
 * to is a worse pager than a slower one.
 */
const BlogPagination: FC<Props> = ({ page, totalPages, onPage }) => {
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t('blogs.pagination')}
      className="flex items-center justify-center gap-2 lg:gap-[calc(var(--u)*20)]"
    >
      <button
        type="button"
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        className={`${BASE} rl-pager-step px-5 lg:w-[calc(var(--u)*104)] lg:px-0`}
      >
        {t('blogs.previous')}
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onPage(n)}
          aria-current={n === page ? 'page' : undefined}
          aria-label={t('blogs.page', { page: n })}
          className={`${BASE} w-11 lg:w-[calc(var(--u)*48)] ${
            n === page
              ? 'rl-pager-page-on'
              : 'rl-pager-page'
          }`}
        >
          {n}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
        className={`${BASE} rl-pager-step px-5 lg:w-[calc(var(--u)*104)] lg:px-0`}
      >
        {t('blogs.next')}
      </button>
    </nav>
  );
};

export default BlogPagination;
