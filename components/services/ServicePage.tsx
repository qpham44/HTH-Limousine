import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { rateRows } from '@/data/rates';
import { fleetBySlug } from '@/data/fleet';
import { serviceBySlug, services } from '@/data/services';
import { formatVnd } from '@/lib/quote';
import { site } from '@/lib/site';
import { localised, paths, t, type Locale } from '@/lib/i18n';
import { alternates } from '@/lib/routeMap';
import { pageOpenGraph } from '@/lib/seo';
import JsonLd, { breadcrumbLd, faqLd } from '@/components/site/JsonLd';
import {
  Breadcrumbs,
  Checklist,
  CtaBand,
  FaqList,
  LinkList,
  PageHero,
  Steps,
  VehicleCards,
  pageStyles,
} from '@/components/site/PageParts';
import RateTable from '@/components/rates/RateTable';

const headings = {
  vi: {
    steps: 'Quy trình bốn bước rõ ràng',
    included: 'Giá báo đã bao gồm những gì',
    includedLead: 'Một mức giá cho cả chuyến đi. Nếu có khoản nào nằm ngoài, điều phối viên sẽ thông báo trước khi Quý khách xác nhận, không để phát sinh lúc thanh toán.',
    vehicles: 'Dòng xe thường được chọn cho dịch vụ này',
    rates: 'Giá trọn gói',
    ratesNone: 'Báo giá theo lộ trình thực tế',
    ratesLead: 'Đã gồm xe, tài xế, nhiên liệu, phí cầu đường và bảo hiểm hành khách.',
    faq: 'Câu hỏi thường gặp trước khi đặt xe',
    faqLead: (phone: string) => `Nếu còn điều gì chưa rõ, Quý khách vui lòng gọi ${phone}. Người trực máy sẽ giải đáp ngay, không cần chuyển máy.`,
    others: 'Các dịch vụ khác của HTH',
    unit: 'Đơn vị: đồng.',
  },
  en: {
    steps: 'Four steps, none of which you have to guess at',
    included: 'What the number we quote actually covers',
    includedLead: 'One price for the whole trip. If something falls outside it, the coordinator tells you before you confirm, not when you pay.',
    vehicles: 'Cars people usually take for this',
    rates: 'All-in prices',
    ratesNone: 'Priced against your route',
    ratesLead: 'Covering the car, the chauffeur, fuel, tolls and passenger insurance.',
    faq: 'What people ask before booking',
    faqLead: (phone: string) => `If something is still unclear, call ${phone}. Whoever answers can tell you straight away, with no transfers.`,
    others: 'What else HTH does',
    unit: 'In Vietnamese dong.',
  },
} as const;

export function serviceMetadata(slug: string, locale: Locale): Metadata {
  const base = serviceBySlug[slug];
  if (!base) return {};
  const service = localised(base, locale);
  return {
    title: service.title,
    description: service.description,
    alternates: {
      canonical: paths.service(locale, service.slug),
      languages: alternates(`/${base.slug}`),
    },
    openGraph: pageOpenGraph({
      locale,
      title: service.title,
      description: service.description,
      path: paths.service(locale, service.slug),
      image: { url: service.image, alt: service.imageAlt },
    }),
  };
}

export default function ServicePage({ slug, locale = 'vi' }: { slug: string; locale?: Locale }) {
  const base = serviceBySlug[slug];
  if (!base) notFound();

  const service = localised(base, locale);
  const copy = t(locale);
  const h = headings[locale];

  const trail = [{ name: service.nav, href: paths.service(locale, service.slug) }];
  const rows = base.rateFilter ? rateRows.filter(base.rateFilter) : [];
  const vehicles = base.vehicles.map((s) => fleetBySlug[s]).filter(Boolean);
  const others = services.filter((other) => other.slug !== base.slug).map((o) => localised(o, locale));

  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.h1,
    description: service.description,
    serviceType: service.nav,
    provider: { '@type': 'AutoRental', name: site.name, telephone: site.phone.tel, url: site.url },
    areaServed: [
      { '@type': 'City', name: locale === 'en' ? 'Ho Chi Minh City' : 'Thành phố Hồ Chí Minh' },
      { '@type': 'Country', name: locale === 'en' ? 'Vietnam' : 'Việt Nam' },
    ],
    url: `${site.url}${paths.service(locale, service.slug)}`,
  };

  return (
    <>
      <JsonLd data={breadcrumbLd(trail)} />
      <JsonLd data={serviceLd} />
      <JsonLd data={faqLd(service.faq)} />
      <Breadcrumbs trail={trail} locale={locale} />

      <PageHero
        eyebrow={service.eyebrow}
        title={service.h1}
        lead={service.lead}
        image={service.image}
        imageAlt={service.imageAlt}
        locale={locale}
      />

      <section className="section section--alt section--rule-top">
        <div className="wrap">
          <div className="head">
            <div className="head-title">
              <div className="eyebrow">{copy.eyebrow.howToBook}</div>
              <h2>{h.steps}</h2>
            </div>
          </div>
          <Steps steps={service.steps} />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className={pageStyles.split}>
            <div className="stack stack-20">
              <div className="eyebrow">{copy.eyebrow.included}</div>
              <h2>{h.included}</h2>
              <p className="u-lead">{h.includedLead}</p>
            </div>
            <Checklist items={service.included} />
          </div>
        </div>
      </section>

      {vehicles.length > 0 ? (
        <section className="section section--alt section--rule-top">
          <div className="wrap">
            <div className="head">
              <div className="head-title">
                <div className="eyebrow">{copy.eyebrow.fleet}</div>
                <h2>{h.vehicles}</h2>
              </div>
              <p className="u-lead">
                <Link href={paths.fleet(locale)} className="tlink">{copy.cta.seeAllFleet}</Link>
              </p>
            </div>
            <VehicleCards
              locale={locale}
              vehicles={vehicles.map((vehicle) => ({
                slug: vehicle.slug,
                name: locale === 'en' ? vehicle.nameEn : vehicle.name,
                category: locale === 'en' ? vehicle.categoryEn : vehicle.category,
                seats: locale === 'en' ? vehicle.seatsEn : vehicle.seats,
                hero: vehicle.hero,
                heroAlt: vehicle.heroAlt,
                priceLabel: `${formatVnd(vehicle.from.amount, locale)}₫`,
              }))}
            />
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="wrap">
          <div className="head">
            <div className="head-title">
              <div className="eyebrow">{copy.eyebrow.rates}</div>
              <h2>{rows.length > 0 ? h.rates : h.ratesNone}</h2>
            </div>
            {rows.length > 0 ? <p className="u-lead">{h.ratesLead}</p> : null}
          </div>
          {rows.length > 0 ? (
            <RateTable rows={rows} note={service.rateNote} caption={h.unit} locale={locale} />
          ) : (
            <p className="u-lead u-prose">{service.rateNote}</p>
          )}
        </div>
      </section>

      <section className="section section--alt section--rule-top">
        <div className="wrap">
          <div className={pageStyles.split}>
            <div className="stack stack-20">
              <div className="eyebrow">{copy.eyebrow.faq}</div>
              <h2>{h.faq}</h2>
              <p className="u-lead">{h.faqLead(site.phone.display)}</p>
            </div>
            <FaqList faq={service.faq} />
          </div>
        </div>
      </section>

      <section className="section--tight">
        <div className="wrap">
          <CtaBand locale={locale} />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="head">
            <div className="head-title">
              <div className="eyebrow">{copy.eyebrow.otherServices}</div>
              <h2>{h.others}</h2>
            </div>
          </div>
          <LinkList
            items={others.map((other) => ({
              href: paths.service(locale, other.slug),
              label: other.h1,
            }))}
          />
        </div>
      </section>
    </>
  );
}
