import type { FC } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/I18nContext';

interface Props {
  page: number;
  totalPages: number;
  /** URL for a given page; each page is a real, shareable address. */
  hrefFor: (page: number) => string;
}

/** The same pale pill as the numbered pagers' Previous / Next (`PageNumbers`). */
const BUTTON =
  'rl-pager-step inline-flex h-12 items-center justify-center px-[13px] text-[14px] font-medium leading-5 lg:h-[calc(var(--u)*48)] lg:w-[calc(var(--u)*104)] lg:px-0 lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]';

/** Previous / "Page X of Y" / Next for a server-rendered listing. */
const Pager: FC<Props> = ({ page, totalPages, hrefFor }) => {
  const { t } = useTranslation();

  if (totalPages <= 1) {
    return null;
  }

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav
      className="flex items-center gap-2 lg:gap-[calc(var(--u)*20)]"
      aria-label={t('games.page', { page, total: totalPages })}
    >
      {hasPrev ? (
        <Link href={hrefFor(page - 1)} className={BUTTON}>
          {t('games.prev')}
        </Link>
      ) : (
        <span aria-hidden="true" aria-disabled="true" className={BUTTON}>
          {t('games.prev')}
        </span>
      )}

      <span className="px-1 text-[14px] tabular-nums text-white/50 lg:text-[length:max(min(11px,16px),calc(var(--u)*16))]">
        {t('games.page', { page, total: totalPages })}
      </span>

      {hasNext ? (
        <Link href={hrefFor(page + 1)} className={BUTTON}>
          {t('games.next')}
        </Link>
      ) : (
        <span aria-hidden="true" aria-disabled="true" className={BUTTON}>
          {t('games.next')}
        </span>
      )}
    </nav>
  );
};

export default Pager;
