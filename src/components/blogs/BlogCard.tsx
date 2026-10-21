import type { FC } from 'react';
import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';

import { useTranslation } from '@/context/I18nContext';
import type { TranslationKey } from '@/i18n/locales';

export interface BlogPost {
  id: string;
  /** Article artwork. Becomes a URL from the CMS once posts are served. */
  image: StaticImageData;
  /** The category pill over the artwork — "Casino", "VIP Club". An i18n key, like the copy below. */
  tag: TranslationKey;
  /** i18n keys while the copy is the design's placeholder. */
  title: TranslationKey;
  excerpt: TranslationKey;
  /** ISO date, written out per locale — the design's "21 Jan 2026". */
  date: string;
}

/** One article, as the design's 502×345 card. */
const BlogCard: FC<{ post: BlogPost }> = ({ post }) => {
  const { t, locale } = useTranslation();
  const date = new Date(post.date).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

  return (
    <Link
      href={`/blogs/${post.id}`}
      className="rl-glass-deep flex flex-col overflow-hidden rounded-[24px] transition-colors hover:bg-white/[0.04] lg:rounded-[calc(var(--u)*34)]"
    >
      {/* 502×199 in the design — kept as a ratio so the art scales with the card. */}
      <div className="relative aspect-[502/199]">
        <Image
          src={post.image}
          alt={t(post.title)}
          fill
          sizes="(min-width: 1024px) 27vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover"
        />
        <span className="absolute left-4 top-4 flex h-[26px] items-center rounded-full bg-[#333849] px-3 text-[11px] leading-5 text-[#f0f1f5] lg:left-[calc(var(--u)*16)] lg:top-[calc(var(--u)*16)] lg:h-[calc(var(--u)*30)] lg:px-[calc(var(--u)*12)] lg:text-[max(10px,calc(var(--u)*12))]">
          {t(post.tag)}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-4 lg:px-[calc(var(--u)*20)] lg:pb-[calc(var(--u)*21)]">
        <h3 className="mt-3 line-clamp-2 text-[17px] font-semibold leading-7 text-white lg:mt-[calc(var(--u)*16)] lg:text-[max(13px,calc(var(--u)*20))] lg:leading-[calc(var(--u)*28)]">
          {t(post.title)}
        </h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-[#9da2b4] lg:mt-[calc(var(--u)*4)] lg:text-[max(11px,calc(var(--u)*14))] lg:leading-[calc(var(--u)*20)]">
          {t(post.excerpt)}
        </p>
        {/* Pinned to the foot so a one-line headline cannot lift the date out of
          line with the cards beside it. */}
        <p className="mt-auto pt-4 text-[13px] leading-5 text-[#9da2b4] lg:pt-[calc(var(--u)*17)] lg:text-[max(11px,calc(var(--u)*14))] lg:leading-[calc(var(--u)*20)]">
          {date}
        </p>
      </div>
    </Link>
  );
};

export default BlogCard;
