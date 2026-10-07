import type { BlogPost } from '@/components/blogs/BlogCard';

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
  tag: 'Casino',
  title: 'Worst Odds in Casino: Games You Should Avoid',
  excerpt:
    'Learn about casino games with the worst odds, including slots, keno, and wheel of fortune. Find out which games give the house a bigger',
  date: '21 Jan 2026',
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
  publishedOn: 'Jan 21, 2025',
  author: 'Rolluck',
  body: [
    "Casino games can be fun, but some offer terrible chances of winning. I want to tell you about the worst odds in casino games so you can make better choices with your money. Slots are the most common trap. They have a house edge between 2% and 15%. While playing slots is simple, you can't use any strategy to win. The results are random, and the casino always has an advantage.",
    'Keno gives players the worst chances. The house edge ranges from 20% to 40%, making it nearly impossible to win in the long run.\nYou pick numbers from 1 to 80, but the odds are stacked heavily against you. The Wheel of Fortune isn’t much better. When you bet on the $1 space, which seems safest, the house still has an 11% edge.',
    'Betting on the joker space is even worse, with a 24% house advantage. If you want better chances of winning, try games that need skill. Many players who visit online casino sites prefer games like blackjack or video poker because they can use strategy to improve their odds.',
    'Remember that casinos design these games to make money. While you might get lucky and win sometimes, the house always has an advantage. Set a budget before playing and stick to it.',
    'Your goal should be entertainment, not making money.',
    'The best approach is to play the games you enjoy but know your limits. The longer you play games with bad odds, the more likely you are to lose money.\nChoose games that make your money last longer and give you more play time for your budget.',
  ],
} as const;
