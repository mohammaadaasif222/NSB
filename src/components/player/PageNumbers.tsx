import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  /** Page numbers shown at once, around the current one. */
  window?: number;
}

/** Previous / Next: the design's pale pills, set level at 104 on desktop so
    the row stays symmetrical about the numbers. */
const STEP =
  'rl-pager-step inline-flex h-12 items-center justify-center px-[13px] text-[14px] font-medium leading-5 lg:h-[calc(var(--u)*48)] lg:w-[calc(var(--u)*104)] lg:px-0 lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]';

/** A page number: a 48px disc, gold and glowing when it is the current page. */
const NUMBER =
  'inline-flex h-12 w-12 items-center justify-center text-[14px] font-medium leading-5 tabular-nums lg:h-[calc(var(--u)*48)] lg:w-[calc(var(--u)*48)] lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]';
const NUMBER_ON = 'rl-pager-page-on';
const NUMBER_IDLE = 'rl-pager-page';

/**
 * The design's numbered pager for a list paged in the browser: Previous, a
 * run of page numbers around the current one, Next. Spread across the width
 * on a phone, centred with 20px gaps on desktop.
 */
const PageNumbers: FC<Props> = ({ page, totalPages, onChange, window: span = 4 }) => {
  const { t } = useTranslation();
  const pages = Math.max(1, totalPages);

  // A run of `span` numbers containing the current page, kept inside 1…pages.
  const first = Math.max(1, Math.min(page - Math.floor((span - 1) / 2), pages - span + 1));
  const numbers = Array.from({ length: Math.min(span, pages) }, (_, i) => first + i);

  return (
    <nav
      aria-label={t('games.page', { page, total: pages })}
      className="flex items-center justify-between lg:justify-center lg:gap-[calc(var(--u)*20)]"
    >
      <button
        type="button"
        className={STEP}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        {t('games.prev')}
      </button>

      <span className="flex items-center gap-[7px] lg:gap-[calc(var(--u)*20)]">
        {numbers.map((n) => (
          <button
            key={n}
            type="button"
            aria-current={n === page ? 'page' : undefined}
            onClick={() => onChange(n)}
            className={`${NUMBER} ${n === page ? NUMBER_ON : NUMBER_IDLE}`}
          >
            {n}
          </button>
        ))}
      </span>

      <button
        type="button"
        className={STEP}
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        {t('games.next')}
      </button>
    </nav>
  );
};

export default PageNumbers;
