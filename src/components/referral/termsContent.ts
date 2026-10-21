import type { TranslationKey } from '@/i18n/locales';

/**
 * The summary terms the Referral page prints.
 *
 * NOT THE LEGAL DOCUMENT. `/terms-of-service` carries the real one, written
 * against how the product actually behaves; this is the short restatement the
 * design puts on this page, and the two are not the same words.
 *
 * That is a problem worth naming rather than hiding: two documents that both
 * read as "the terms" will drift, and the short one is the one a player sees
 * at the moment they are deciding to share a link. Either this becomes a
 * genuine summary that is reviewed alongside the full document, or the panel
 * links to `/terms-of-service` instead of restating it. Counsel's call, not
 * this file's — but it is kept in one place so it is a single edit either way.
 *
 * The words are the full document's own — the first nine Terms sections,
 * verbatim — so this reuses the `legal.terms.*` translation keys rather than
 * keeping a second copy of the same text in eight languages.
 */

export interface TermsSection {
  /** Numbered exactly as the design prints them. Translation key. */
  heading: TranslationKey;
  points: readonly TranslationKey[];
}

export const TERMS_INTRO: TranslationKey = 'legal.terms.intro';

export const TERMS_SECTIONS: readonly TermsSection[] = [
  {
    heading: 'ref.how.title',
    points: ['ref.how.p1', 'ref.how.p2', 'ref.how.p3', 'ref.how.p4', 'ref.how.p5'],
  },
  {
    heading: 'legal.terms.about.title',
    points: ['legal.terms.about.p1'],
  },
  {
    heading: 'legal.terms.eligibility.title',
    points: [
      'legal.terms.eligibility.p1',
      'legal.terms.eligibility.p2',
      'legal.terms.eligibility.p3',
    ],
  },
  {
    heading: 'legal.terms.account.title',
    points: [
      'legal.terms.account.p1',
      'legal.terms.account.p2',
      'legal.terms.account.p3',
      'legal.terms.account.p4',
    ],
  },
  {
    heading: 'legal.terms.deposits.title',
    points: [
      'legal.terms.deposits.p1',
      'legal.terms.deposits.p2',
      'legal.terms.deposits.p3',
      'legal.terms.deposits.p4',
    ],
  },
  {
    heading: 'legal.terms.games.title',
    points: ['legal.terms.games.p1', 'legal.terms.games.p2', 'legal.terms.games.p3'],
  },
  {
    heading: 'legal.terms.bonuses.title',
    points: ['legal.terms.bonuses.p1', 'legal.terms.bonuses.p2', 'legal.terms.bonuses.p3'],
  },
  {
    heading: 'legal.terms.rg.title',
    points: ['legal.terms.rg.p1', 'legal.terms.rg.p2', 'legal.terms.rg.p3'],
  },
  {
    heading: 'legal.terms.prohibited.title',
    points: ['legal.terms.prohibited.p1', 'legal.terms.prohibited.p2'],
  },
  {
    heading: 'legal.terms.suspension.title',
    points: ['legal.terms.suspension.p1', 'legal.terms.suspension.p2'],
  },
];
