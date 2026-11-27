import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { pagePairs } from '@/lib/routeMap';

/**
 * Both languages, with each entry declaring its counterpart so search engines
 * see the pair rather than two unrelated pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const priorityFor = (path: string) => {
    if (path === '/' || path === '/en') return 1;
    if (path.includes('book') || path.includes('dat-xe') || path.includes('gia') || path.includes('rates')) return 0.9;
    if (path.split('/').filter(Boolean).length <= (path.startsWith('/en') ? 2 : 1)) return 0.8;
    return 0.7;
  };

  return pagePairs.flatMap((pair) =>
    (['vi', 'en'] as const).map((locale) => {
      const path = pair[locale];
      return {
        url: `${site.url}${path === '/' ? '' : path}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: priorityFor(path),
        alternates: {
          languages: {
            'vi-VN': `${site.url}${pair.vi === '/' ? '' : pair.vi}`,
            'en-US': `${site.url}${pair.en}`,
            'x-default': `${site.url}${pair.vi === '/' ? '' : pair.vi}`,
          },
        },
      };
    }),
  );
}
