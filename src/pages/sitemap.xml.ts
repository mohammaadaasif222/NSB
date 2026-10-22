import type { GetServerSideProps } from 'next';

import { DEFAULT_LOCALE, SITE_URL } from '@/constants/site';
import { LOCALES } from '@/i18n/locales';

const SitemapIndex = (): null => null;

export const getServerSideProps: GetServerSideProps = async ({ res, locale }) => {
  if (locale && locale !== DEFAULT_LOCALE) {
    return { notFound: true };
  }

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...LOCALES.map((l) => `  <sitemap><loc>${SITE_URL}/sitemap/${l}.xml</loc></sitemap>`),
    '</sitemapindex>',
    '',
  ].join('\n');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400');
  res.end(body);

  return { props: {} };
};

export default SitemapIndex;
