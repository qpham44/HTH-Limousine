import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n';

/**
 * Open Graph for one page.
 *
 * Next merges metadata from the layout down, so a page that sets no
 * `openGraph` block inherits the layout's whole block. The visible effect is
 * that sharing any inner page on Facebook, Zalo or TikTok produces the home
 * page's title, the home page's description and a link back to the home page,
 * which throws away the click. Most of HTH's traffic arrives from exactly
 * those places, so every page states its own.
 */
export function pageOpenGraph(opts: {
  locale: Locale;
  title: string;
  description: string;
  /** Root-relative canonical for this page, e.g. `/doi-xe` or `/en/fleet`. */
  path: string;
  /** Falls back to the fleet photograph used by the layout. */
  image?: { url: string; alt: string };
}): Metadata['openGraph'] {
  const { locale, title, description, path, image } = opts;

  return {
    type: 'website',
    locale: locale === 'en' ? 'en_US' : 'vi_VN',
    alternateLocale: locale === 'en' ? 'vi_VN' : 'en_US',
    url: path,
    title,
    description,
    images: image
      ? [{ url: image.url, alt: image.alt }]
      : [
          {
            url: '/img/hero-fleet-day.webp',
            width: 1672,
            height: 941,
            alt: locale === 'en' ? 'The HTH Limousine fleet' : 'Đội xe HTH Limousine',
          },
        ],
  };
}
