import { Cormorant_Garamond, Montserrat } from 'next/font/google';
import { site } from '@/lib/site';
import { localised, paths, t, type Locale } from '@/lib/i18n';
import { services } from '@/data/services';
import { fleet } from '@/data/fleet';
import { routes } from '@/data/routes';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import MobileBar from '@/components/site/MobileBar';
import Dock from '@/components/site/Dock';
import Reveal from '@/components/site/Reveal';
import Motion from '@/components/site/Motion';
import Analytics from '@/components/site/Analytics';

/**
 * Montserrat, kept from the existing site and self-hosted by next/font.
 * The `vietnamese` subset is not optional: without it every stacked diacritic
 * falls back to a system face and the text renders in two typefaces.
 */
export const montserrat = Montserrat({
  subsets: ['vietnamese', 'latin'],
  // 700 is declared nowhere in the stylesheets, and each weight is bytes
  // on the critical path in both the latin and vietnamese subsets.
  weight: ['400', '500', '600'],
  variable: '--font-montserrat',
  display: 'swap',
});

/**
 * Cormorant Garamond, used only by the HTH atlas for its title, place names
 * and sea labels. Not preloaded: the browser fetches it only on pages that
 * actually render serif text, so every other page pays nothing for it.
 */
export const cormorant = Cormorant_Garamond({
  subsets: ['vietnamese', 'latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
  preload: false,
});

export function localBusinessLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRental',
    name: site.name,
    legalName: site.legalName,
    url: locale === 'en' ? `${site.url}/en` : site.url,
    telephone: site.phone.tel,
    email: site.email,
    image: `${site.url}/img/hero-fleet-day.webp`,
    logo: `${site.url}/img/logo.png`,
    foundingDate: String(site.foundedYear),
    priceRange: '₫₫₫',
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.line,
      addressLocality: site.address.ward,
      addressRegion: site.address.city,
      addressCountry: site.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.address.lat, longitude: site.address.lng },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
    areaServed: [
      { '@type': 'City', name: locale === 'en' ? 'Ho Chi Minh City' : 'Thành phố Hồ Chí Minh' },
      { '@type': 'Country', name: locale === 'en' ? 'Vietnam' : 'Việt Nam' },
    ],
  };
}

/** Everything inside <body>, shared by both root layouts. */
export default function SiteShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const copy = t(locale);
  // Built here on the server so the client header never ships the page copy.
  const groups = [
    {
      heading: copy.footer.servicesHead,
      links: services.map((s) => {
        const item = localised(s, locale);
        return { href: paths.service(locale, item.slug), label: item.nav };
      }),
    },
    {
      heading: copy.footer.fleetHead,
      links: fleet.map((v) => ({ href: paths.vehicle(locale, v.slug), label: locale === 'en' ? v.nameEn : v.name })),
    },
    {
      heading: copy.footer.routesHead,
      links: routes.map((r) => {
        const item = localised(r, locale);
        return { href: paths.route(locale, item.slug), label: item.nav };
      }),
    },
  ];
  return (
    <>
      <a className="skip" href="#main">{copy.skipToContent}</a>
      <Header locale={locale} groups={groups} />
      <main id="main">{children}</main>
      <Footer locale={locale} />
      <MobileBar locale={locale} />
      <Dock />
      <Reveal />
      <Motion />
      <Analytics />
      <script
        type="application/ld+json"
        // Static, author-controlled object: no user input reaches this string.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd(locale)) }}
      />
    </>
  );
}
