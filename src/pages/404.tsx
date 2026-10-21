import type { FC } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/I18nContext';
import Seo from '@/components/seo/Seo';

/**
 * 404.
 *
 * No nav, no rail, no footer — the design draws a bare centred block on the
 * stage, and a page that could not be found is the wrong place to offer a
 * sidebar full of other places. One way out, and it is the homepage.
 *
 * The design sets the four text nodes in Inter and the button's label in
 * Onest. Inter is Figma's default for an unstyled text node, the label is the
 * only one carrying a named style from the design system ("Paragraph/Regular/
 * Medium"), and every other frame in the file is Onest throughout — so this is
 * drawn in Onest. Shipping Inter would mean a second webfont for one page.
 *
 * The stage here is the app's own near-black rather than the #030407 the frame
 * is drawn on. Four points darker across each channel is invisible on its own,
 * but this page is always arrived at FROM another one, and a background that
 * shifts on the way in is the one thing you would notice.
 */
const NotFound: FC = () => {
  const { t } = useTranslation();

  return (
    /* `py-10` never bites at the design's 1080 — it only stops the block
       touching the top edge on a window too short to centre it in, where the
       page scrolls instead. */
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--rl-stage)] px-6 py-10 text-center">
      <Seo title={t('notFound.eyebrow')} noindex />

      {/* The design's block is 680 wide and vertically centred in the frame.
          Its measurements hold from 768 up, where the 40px line still fits;
          below that everything steps down rather than the layout changing. */}
      <p className="text-base leading-6 text-white/70 md:text-xl">{t('notFound.eyebrow')}</p>

      <h1 className="mt-7 text-[88px] leading-[106px] font-bold text-white md:text-[132px] md:leading-[160px]">
        404
      </h1>

      <p className="mt-7 text-[28px] leading-9 font-medium text-white md:text-[40px] md:leading-12">
        {t('notFound.title')}
      </p>

      {/* Two lines in the design, hard-broken. Kept as two paragraphs so a
          phone reflows the first one instead of overflowing it. */}
      <div className="mt-11.25 text-base leading-6 text-white/70 md:text-xl">
        <p>{t('notFound.body1')}</p>
        <p>{t('notFound.body2')}</p>
      </div>

      {/* 468 × 63 at a 16 radius, filled flat #4d4d4d — not the app's gold.
          The design keeps the one way out quiet, and a 404 is not a place to
          shout. Full width on a phone, where 468 would not fit. */}
      <Link
        href="/"
        className="mt-14.75 flex h-14 w-full max-w-[468px] items-center justify-center rounded-2xl bg-[#4d4d4d] text-base leading-6 font-medium text-white transition-colors hover:bg-[#5a5a5a] md:h-[63px]"
      >
        {t('notFound.cta')}
      </Link>
    </div>
  );
};

export default NotFound;
