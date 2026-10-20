/**
 * Temporary launch switch: while false, every category URL (/[vertical]/**) shows "Coming soon"
 * and only the home page is live. Flip to true to re-enable the category, listing and vendor pages.
 */
export const CATEGORY_PAGES_ENABLED = true;

/** Metadata for category routes while they are switched off. */
export const COMING_SOON_METADATA = { title: "Coming soon", robots: { index: false, follow: true } };
