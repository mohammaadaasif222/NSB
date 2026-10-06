import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  /** Page numbers shown at once, around the current one. */
  window?: number;
}

/** Previous / Next: the design's pale glass pills. */
const STEP =
  'inline-flex h-12 items-center justify-center rounded-full bg-white/20 px-[13px] text-[14px] font-medium leading-5 text-[#f0f1f5] backdrop-blur-md transition-colors enabled:hover:bg-white/25 disabled:cursor-default disabled:opacity-40 lg:h-[calc(var(--u)*48)] lg:px-[calc(var(--u)*20)] lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]';

/** A page number: a 48px disc, gold and glowing when it is the current page. */
const NUMBER =
  'inline-flex h-12 w-12 items-center justify-center rounded-full text-[14px] font-medium leading-5 text-[#f0f1f5] backdrop-blur-md transition-colors lg:h-[calc(var(--u)*48)] lg:w-[calc(var(--u)*48)] lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]';
const NUMBER_ON = 'bg-[#f9d028]/20 shadow-[0_0_14px_rgba(249,208,40,0.55)]';
const NUMBER_IDLE = 'bg-white/5 hover:bg-white/10';

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
