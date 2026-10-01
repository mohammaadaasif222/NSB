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
      { source: '/login', destination: '/auth/login', permanent: true },
      { source: '/register', destination: '/auth/register', permanent: true },
      { source: '/reset-password', destination: '/auth/reset-password', permanent: true },
      { source: '/unauthorized', destination: '/auth/unauthorized', permanent: true },
      { source: '/games', destination: '/games/featured', permanent: false },
    ];
  },
};

export default nextConfig;
