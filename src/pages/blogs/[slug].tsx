import type { FC } from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';

import PlayerLayout from '@/layout/PlayerLayout';
import SiteFooter from '@/components/player/SiteFooter';
import { ARROW_CLASS } from '@/components/player/ShelfHeading';
import { ChevronLeftIcon } from '@/components/icons';
import { useTranslation } from '@/context/I18nContext';
import type { TranslationKey } from '@/i18n/locales';
import { ARTICLE, findPost } from '@/constants/blogs';
import { SITE_NAME, SITE_URL, absoluteUrl, clip } from '@/constants/site';
import Seo, { type JsonLd } from '@/components/seo/Seo';

interface Props {
  /** An i18n key while the copy is the design's placeholder. */
  title: TranslationKey;
  image: StaticImageData;
}

/**
 * One article.
 *
 * PLACEHOLDER. There is no posts table and no CMS, so every slug opens the
 * same piece — the frame's own copy — under that post's own headline and
 * artwork. Give each post a `body` and a `publishedOn` in constants/blogs.ts
 * when they are real; nothing here has to change.
 */
const BlogDetailPage: FC<Props> = ({ title, image }) => {
  const { t, locale } = useTranslation();
  const heading = t(title);
  const publishedOn = new Date(ARTICLE.publishedOn).toLocaleDateString(locale, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  });
  const summary = clip(t(ARTICLE.body[0]));
  const article: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: heading,
    description: summary,
    image: [absoluteUrl(image.src)],
    datePublished: ARTICLE.publishedOn,
    author: { '@type': 'Organization', name: ARTICLE.author, url: `${SITE_URL}/` },
    publisher: { '@type': 'Organization', name: SITE_NAME, '@id': `${SITE_URL}/#organization` },
  };

  return (
    <PlayerLayout>
      <Seo
        title={heading}
        type="article"
        description={summary}
        image={image.src}
        imageAlt={heading}
        jsonLd={article}
      />

      <div className="mx-auto max-w-[1548px] space-y-10 px-1 lg:max-w-[calc(var(--u)*1548)] lg:space-y-[calc(var(--u)*80)] lg:px-0">
        <article>
          <div className="flex items-center gap-3 lg:gap-[calc(var(--u)*19)]">
            <Link
              href="/blogs"
              aria-label={t('blogs.back')}
              className={`${ARROW_CLASS} shrink-0 hover:bg-white/10`}
            >
              <ChevronLeftIcon size={20} />
            </Link>
            <h1 className="min-w-0 text-[20px] font-semibold leading-7 tracking-[-0.02em] text-[#f0f1f5] lg:text-[max(16px,calc(var(--u)*44))] lg:leading-[calc(var(--u)*52)]">
              {heading}
            </h1>
          </div>

          <div className="relative mt-4 aspect-[1548/416] overflow-hidden rounded-[24px] lg:mt-[calc(var(--u)*22)] lg:rounded-[calc(var(--u)*34)]">
            <Image
              src={image}
              alt={heading}
              fill
              priority
              sizes="(min-width: 1024px) 81vw, 98vw"
              className="object-cover"
            />
          </div>

          {/* 1156 of copy, 43 from a 346 rail — the design's two columns. */}
          <div className="mt-8 lg:mt-[calc(var(--u)*41)] lg:flex lg:gap-[calc(var(--u)*43)]">
            <div className="min-w-0 lg:w-[calc(var(--u)*1156)]">
              <p className="text-[16px] font-medium leading-7 text-[#f0f1f5] lg:text-[max(13px,calc(var(--u)*18))] lg:leading-[calc(var(--u)*28)]">
                {t('blogs.publishedBy', { date: publishedOn, author: ARTICLE.author })}
              </p>

              <div className="mt-4 space-y-6 lg:mt-[calc(var(--u)*17)] lg:space-y-[calc(var(--u)*24)]">
                {ARTICLE.body.map((para, i) => (
                  <p
                    key={i}
                    className="whitespace-pre-line text-[14px] leading-6 text-[#9da2b4] lg:text-[max(11px,calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]"
                  >
                    {t(para)}
                  </p>
                ))}
              </div>
            </div>

            {/* The frame draws this rail empty — reserved space, with nothing
                specified to put in it yet. Kept at its drawn size rather than
                guessed at, and left off phones where a blank panel would be
                the only thing on the screen. */}
            <aside
              aria-hidden="true"
              className="rl-glass-deep mt-8 hidden rounded-[24px] lg:mt-0 lg:block lg:h-[calc(var(--u)*562)] lg:w-[calc(var(--u)*346)] lg:shrink-0 lg:rounded-[calc(var(--u)*34)]"
            />
          </div>
        </article>

        <SiteFooter />
      </div>
    </PlayerLayout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const post = findPost(String(context.params?.slug ?? ''));
  if (!post) {
    return { notFound: true };
  }

  return { props: { title: post.title, image: post.image } };
};

export default BlogDetailPage;
