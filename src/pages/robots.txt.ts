import type { GetServerSideProps } from 'next';

import { DEFAULT_LOCALE, SITE_URL } from '@/constants/site';

const Robots = (): null => null;

export const getServerSideProps: GetServerSideProps = async ({ res, locale }) => {
  if (locale && locale !== DEFAULT_LOCALE) {
    return { notFound: true };
  }

  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /play/',
    'Disallow: /*/play/',
    'Disallow: /*?auth=',
    'Disallow: /*&auth=',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n');

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400');
  res.end(body);

  return { props: {} };
};

export default Robots;
