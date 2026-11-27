import type { NextConfig } from 'next';
import { legacyRedirects, validateRedirects } from './data/redirects';
import { destinations, origin } from './data/destinations';
import { validateDestinations } from './lib/atlas/validate';

// The atlas refuses to build on a missing, placeholder, unsourced or
// mis-ordered coordinate, the same way the redirect map refuses a loop.
const atlasProblems = validateDestinations(origin, destinations);
if (atlasProblems.length > 0) {
  throw new Error('Atlas destinations are not safe to deploy: ' + atlasProblems.join('; '));
}

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Unmatched URLs fall outside both root layouts; this gives them a branded page.
  experimental: { globalNotFound: true },

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1672],
    // The photography is fixed and self-hosted, so a year is safe.
    minimumCacheTTL: 31_536_000,
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
        ],
      },
      {
        source: '/img/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        // Map data and the map's web worker: fetched early, reused when the map starts.
        source: '/data/journey/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
      {
        source: '/vendor/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=2592000' }],
      },
    ];
  },

  // The 301 map from the old Joomla site. Empty until HTH sends the URL export;
  // the build fails loudly rather than shipping a chain or a loop.
  async redirects() {
    const problems = validateRedirects(legacyRedirects);
    if (problems.length > 0) {
      throw new Error('Redirect map is not safe to deploy: ' + problems.join('; '));
    }
    return legacyRedirects;
  },
};

export default nextConfig;
