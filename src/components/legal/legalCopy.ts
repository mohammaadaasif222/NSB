import type { TranslationKey } from '@/i18n/locales';

/**
 * The Terms and Privacy copy, exactly as the design writes it.
 *
 * THIS REPLACED A LONGER PAIR OF DOCUMENTS and the difference matters.
 *
 * What was here before was written against how the product actually behaves —
 * per-currency crypto wallets, provably fair Originals, bonus wagering, VIP
 * tiers measured in UTC cycles, the self-exclusion cooling-off rule, the three
 * sign-in providers, the QR service that sees deposit addresses. None of that
 * survives in the copy below, which is short and generic. That is the client's
 * text and it is what the design prints, so it is what ships; but it is a
 * smaller promise than the product makes, and counsel should read the two
 * together before launch rather than treating this as a finished document.
 *
 * Two concrete gaps worth naming, because code points at them:
 *   - There is no sports-betting section. The footer used to deep-link
 *     `#sports-betting`; that anchor no longer exists.
 *   - "Last Updated: August 2026" is the design's own date, carried verbatim.
 *
 * Section ids are ours, not the design's — the design numbers its headings and
 * nothing more. They exist so the footer and other pages can deep-link.
 */

export type LegalBody =
  { kind: 'p'; text: TranslationKey } | { kind: 'ul'; items: readonly TranslationKey[] };

export interface LegalSection {
  id: string;
  /** Printed with its number, exactly as the design writes it. */
  title: TranslationKey;
  body: readonly LegalBody[];
}

/**
 * Every string here is a translation key (see `src/i18n/modules/legal.ts`);
 * `LegalPanel` resolves them, so the documents follow the chosen language.
 */
export interface LegalDoc {
  id: string;
  intro: TranslationKey;
  sections: readonly LegalSection[];
  /** The bold lines the design closes each document with. */
  signOff: readonly TranslationKey[];
}

const p = (text: TranslationKey): LegalBody => ({ kind: 'p', text });
const ul = (items: readonly TranslationKey[]): LegalBody => ({ kind: 'ul', items });

/** A section that is a title and nothing but paragraphs. */
const paras = (id: string, title: TranslationKey, ...texts: TranslationKey[]): LegalSection => ({
  id,
  title,
  body: texts.map(p),
});

/**
 * The design prints this once, under the page title, as "Last Updated: August
 * 2026" — the design's own date, carried verbatim. Formatted per locale where
 * it is rendered (month and year only).
 */
export const LEGAL_UPDATED = new Date(Date.UTC(2026, 7, 1));

export const TERMS: LegalDoc = {
  id: 'terms-and-conditions',
  intro: 'legal.terms.intro',
  sections: [
    paras('about', 'legal.terms.about.title', 'legal.terms.about.p1'),
    paras(
      'eligibility',
      'legal.terms.eligibility.title',
      'legal.terms.eligibility.p1',
      'legal.terms.eligibility.p2',
      'legal.terms.eligibility.p3'
    ),
    paras(
      'your-account',
      'legal.terms.account.title',
      'legal.terms.account.p1',
      'legal.terms.account.p2',
      'legal.terms.account.p3',
      'legal.terms.account.p4'
    ),
    paras(
      'deposits-withdrawals',
      'legal.terms.deposits.title',
      'legal.terms.deposits.p1',
      'legal.terms.deposits.p2',
      'legal.terms.deposits.p3',
      'legal.terms.deposits.p4'
    ),
    paras(
      'games-results',
      'legal.terms.games.title',
      'legal.terms.games.p1',
      'legal.terms.games.p2',
      'legal.terms.games.p3'
    ),
    paras(
      'bonuses-promotions',
      'legal.terms.bonuses.title',
      'legal.terms.bonuses.p1',
      'legal.terms.bonuses.p2',
      'legal.terms.bonuses.p3'
    ),
    paras(
      'responsible-gaming',
      'legal.terms.rg.title',
      'legal.terms.rg.p1',
      'legal.terms.rg.p2',
      'legal.terms.rg.p3'
    ),
    paras(
      'prohibited-activities',
      'legal.terms.prohibited.title',
      'legal.terms.prohibited.p1',
      'legal.terms.prohibited.p2'
    ),
    paras(
      'suspension-closure',
      'legal.terms.suspension.title',
      'legal.terms.suspension.p1',
      'legal.terms.suspension.p2'
    ),
    paras(
      'intellectual-property',
      'legal.terms.ip.title',
      'legal.terms.ip.p1',
      'legal.terms.ip.p2'
    ),
    paras(
      'availability',
      'legal.terms.availability.title',
      'legal.terms.availability.p1',
      'legal.terms.availability.p2'
    ),
    paras(
      'changes',
      'legal.terms.changes.title',
      'legal.terms.changes.p1',
      'legal.terms.changes.p2'
    ),
    paras('contact', 'legal.terms.contact.title', 'legal.terms.contact.p1'),
  ],
  signOff: ['legal.terms.signOff'],
};

export const PRIVACY: LegalDoc = {
  id: 'privacy-policy',
  intro: 'legal.privacy.intro',
  sections: [
    {
      id: 'information-we-collect',
      title: 'legal.privacy.collect.title',
      body: [
        p('legal.privacy.collect.p1'),
        ul([
          'legal.privacy.collect.i1',
          'legal.privacy.collect.i2',
          'legal.privacy.collect.i3',
          'legal.privacy.collect.i4',
          'legal.privacy.collect.i5',
          'legal.privacy.collect.i6',
          'legal.privacy.collect.i7',
          'legal.privacy.collect.i8',
          'legal.privacy.collect.i9',
          'legal.privacy.collect.i10',
        ]),
      ],
    },
    {
      id: 'how-we-use',
      title: 'legal.privacy.use.title',
      body: [
        p('legal.privacy.use.p1'),
        ul([
          'legal.privacy.use.i1',
          'legal.privacy.use.i2',
          'legal.privacy.use.i3',
          'legal.privacy.use.i4',
          'legal.privacy.use.i5',
          'legal.privacy.use.i6',
          'legal.privacy.use.i7',
          'legal.privacy.use.i8',
          'legal.privacy.use.i9',
          'legal.privacy.use.i10',
          'legal.privacy.use.i11',
        ]),
      ],
    },
    paras(
      'cookies',
      'legal.privacy.cookies.title',
      'legal.privacy.cookies.p1',
      'legal.privacy.cookies.p2'
    ),
    paras(
      'how-we-share',
      'legal.privacy.share.title',
      'legal.privacy.share.p1',
      'legal.privacy.share.p2'
    ),
    paras(
      'protecting-your-information',
      'legal.privacy.protect.title',
      'legal.privacy.protect.p1',
      'legal.privacy.protect.p2'
    ),
    paras(
      'data-retention',
      'legal.privacy.retention.title',
      'legal.privacy.retention.p1',
      'legal.privacy.retention.p2'
    ),
    {
      id: 'your-privacy-rights',
      title: 'legal.privacy.rights.title',
      body: [
        p('legal.privacy.rights.p1'),
        ul([
          'legal.privacy.rights.i1',
          'legal.privacy.rights.i2',
          'legal.privacy.rights.i3',
          'legal.privacy.rights.i4',
          'legal.privacy.rights.i5',
          'legal.privacy.rights.i6',
        ]),
        p('legal.privacy.rights.p2'),
      ],
    },
    paras(
      'childrens-privacy',
      'legal.privacy.children.title',
      'legal.privacy.children.p1',
      'legal.privacy.children.p2'
    ),
    paras(
      'international-transfers',
      'legal.privacy.transfers.title',
      'legal.privacy.transfers.p1',
      'legal.privacy.transfers.p2'
    ),
    paras(
      'third-party-services',
      'legal.privacy.thirdParty.title',
      'legal.privacy.thirdParty.p1',
      'legal.privacy.thirdParty.p2'
    ),
    paras(
      'policy-changes',
      'legal.privacy.changes.title',
      'legal.privacy.changes.p1',
      'legal.privacy.changes.p2'
    ),
    paras('privacy-contact', 'legal.privacy.contact.title', 'legal.privacy.contact.p1'),
  ],
  signOff: ['legal.privacy.signOff1', 'legal.privacy.signOff2', 'legal.privacy.signOff3'],
};
