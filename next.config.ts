import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const config: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  
  // Performance: Compress responses
  compress: true,

  async headers() {
    return [
      {
        // Security + Performance headers for all routes
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; media-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com https://wttr.in https://www.google-analytics.com https://www.googletagmanager.com https://www.soundhelix.com; frame-src 'self' https://www.youtube.com;" },
        ],
      },
      {
        // Aggressive caching for post images
        source: '/posts/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
        ],
      },
      {
        // Icon images caching
        source: '/icons/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
        ],
      },
      {
        // Service worker - always fresh, never cached
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        // Manifest - short cache so icon updates show quickly
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
    ];
  },
};

import { withSentryConfig } from '@sentry/nextjs';

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})(config);

export default withSentryConfig(pwaConfig, {
  silent: true,
  org: 'apna-nimboda',
  project: 'apna-nimboda',
});
