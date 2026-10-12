import type { FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from '@/context/I18nContext';
import { SPORTS, sportHref } from '@/constants/sportsbook';

/**
 * The sportsbook's sport picker: a glass tile per sport, its line icon over
 * the name — 138px on desktop, 86px on a phone, scrolling when they overflow.
 * The current sport's tile is lit.
 */
const SportTiles: FC = () => {
  const { query } = useRouter();
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t('nav.sports')}
      className="rl-shelf -mx-4 -my-3 flex gap-[15px] px-4 py-3 lg:mx-0 lg:gap-[calc(var(--u)*22.5)] lg:px-0"
    >
      {SPORTS.map((sport) => {
        const active = query.sport === sport.key;
        return (
          <Link
            key={sport.key}
            href={sportHref(sport.key)}
            aria-current={active ? 'page' : undefined}
            className={`rl-liquid flex h-[86px] w-[86px] flex-shrink-0 flex-col items-center rounded-[15px] pt-[15px] transition-colors lg:h-[calc(var(--u)*138)] lg:w-[calc(var(--u)*138)] lg:rounded-[calc(var(--u)*24)] lg:pt-[calc(var(--u)*24)] ${
              active ? 'bg-white/[0.14] ring-1 ring-[#ffe779]/40' : 'hover:bg-white/[0.11]'
            }`}
          >
            <img
              src={sport.icon.src}
              alt=""
              className="h-9 w-9 lg:h-[calc(var(--u)*59)] lg:w-[calc(var(--u)*59)]"
            />
            <span className="mt-[5px] whitespace-nowrap text-[12px] leading-5 text-white lg:mt-[calc(var(--u)*14)] lg:text-[length:max(min(11px,14px),calc(var(--u)*14))] lg:font-medium lg:leading-[calc(var(--u)*20)]">
              {t(sport.label)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default SportTiles;
