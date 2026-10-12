import type { FC, ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';

import PlayerLayout from '@/layout/PlayerLayout';
import SiteFooter from '@/components/player/SiteFooter';
import { ChevronDownIcon, ChevronRightIcon } from '@/components/icons';
import { LEGAL } from '@/constants/legal';
import { useTranslation } from '@/context/I18nContext';

export interface LegalSection {
  /** Anchor id — also what other pages deep-link to (`/terms-of-service#bonuses`). */
  id: string;
  title: string;
  body: ReactNode;
}

interface Props {
  title: string;
  /** One or two sentences above the sections: what this document covers. */
  intro: ReactNode;
  sections: LegalSection[];
  /** The companion document, linked from the header. */
  related: { href: string; label: string };
}

/* ==================================================================== */
/* Typography                                                            */
/*                                                                       */
/* There is no typography plugin in the build, so the few text styles    */
/* the documents need are small components rather than a `prose` class.   */
/* ==================================================================== */

export const P: FC<{ children: ReactNode }> = ({ children }) => (
  <p className="text-[13.5px] leading-[1.8] text-white/65">{children}</p>
);

export const List: FC<{ items: ReactNode[] }> = ({ items }) => (
  <ul className="space-y-2 ps-1">
    {items.map((item, i) => (
      <li key={i} className="flex gap-3 text-[13.5px] leading-[1.75] text-white/65">
        <span
          className="mt-[0.7em] h-1 w-1 flex-shrink-0 rounded-full bg-[#fcd535]"
          aria-hidden="true"
        />
        <span className="min-w-0">{item}</span>
      </li>
    ))}
  </ul>
);

/** Emphasis inside body copy — a term being defined, or a figure that matters. */
export const Strong: FC<{ children: ReactNode }> = ({ children }) => (
  <strong className="font-semibold text-white/90">{children}</strong>
);

/** An in-copy link, internal or mail. */
export const A: FC<{ href: string; children: ReactNode }> = ({ href, children }) => {
  const className =
    'font-medium text-[#fcd535] underline decoration-[#fcd535]/35 underline-offset-2 transition-colors hover:decoration-[#fcd535]';
  return href.startsWith('/') ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className}>
      {children}
    </a>
  );
};

/* ==================================================================== */
/* The document                                                          */
/* ==================================================================== */

const TocLinks: FC<{ sections: LegalSection[] }> = ({ sections }) => (
  <ol className="space-y-0.5">
    {sections.map((s, i) => (
      <li key={s.id}>
        <a
          href={`#${s.id}`}
          className="flex gap-2.5 rounded-lg px-2.5 py-1.5 text-[12.5px] leading-snug text-white/55 transition-colors hover:bg-white/5 hover:text-white"
        >
          <span className="w-4 flex-shrink-0 text-end tabular-nums text-white/30">{i + 1}.</span>
          <span className="min-w-0">{s.title}</span>
        </a>
      </li>
    ))}
  </ol>
);

/**
 * A long-form legal page: header, table of contents, numbered sections.
 *
 * The contents sit in a sticky column beside the text from `lg` up, where
 * there is room for both; below that they fold into a disclosure above the
 * text, so a phone does not have to scroll past a dozen links to reach the
 * first paragraph. Section anchors carry a scroll margin so a jump lands
 * below the sticky bar rather than underneath it.
 *
 * Statically rendered — there is no getServerSideProps — so the documents are
 * plain HTML for crawlers and cost the server nothing per request.
 */
const LegalDocument: FC<Props> = ({ title, intro, sections, related }) => {
  const { t, locale } = useTranslation();
  const updated = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${LEGAL.updated}T00:00:00Z`));

  return (
    <PlayerLayout>
      <Head>
        <title>{`${title} — ROLLUCK`}</title>
      </Head>

      <div className="mx-auto max-w-[1180px] space-y-4 sm:space-y-5">
        {/* --- Header ------------------------------------------------------ */}
        <header className="rl-glass rounded-2xl px-5 py-6 sm:px-8 sm:py-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#fcd535]">
            {t('legal.doc.eyebrow')}
          </p>
          <h1 className="mt-2 text-[26px] font-semibold leading-tight text-white sm:text-[32px]">
            {title}
          </h1>
          <p className="mt-2 text-[12px] text-white/40">
            {t('legal.doc.lastUpdated', { date: updated })}
          </p>
          <div className="mt-5 max-w-3xl text-[14px] leading-[1.8] text-white/65">{intro}</div>
          <Link
            href={related.href}
            className="rl-btn-ghost mt-5 inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[12.5px] font-medium"
          >
            {related.label}
            <ChevronRightIcon size={13} />
          </Link>
        </header>

        <div className="grid items-start gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-5">
          {/* --- Contents ---------------------------------------------------- */}
          <nav aria-label={t('legal.doc.contents')} className="lg:sticky lg:top-[94px]">
            <details className="rl-glass group rounded-2xl lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 text-[13px] font-medium text-white">
                {t('legal.doc.onThisPage')}
                <ChevronDownIcon
                  size={14}
                  className="text-white/45 transition-transform group-open:rotate-180"
                />
              </summary>
              <div className="border-t border-white/[0.07] p-2">
                <TocLinks sections={sections} />
              </div>
            </details>

            <div className="rl-glass hidden rounded-2xl p-3 lg:block">
              <p className="px-2.5 pb-2 pt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-white/35">
                {t('legal.doc.onThisPage')}
              </p>
              <TocLinks sections={sections} />
            </div>
          </nav>

          {/* --- Body -------------------------------------------------------- */}
          <article className="rl-glass rounded-2xl px-5 py-2 sm:px-8">
            {sections.map((s, i) => (
              <section
                key={s.id}
                id={s.id}
                className="scroll-mt-28 border-b border-white/[0.06] py-6 last:border-b-0 sm:py-7"
              >
                <h2 className="flex gap-3 text-[17px] font-semibold text-white sm:text-[18px]">
                  <span className="tabular-nums text-[#fcd535]">{i + 1}.</span>
                  {s.title}
                </h2>
                <div className="mt-3.5 space-y-3.5">{s.body}</div>
              </section>
            ))}
          </article>
        </div>

        <SiteFooter />
      </div>
    </PlayerLayout>
  );
};

export default LegalDocument;
