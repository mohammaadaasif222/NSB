import type { JsonLd } from '@/components/seo/Seo';
import { absoluteUrl, localizedPath } from '@/constants/site';

export const breadcrumbJsonLd = (
  locale: string,
  crumbs: { name: string; path: string }[]
): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((crumb, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: crumb.name,
    item: absoluteUrl(localizedPath(locale, crumb.path)),
  })),
});
