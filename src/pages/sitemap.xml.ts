import type { GetServerSideProps } from 'next';

import { GAME_SHELVES, categoryHref, gameHref } from '@/constants/games';
import { DEFAULT_LOCALE, INDEXED_STATIC_PATHS, absoluteUrl, localizedPath } from '@/constants/site';
import { fetchShelfList } from '@/services/games.server';
import { fetchLivePromotionSlugs } from '@/services/promotions.server';

const PAGE_SIZE = 50;
const MAX_PAGES = 200;
const CONCURRENCY = 3;
const CACHE_MS = 60 * 60 * 1000;

interface Catalogue {
  games: string[];
  promotions: string[];
  complete: boolean;
}

let cached: (Catalogue & { at: number }) | null = null;
let inflight: Promise<Catalogue> | null = null;

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

async function gameSlugs(): Promise<{ slugs: string[]; complete: boolean }> {
  const first = await fetchShelfList({}, 1, PAGE_SIZE);
  if (first.failed) {
    return { slugs: [], complete: false };
  }
  const lastPage = Math.min(first.pagination.totalPages, MAX_PAGES);
  const pages = [first];
  for (let start = 2; start <= lastPage; start += CONCURRENCY) {
    const batch = Array.from({ length: Math.min(CONCURRENCY, lastPage - start + 1) }, (_, i) =>
      fetchShelfList({}, start + i, PAGE_SIZE)
    );
    pages.push(...(await Promise.all(batch)));
  }
  return {
    slugs: pages.flatMap((page) => page.data.map((game) => game.slug)),
    complete: pages.every((page) => !page.failed),
  };
}

async function promotionSlugs(): Promise<{ slugs: string[]; complete: boolean }> {
  try {
    return { slugs: await fetchLivePromotionSlugs(), complete: true };
  } catch (error) {
    console.error('[sitemap] promotions failed:', error instanceof Error ? error.message : error);
    return { slugs: [], complete: false };
  }
}

async function fetchCatalogue(): Promise<Catalogue> {
  const [games, promotions] = await Promise.all([gameSlugs(), promotionSlugs()]);
  return {
    games: games.slugs,
    promotions: promotions.slugs,
    complete: games.complete && promotions.complete,
  };
}

async function catalogue(): Promise<Catalogue> {
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return cached;
  }
  inflight ??= fetchCatalogue().finally(() => {
    inflight = null;
  });
  const fresh = await inflight;
  if (fresh.complete) {
    cached = { ...fresh, at: Date.now() };
    return fresh;
  }
  return cached ?? fresh;
}

const Sitemap = (): null => null;

export const getServerSideProps: GetServerSideProps = async ({ res, locale }) => {
  const current = locale ?? DEFAULT_LOCALE;
  const { games, promotions, complete } = await catalogue();

  const paths = new Set<string>([
    ...INDEXED_STATIC_PATHS,
    ...GAME_SHELVES.map((shelf) => categoryHref(shelf.key)),
    ...games.map(gameHref),
    ...promotions.map((slug) => `/promotions/${encodeURIComponent(slug)}`),
  ]);

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...[...paths].map(
      (path) => `  <url><loc>${escapeXml(absoluteUrl(localizedPath(current, path)))}</loc></url>`
    ),
    '</urlset>',
    '',
  ].join('\n');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader(
    'Cache-Control',
    complete ? 'public, s-maxage=3600, stale-while-revalidate=86400' : 'public, s-maxage=300'
  );
  res.end(body);

  return { props: {} };
};

export default Sitemap;
