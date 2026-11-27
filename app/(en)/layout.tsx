import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { site, indexable } from '@/lib/site';
import SiteShell, { cormorant, montserrat } from '@/components/site/SiteShell';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'HTH Limousine · Chauffeured cars in Ho Chi Minh City',
    template: '%s · HTH Limousine',
  },
  description:
    'Chauffeured D’Car limousines and 4 to 45-seat vehicles in Ho Chi Minh City. Airport transfers, hourly and daily hire, corporate contracts, intercity trips.',
  alternates: {
    canonical: '/en',
    languages: { 'vi-VN': '/', 'en-US': '/en', 'x-default': '/' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'vi_VN',
    siteName: site.name,
    url: `${site.url}/en`,
    title: 'HTH Limousine · Chauffeured cars in Ho Chi Minh City',
    description:
      'The first company to bring the D’Car limousine to Vietnam. Airport transfers, hourly and daily hire, corporate contracts and intercity trips.',
    images: [{ url: '/img/hero-fleet-day.webp', width: 1672, height: 941, alt: 'The HTH Limousine fleet' }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: indexable, follow: indexable },
};

export const viewport: Viewport = {
  themeColor: '#0A0708',
  width: 'device-width',
  initialScale: 1,
};

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${cormorant.variable}`}>
      <body>
        <SiteShell locale="en">{children}</SiteShell>
      </body>
    </html>
  );
}
