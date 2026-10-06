/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  eslint: {
    // Linting runs as its own `npm run lint` step; don't fail production builds
    // on formatting warnings.
    ignoreDuringBuilds: true,
  },

  images: {
    // Game tile artwork is CDN-hosted. next/image refuses any remote host that
    // is not listed here: an allowlist, so a compromised API cannot turn the
    // image optimiser into an open proxy for arbitrary URLs.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mediumrare.imgix.net',
        pathname: '/**',
      },
    ],
  },

  // The auth pages live under /auth and the lobby at / is the dashboard.
  // Old bookmarks land on the right page instead of a 404.
  async redirects() {
    return [
      { source: '/dashboard', destination: '/', permanent: true },
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
