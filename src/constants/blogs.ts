import type { BlogPost } from '@/components/blogs/BlogCard';
import type { TranslationKey } from '@/i18n/locales';

import blog1 from '@/assets/blogs/blog-1.webp';
import blog2 from '@/assets/blogs/blog-2.webp';
import blog3 from '@/assets/blogs/blog-3.webp';
import blog4 from '@/assets/blogs/blog-4.webp';
import blog5 from '@/assets/blogs/blog-5.webp';
import blog6 from '@/assets/blogs/blog-6.webp';
import blog7 from '@/assets/blogs/blog-7.webp';
import blog8 from '@/assets/blogs/blog-8.webp';
import blog9 from '@/assets/blogs/blog-9.webp';

/** The frame's nine photos, in its reading order. */
const ART = [blog1, blog2, blog3, blog4, blog5, blog6, blog7, blog8, blog9];

/**
 * The eight category chips the design lists, in its order and its spelling —
 * "Sportbook" is the frame's, not a typo introduced here.
 *
 * "All articles" is not one of them: it is the cleared state, so the page
 * holds it as `null` and labels the chip from i18n.
 */
export const BLOG_CATEGORIES = [
  'Rolluck Inside',
  'Casino',
  'Sportbook',
  'VIP Club',
  'Ambassadors',
  'Rolluck Charity',
  'Crypto',
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

/** What each chip reads in the active language. The values above stay the filter ids. */
export const BLOG_CATEGORY_LABELS: Record<BlogCategory, TranslationKey> = {
  'Rolluck Inside': 'content.blogs.cat.inside',
  Casino: 'nav.casino',
  Sportbook: 'content.blogs.cat.sportsbook',
  'VIP Club': 'nav.vipClub',
  Ambassadors: 'content.blogs.cat.ambassadors',
  'Rolluck Charity': 'content.blogs.cat.charity',
  Crypto: 'content.blogs.cat.crypto',
};

export interface BlogRow extends BlogPost {
  category: BlogCategory;
}

/**
 * The nine cards the design draws.
 *
 * PLACEHOLDER. There is no posts table, no CMS and no endpoint, so the
 * headline, the excerpt, the date and the tag are the frame's own, repeated
 * nine times exactly as the frame repeats them.
 *
 * The nine photos ARE the frame's own, one per card. They are per-instance
 * fills, so they only come out of Figma with Code Connect switched off, and
 * they arrive as full-resolution source files — 16MB across the nine, one of
 * them 10.8MB alone. They are committed re-encoded to WebP at 1004px, twice
 * the 502 the card is drawn at, which is 716KB for the set.
 *
 * The categories are spread across the chips so they filter something rather
 * than sitting inert. The frame draws every card tagged "Casino", which is
 * what the cleared "All articles" state shows either way.
 */
export const BLOG_POSTS: readonly BlogRow[] = Array.from({ length: 9 }, (_, i) => ({
  id: `post-${i + 1}`,
  image: ART[i],
  tag: 'nav.casino',
  title: 'content.blogs.post.title',
  excerpt: 'content.blogs.post.excerpt',
  date: '2026-01-21',
  category: BLOG_CATEGORIES[i % BLOG_CATEGORIES.length],
}));

/** The design draws four pages under a nine-card grid. */
export const BLOG_TOTAL_PAGES = 4;

export const findPost = (id: string): BlogRow | undefined => BLOG_POSTS.find((p) => p.id === id);

/**
 * The article body, straight from the "Blog Deatils" frame.
 *
 * PLACEHOLDER, and shared: with no CMS behind the route every post opens the
 * same piece, which is what the frame shows too. Give each post its own
 * `body` and `publishedOn` when they are real.
 */
export const ARTICLE = {
  /** ISO date — the page writes it out per locale. */
  publishedOn: '2025-01-21',
  author: 'Rolluck',
  body: [
    'content.blogs.article.p1',
    'content.blogs.article.p2',
    'content.blogs.article.p3',
    'content.blogs.article.p4',
    'content.blogs.article.p5',
    'content.blogs.article.p6',
  ],
} as const;
