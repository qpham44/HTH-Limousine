import type { MetadataRoute } from 'next';
import { site, indexable } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  // A staging host must not be crawled: its canonicals point at hth.com.vn,
  // so anything indexed here is a duplicate of a site that is not live yet.
  if (!indexable) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/api/' }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
