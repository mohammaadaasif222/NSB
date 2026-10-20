/**
 * Operator details quoted by the Terms of Service and Privacy Policy.
 *
 * The bracketed values are placeholders, left visible on purpose: a legal page
 * naming an invented company or licence number is worse than one that plainly
 * has a blank in it. Fill these in — and have counsel review both documents
 * against the licence actually held — before the site takes real players.
 */
export const LEGAL = {
  brand: 'Rolluck',
  site: 'staging.xyzlife.top',
  /** The company that operates the site and holds the licence. */
  entity: '[Operator legal entity]',
  registeredAddress: '[Registered office address]',
  /** Issuing authority and licence number, as they should be quoted. */
  licence: '[Licensing authority and licence number]',
  /** The law the terms are governed by, and whose courts hear disputes. */
  jurisdiction: '[Governing jurisdiction]',
  minimumAge: 18,
  supportEmail: 'support@xyzlife.top',
  /** Where privacy requests go. Point at a dedicated mailbox if one exists. */
  privacyEmail: 'support@xyzlife.top',
  /** Shown as "Last updated" on both documents (ISO date; formatted per locale). */
  updated: '2026-09-19',
} as const;
