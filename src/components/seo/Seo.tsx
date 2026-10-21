import type { FC } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import {
  DEFAULT_LOCALE,
  DEFAULT_SHARE_IMAGE,
  NOINDEX_ROUTES,
  OG_LOCALES,
  SITE_NAME,
  absoluteUrl,
  localizedPath,
  localizedUrls,
  stripQuery,
} from '@/constants/site';
import type { Locale } from '@/i18n/locales';

export type JsonLd = Record<string, unknown>;

export interface SeoProps {
  title: string;
  bareTitle?: boolean;
  description?: string;
  path?: string;
  image?: string | null;
  imageAlt?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  card?: 'summary' | 'summary_large_image';
  hreflang?: boolean;
  jsonLd?: JsonLd | JsonLd[];
}

const serialize = (data: JsonLd): string => JSON.stringify(data).replace(/</g, '\\u003c');

const Seo: FC<SeoProps> = ({
  title,
  bareTitle = false,
  description,
  path,
  image,
  imageAlt,
  type = 'website',
  noindex = false,
  card = 'summary_large_image',
  hreflang = true,
  jsonLd,
}) => {
  const { asPath, pathname, locale: routerLocale } = useRouter();
  const locale = (routerLocale ?? DEFAULT_LOCALE) as Locale;
  const fullTitle = bareTitle ? title : `${title} · ${SITE_NAME}`;
  const hidden = noindex || NOINDEX_ROUTES.has(pathname);
  const basePath = path ?? stripQuery(asPath);
  const url = absoluteUrl(localizedPath(locale, basePath));
  const alternates = hidden || !hreflang ? [] : localizedUrls(basePath);
  const shareImage = absoluteUrl(image || DEFAULT_SHARE_IMAGE.url);
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Head>
      <title>{fullTitle}</title>
      {description && <meta key="description" name="description" content={description} />}
      {hidden ? (
        <meta key="indexing" name="robots" content="noindex, follow" />
      ) : (
        <link key="indexing" rel="canonical" href={url} />
      )}
      {alternates.map((alt) => (
        <link key={`hreflang-${alt.locale}`} rel="alternate" hrefLang={alt.locale} href={alt.url} />
      ))}
      {alternates.length > 0 && (
        <link
          key="hreflang-x-default"
          rel="alternate"
          hrefLang="x-default"
          href={absoluteUrl(basePath)}
        />
      )}
      <meta key="og:locale" property="og:locale" content={OG_LOCALES[locale] ?? OG_LOCALES.en} />
      <meta key="og:title" property="og:title" content={title} />
      {description && <meta key="og:description" property="og:description" content={description} />}
      <meta key="og:type" property="og:type" content={type} />
      <meta key="og:url" property="og:url" content={url} />
      <meta key="og:image" property="og:image" content={shareImage} />
      <meta key="og:image:alt" property="og:image:alt" content={imageAlt ?? title} />
      <meta key="twitter:card" name="twitter:card" content={card} />
      {blocks.map((block, i) => (
        <script
          key={`jsonld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialize(block) }}
        />
      ))}
    </Head>
  );
};

export default Seo;
