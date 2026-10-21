import type { FC } from 'react';
import type { GetServerSideProps } from 'next';

import PlayerLayout from '@/layout/PlayerLayout';
import SiteFooter from '@/components/player/SiteFooter';
import LegalPanel from '@/components/legal/LegalPanel';
import type { LegalPageData } from '@/components/legal/legalContent';
import { fetchLegalPagesServer } from '@/services/legalPages.server';
import { useTranslation } from '@/context/I18nContext';
import Seo from '@/components/seo/Seo';

interface Props {
  pages: LegalPageData[];
  updatedAt: string | null;
}

/**
 * Terms and conditions, with the Privacy Policy under it.
 *
 * DYNAMIC: every panel is a page written in the admin console (CRM → Terms and
 * conditions), in the order set there, and "Last Updated" is the latest edit
 * among them. The page itself can be switched off from System config (CRM);
 * when it is, this route is a 404 and the footer links are gone.
 *
 * Rendered per request rather than statically so an edit — or the switch —
 * shows without a rebuild.
 *
 * `/privacy-policy` still resolves — it redirects to `#privacy-policy` here —
 * so the footer's separate Privacy link and any bookmark keep working. That
 * anchor is the slug of the page of that name.
 */
const TermsAndConditions: FC<Props> = ({ pages, updatedAt }) => {
  const { t, locale } = useTranslation();
  const updated = updatedAt
    ? new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(updatedAt))
    : null;

  return (
    <PlayerLayout>
      <Seo title={t('legal.page.title')} description={t('legal.page.metaDescription')} />

      {/* The same 1544 frame the rest of the app lays itself out in. The design
        draws this page's panels at 1548 and its own footer at 1544 — four
        pixels of the designer's hand, not a rule, so the page keeps the width
        every other screen uses and stays aligned with them. */}
      <div className="mx-auto max-w-[1544px] pb-2">
        <header className="text-center">
          <h1 className="rl-h-section text-[#f4fffb]">{t('legal.page.title')}</h1>
          {updated && (
            <p className="mt-1.5 text-base leading-6 text-white">
              {t('legal.updated', { date: updated })}
            </p>
          )}
        </header>

        {/* 27 below the date in the design, and 24 between the panels. */}
        <div className="mt-6.75 space-y-6">
          {pages?.map((page) => (
            <LegalPanel key={page.id} page={page} />
          ))}
        </div>

        {/* The design leaves 202 here — far more than the 75–114 the Responsible
          Gambling frames use, and deliberate: it is the end of a long read.
          Stepped down with the rest of the furniture below 1536. */}
        <div className="mt-25 2xl:mt-50">
          <SiteFooter />
        </div>
      </div>
    </PlayerLayout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ res }) => {
  try {
    const { enabled, pages, updated_at } = await fetchLegalPagesServer();
    if (!enabled) {
      return { notFound: true };
    }
    // Short shared cache: edits show within a minute, and the API is not hit
    // once per visitor.
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    return { props: { pages, updatedAt: updated_at } };
  } catch {
    // API unreachable: an empty page would read as "the terms are blank".
    res.statusCode = 503;
    return { props: { pages: [], updatedAt: null } };
  }
};

export default TermsAndConditions;
