import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { site, indexable } from '@/lib/site';
import SiteShell, { cormorant, montserrat } from '@/components/site/SiteShell';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'HTH Limousine · Thuê xe limousine có tài xế tại TP.HCM',
    template: '%s · HTH Limousine',
  },
  description:
    'Thuê xe limousine D’Car và xe 4–45 chỗ có tài xế tại TP.HCM. Đưa đón sân bay, thuê theo giờ, theo ngày, hợp đồng doanh nghiệp và tour đi tỉnh.',
  alternates: {
    canonical: '/',
    languages: { 'vi-VN': '/', 'en-US': '/en', 'x-default': '/' },
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    alternateLocale: 'en_US',
    siteName: site.name,
    url: site.url,
    title: 'HTH Limousine · Thuê xe limousine có tài xế tại TP.HCM',
    description:
      'Đơn vị đầu tiên đưa D’Car Limousine về Việt Nam. Đưa đón sân bay, thuê theo giờ và theo ngày, hợp đồng doanh nghiệp, tour đi tỉnh.',
    images: [{ url: '/img/hero-fleet-day.webp', width: 1672, height: 941, alt: 'Đội xe HTH Limousine' }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: indexable, follow: indexable },
};

export const viewport: Viewport = {
  themeColor: '#0A0708',
  width: 'device-width',
  initialScale: 1,
};

export default function VietnameseLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${montserrat.variable} ${cormorant.variable}`}>
      <body>
        <SiteShell locale="vi">{children}</SiteShell>
      </body>
    </html>
  );
}
