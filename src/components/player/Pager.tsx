import type { FC } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/I18nContext';

interface Props {
  page: number;
  totalPages: number;
  /** URL for a given page; each page is a real, shareable address. */
  hrefFor: (page: number) => string;
}

const BUTTON = 'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium';
const ACTIVE = 'rl-btn-ghost';
const DISABLED = 'rl-glass cursor-default text-white/20';

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
      className="flex items-center gap-2"
      aria-label={t('games.page', { page, total: totalPages })}
    >
      {hasPrev ? (
        <Link href={hrefFor(page - 1)} className={`${BUTTON} ${ACTIVE}`}>
          ‹ {t('games.prev')}
        </Link>
      ) : (
        <span aria-hidden="true" className={`${BUTTON} ${DISABLED}`}>
          ‹ {t('games.prev')}
        </span>
      )}

      <span className="px-1 text-xs tabular-nums text-white/50">
        {t('games.page', { page, total: totalPages })}
      </span>

      {hasNext ? (
        <Link href={hrefFor(page + 1)} className={`${BUTTON} ${ACTIVE}`}>
          {t('games.next')} ›
        </Link>
      ) : (
        <span aria-hidden="true" className={`${BUTTON} ${DISABLED}`}>
          {t('games.next')} ›
        </span>
      )}
    </nav>
  );
};

export default Pager;
