import { fleet } from '@/data/fleet';
import { services } from '@/data/services';
import { routes } from '@/data/routes';
import { articles } from '@/data/journal';
import type { Locale } from '@/lib/i18n';

/**
 * Every page and its counterpart in the other language.
 *
 * Two things depend on this: the hreflang pair in each page's metadata, and the
 * language switch in the header, which should land you on the same page rather
 * than dumping you on the home page.
 */
export interface PagePair {
  vi: string;
  en: string;
}

export const pagePairs: PagePair[] = [
  { vi: '/', en: '/en' },
  { vi: '/dich-vu', en: '/en/services' },
  { vi: '/doi-xe', en: '/en/fleet' },
  { vi: '/tuyen-duong', en: '/en/routes' },
  { vi: '/bang-gia', en: '/en/rates' },
  { vi: '/khach-hang', en: '/en/clients' },
  { vi: '/ve-chung-toi', en: '/en/about' },
  { vi: '/lien-he', en: '/en/contact' },
  { vi: '/dat-xe', en: '/en/book' },
  { vi: '/cam-nang', en: '/en/guides' },
  ...services.map((s) => ({ vi: `/${s.slug}`, en: `/en/${s.en.slug}` })),
  ...fleet.map((v) => ({ vi: `/doi-xe/${v.slug}`, en: `/en/fleet/${v.slug}` })),
  ...routes.map((r) => ({ vi: `/tuyen-duong/${r.slug}`, en: `/en/routes/${r.en.slug}` })),
  ...articles.map((a) => ({ vi: `/cam-nang/${a.slug}`, en: `/en/guides/${a.en.slug}` })),
];

const viToEn = new Map(pagePairs.map((p) => [p.vi, p.en]));
const enToVi = new Map(pagePairs.map((p) => [p.en, p.vi]));

/** The same page in the other language, or that language's home page. */
export function counterpart(pathname: string, from: Locale): string {
  const clean = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
  if (from === 'vi') return viToEn.get(clean) ?? '/en';
  return enToVi.get(clean) ?? '/';
}

/**
 * hreflang map for a page's metadata.
 *
 * x-default names the page served to a visitor whose language matches neither
 * entry. HTH is a Vietnamese company, so that is the Vietnamese page.
 */
export function alternates(viPath: string): Record<string, string> {
  const en = viToEn.get(viPath);
  return en
    ? { 'vi-VN': viPath, 'en-US': en, 'x-default': viPath }
    : { 'vi-VN': viPath, 'x-default': viPath };
}
