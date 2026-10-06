import type { FC } from 'react';
import Head from 'next/head';

import PlayerLayout from '@/layout/PlayerLayout';
import SiteFooter from '@/components/player/SiteFooter';
import LegalPanel from '@/components/legal/LegalPanel';
import { LEGAL_UPDATED, PRIVACY, TERMS } from '@/components/legal/legalCopy';

/**
 * Terms and conditions, with the Privacy Policy under it.
 *
 * ONE PAGE CARRYING BOTH DOCUMENTS, because that is what the design draws.
 * Every other screen in the Figma file gets its own frame with its own nav,
 * rail and footer; this frame has one set of chrome and two glass panels, so
 * the two documents share a page and a single "Last Updated" line.
 *
 * `/privacy-policy` still resolves — it redirects to `#privacy-policy` here —
 * so the footer's separate Privacy link and any bookmark keep working. Giving
 * the policy its own page again is a small change if the client wants the two
 * URLs back; see the note in that file.
 *
 * Statically rendered: no data, no session, plain HTML for crawlers.
 */
const TermsAndConditions: FC = () => (
  <PlayerLayout>
    <Head>
      <title>Terms and conditions · ROLLUCK</title>
      <meta
        name="description"
        content="The terms that apply when you use Rolluck, and the Privacy Policy explaining what information we collect and how we protect it."
      />
    </Head>

    {/* The same 1544 frame the rest of the app lays itself out in. The design
        draws this page's panels at 1548 and its own footer at 1544 — four
        pixels of the designer's hand, not a rule, so the page keeps the width
        every other screen uses and stays aligned with them. */}
    <div className="mx-auto max-w-[1544px] pb-2">
      <header className="text-center">
        <h1 className="rl-h-section text-[#f4fffb]">Terms and conditions</h1>
        <p className="mt-1.5 text-base leading-6 text-white">{LEGAL_UPDATED}</p>
      </header>

      {/* 27 below the date in the design, and 24 between the two panels. */}
      <div className="mt-6.75 space-y-6">
        <LegalPanel doc={TERMS} />
        <LegalPanel doc={PRIVACY} />
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

export default TermsAndConditions;
