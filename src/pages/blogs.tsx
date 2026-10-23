import { useMemo, useState, type FC } from 'react';
import Image from 'next/image';

import PlayerLayout from '@/layout/PlayerLayout';
import SiteFooter from '@/components/player/SiteFooter';
import BlogCard from '@/components/blogs/BlogCard';
import BlogPagination from '@/components/blogs/BlogPagination';
import { useTranslation } from '@/context/I18nContext';
import {
  BLOG_CATEGORIES,
  BLOG_CATEGORY_LABELS,
  BLOG_POSTS,
  BLOG_TOTAL_PAGES,
  type BlogCategory,
} from '@/constants/blogs';

import blogHero from '@/assets/blogs/blog-hero.webp';
import Seo from '@/components/seo/Seo';

const CHIP =
  'flex h-11 items-center px-5 text-[15px] lg:h-[calc(var(--u)*48)] lg:px-[calc(var(--u)*24)] lg:text-[max(12px,calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]';

/**
 * Blogs.
 *
 * The design's frame: the banner, the category chips, the articles three
 * across in the 1548 column, the pager, and the shared footer.
 *
 * PLACEHOLDER content throughout — see constants/blogs.ts. The pager moves
 * state but has no second page behind it, so every page shows the same nine
 * cards; that is the frame's own repetition, not a bug to chase.
 */
const BlogsPage: FC = () => {
  const { t } = useTranslation();
  const [category, setCategory] = useState<BlogCategory | null>(null);
  const [page, setPage] = useState(1);

  const shown = useMemo(
    () => (category ? BLOG_POSTS.filter((p) => p.category === category) : BLOG_POSTS),
    [category]
  );

  const pick = (next: BlogCategory | null): void => {
    setCategory(next);
    setPage(1);
  };

  return (
    <PlayerLayout>
      <Seo title={t('nav.blogs')} />

      {/* The design's 1548px content column, the same one the lobby and the
          footer use; `--u` (set by PlayerLayout) scales it on a narrower
          desktop so the three-across grid stays three across. */}
      <div className="mx-auto max-w-[1548px] space-y-10 px-1 lg:max-w-[calc(var(--u)*1548)] lg:space-y-[calc(var(--u)*80)] lg:px-0">
        <section>
          {/* The frame has no page title — the banner opens it — but a page
              still needs one top-level heading. */}
          <h1 className="sr-only">{t('nav.blogs')}</h1>

          <div className="relative aspect-[1548/416] overflow-hidden rounded-[24px] lg:rounded-[calc(var(--u)*34)]">
            <Image
              src={blogHero}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 81vw, 98vw"
              className="object-cover"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3 lg:mt-[calc(var(--u)*35)] lg:gap-[calc(var(--u)*12)]">
            <button
              type="button"
              onClick={() => pick(null)}
              aria-pressed={category === null}
              className={`${CHIP} ${
                category === null
                  ? 'rl-chip-active font-rubik font-medium text-[#ffe779]'
                  : 'rl-chip text-[#9da2b4] hover:text-[#f0f1f5]'
              }`}
            >
              {t('blogs.all')}
            </button>

            {BLOG_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => pick(c)}
                aria-pressed={category === c}
                className={`${CHIP} ${
                  category === c
                    ? 'rl-chip-active font-rubik font-medium text-[#ffe779]'
                    : 'rl-chip text-[#9da2b4] hover:text-[#f0f1f5]'
                }`}
              >
                {t(BLOG_CATEGORY_LABELS[c])}
              </button>
            ))}
          </div>

          {/* 502 wide, 21 apart both ways — the design's three across. */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:mt-[calc(var(--u)*31)] lg:grid-cols-3 lg:gap-[calc(var(--u)*21)]">
            {shown.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>

          <div className="mt-8 lg:mt-[calc(var(--u)*51)]">
            <BlogPagination page={page} totalPages={BLOG_TOTAL_PAGES} onPage={setPage} />
          </div>
        </section>

        <SiteFooter />
      </div>
    </PlayerLayout>
  );
};

export default BlogsPage;
