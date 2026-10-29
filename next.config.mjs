/**
 * Every host an image may be loaded from. Most are game artwork: each
 * aggregator's catalogue sync stores its own CDN's URLs, so integrating a new
 * aggregator means adding its image host here — otherwise its tiles fail to
 * load.
 */
const REMOTE_IMAGE_HOSTS = [
  'mediumrare.imgix.net',
  // Alea Play
  'thumbs.alea.com',
  // Pragmatic Play. Mirrors PP_ICON_BASE_URL in the backend's
  // `pragmatic-play.config.ts`; if that env var is overridden, add its host too.
  'common-static.ppgames.net',
  // Tequity staging CDN. Also catches the fake fallback URL our mapper used
  // to generate for games Tequity didn't send artwork for — kept here so a
  // stale DB row with that URL does not crash the SSR render even after the
  // mapper stopped producing it. Those rows null-out on the next catalog
  // sync; this whitelist entry can be removed once Tequity publishes a real
  // asset host.
  'cdn.tech0189.tech',
  // Our own asset bucket: the site artwork marketing re-exports without a
  // deploy. Mirrors ASSET_CDN in `src/constants/cdn.ts` — the two have to
  // move together, and both still point at the staging bucket.
  'rolluck-staging-assets-2026.fra1.cdn.digitaloceanspaces.com',
  'i.ytimg.com',
  'luckmedia.link',
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  i18n: {
    locales: ['en', 'ar', 'tr', 'hi', 'fr', 'ru', 'pt', 'es', 'it'],
    defaultLocale: 'en',
    localeDetection: false,
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }],
      },
      {
        source: '/fonts/:file*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },

  webpack(config, { isServer, webpack }) {
    if (!isServer) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/[\\/]dictionaries\.server$/, (resource) => {
          resource.request = resource.request.replace(
            /dictionaries\.server$/,
            'dictionaries.client'
          );
        })
      );
    }
    return config;
  },

  eslint: {
    // Linting runs as its own `npm run lint` step; don't fail production builds
    // on formatting warnings.
    ignoreDuringBuilds: true,
  },

  images: {
    // next/image refuses any remote host that is not listed here: an
    // allowlist, so a compromised API cannot turn the image optimiser into an
    // open proxy for arbitrary URLs.
    remotePatterns: REMOTE_IMAGE_HOSTS.map((hostname) => ({
      protocol: 'https',
      hostname,
      pathname: '/**',
    })),
  },

  // The auth pages live under /auth and the lobby at / is the dashboard.
  // Old bookmarks land on the right page instead of a 404.
  async redirects() {
    return [
      { source: '/dashboard', destination: '/', permanent: true },
      { source: '/affiliate', destination: '/referral', permanent: true },
      // Login, registration and password reset are modals now; the query
      // string opens the right one on the lobby, and any ?mobile= prefill
      // passes straight through.
      { source: '/login', destination: '/?auth=login', permanent: false },
      { source: '/auth/login', destination: '/?auth=login', permanent: false },
      { source: '/reset-password', destination: '/?auth=forgot', permanent: false },
      { source: '/auth/reset-password', destination: '/?auth=forgot', permanent: false },
      { source: '/register', destination: '/?auth=register', permanent: false },
      { source: '/auth/register', destination: '/?auth=register', permanent: false },
      { source: '/unauthorized', destination: '/auth/unauthorized', permanent: true },
      { source: '/games', destination: '/games/featured', permanent: false },
      // The placeholder Responsible Play page became the real tools, under the
      // name the footer and the terms of service have always used for it.
      { source: '/responsible-play', destination: '/responsible-gambling', permanent: true },
    ];
  },
};

export default nextConfig;
