import type { GetServerSideProps, NextPage } from 'next';

import { localizedPath } from '@/constants/site';

/**
 * The Privacy Policy no longer has a page of its own.
 *
 * The design puts it on the Terms page — one frame, one set of chrome, two
 * glass panels — so that is where it lives, and this URL redirects into it
 * rather than serving the same text at a second address.
 *
 * Kept as a route rather than deleted because a privacy policy is the kind of
 * URL that ends up in licence paperwork, app-store listings and old emails.
 * 308 so those keep resolving and search engines move the record across.
 *
 * TO SPLIT THEM BACK APART: render `<LegalPanel doc={PRIVACY} />` here under a
 * "Privacy policy" heading — the panel component takes either document — and
 * drop the second panel from the Terms page.
 */
export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  redirect: {
    destination: localizedPath(locale ?? 'en', '/terms-of-service#privacy-policy'),
    permanent: true,
  },
});

/* Never rendered — the redirect happens before this would run. */
const PrivacyPolicy: NextPage = () => null;

export default PrivacyPolicy;
