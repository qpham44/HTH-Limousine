import JourneyMap from '@/components/journey/JourneyMap';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { routes, routeBySlug } from '@/data/routes';
import { rateRows } from '@/data/rates';
import { fleetBySlug } from '@/data/fleet';
import { formatDuration, formatVnd } from '@/lib/quote';
import { site } from '@/lib/site';
import { localised, paths, t, type Locale } from '@/lib/i18n';
import { alternates } from '@/lib/routeMap';
import { pageOpenGraph } from '@/lib/seo';
import JsonLd, { breadcrumbLd, faqLd } from '@/components/site/JsonLd';
import {
  Breadcrumbs,
  CtaBand,
  FaqList,
  Facts,
  LinkList,
  PageHero,
  VehicleCards,
  pageStyles,
} from '@/components/site/PageParts';
import RateTable from '@/components/rates/RateTable';
import styles from '@/app/(vi)/tuyen-duong/routes.module.css';

const copyFor = {
  vi: {
    indexTitle: 'Tuyến đường: giá và thời gian di chuyển',
    indexDescription:
      'Các tuyến HTH chạy thường xuyên từ TP.HCM: Vũng Tàu, Hồ Tràm, Đà Lạt, Phan Thiết và Cần Thơ. Quãng đường, thời gian di chuyển thực tế và giá trọn gói.',
    indexH1: 'Các tuyến HTH phục vụ thường xuyên',
    indexLead:
      'Quãng đường và thời gian dưới đây do chính HTH đo đạc từ các chuyến xe thực tế, không phải ước tính từ bản đồ. Với tuyến ngoài danh sách, chúng tôi vẫn phục vụ và báo giá qua điện thoại.',
    indexCtaTitle: 'Không tìm thấy tuyến Quý khách cần?',
    indexCtaBody:
      'HTH phục vụ khắp miền Nam và các tỉnh xa hơn khi khách hàng có nhu cầu. Quý khách gửi điểm đi, điểm đến và ngày khởi hành, chúng tôi sẽ báo giá trọn gói.',
    oneWay: (km: number) => `${km} km một chiều`,
    vehicleCount: (n: number) => `${n} dòng xe`,
    theDrive: 'Thực tế cung đường',
    notes: 'Ba điều nên biết',
    ratesFor: (nav: string) => `Giá trọn gói tuyến ${nav}`,
    ratesLead: 'Đã gồm xe, tài xế, nhiên liệu, phí cầu đường và bảo hiểm hành khách.',
    ratesNote:
      'Nếu lịch trình có thêm điểm ghé hoặc dài hơn bảng trên, Quý khách vui lòng gọi hotline để nhận báo giá theo đúng lộ trình.',
    unit: 'Đơn vị: đồng.',
    vehicles: 'Dòng xe thường được chọn cho tuyến này',
    faq: (nav: string) => `Câu hỏi thường gặp về tuyến ${nav}`,
    faqLead: (phone: string) => `Nếu chưa tìm thấy câu trả lời, Quý khách vui lòng gọi ${phone}. Người trực máy nắm rõ tuyến này.`,
    ctaBody: 'Quý khách gửi ngày đi, số khách và số vali. Điều phối viên sẽ xác nhận xe và chốt giá trước khi khởi hành.',
    related: 'Khách đi tuyến này cũng quan tâm',
    serviceType: 'Thuê xe có tài xế theo tuyến',
  },
  en: {
    indexTitle: 'Routes: distances, times and prices',
    indexDescription:
      'The routes HTH runs regularly from Ho Chi Minh City: Vung Tau, Ho Tram, Da Lat, Phan Thiet and Can Tho. Real distances, real drive times and all-in prices.',
    indexH1: 'The runs we make every week',
    indexLead:
      'The distances and times below are our own measurements, not a map estimate. Routes outside the list are still welcome, they are just quoted by phone.',
    indexCtaTitle: 'Your route is not listed?',
    indexCtaBody:
      'We cover the whole south and go further when guests need it. Send a start, a destination and a date, and we quote one all-in price.',
    oneWay: (km: number) => `${km} km one way`,
    vehicleCount: (n: number) => `${n} classes`,
    theDrive: 'What this drive is actually like',
    notes: 'Three things worth knowing',
    ratesFor: (nav: string) => `All-in prices, ${nav}`,
    ratesLead: 'Covering the car, chauffeur, fuel, tolls and passenger insurance.',
    ratesNote:
      'If the plan adds stops or runs longer than the table above, call the hotline for a price against the real itinerary.',
    unit: 'In Vietnamese dong.',
    vehicles: 'Cars people usually take on this route',
    faq: (nav: string) => `Questions we get about ${nav}`,
    faqLead: (phone: string) => `If your question is not here, call ${phone}. Whoever answers knows this route.`,
    ctaBody: 'Send the date, the number of passengers and the number of cases. The coordinator confirms the car and the price before you set off.',
    related: 'People on this route also ask about',
    serviceType: 'Chauffeured car hire by route',
  },
} as const;

/* Index -------------------------------------------------------------------- */

export function routesIndexMetadata(locale: Locale): Metadata {
  const c = copyFor[locale];
  return {
    title: c.indexTitle,
    description: c.indexDescription,
    alternates: { canonical: paths.routes(locale), languages: alternates('/tuyen-duong') },
    openGraph: pageOpenGraph({
      locale,
      title: c.indexTitle,
      description: c.indexDescription,
      path: paths.routes(locale),
    }),
  };
}

export function RoutesIndexPage({ locale = 'vi' }: { locale?: Locale }) {
  const copy = t(locale);
  const c = copyFor[locale];
  const trail = [{ name: copy.eyebrow.routes, href: paths.routes(locale) }];

  return (
    <>
      <JsonLd data={breadcrumbLd(trail)} />
      <Breadcrumbs trail={trail} locale={locale} />

      <PageHero
        eyebrow={copy.eyebrow.routes}
        title={c.indexH1}
        lead={c.indexLead}
        image="/img/universe-fleet.webp"
        imageAlt="Đội xe khách Hyundai Universe của HTH xếp hàng chờ đón đoàn"
        locale={locale}
      />

      <section className="section--tight">
        <div className="wrap">
          <div className={styles.list}>
            {routes.map((base) => {
              const route = localised(base, locale);
              return (
                <Link key={base.slug} href={paths.route(locale, route.slug)} className={styles.item}>
                  <h2 className={styles.itemName}>{route.nav}</h2>
                  <p className={styles.itemLead}>{route.lead}</p>
                  <div className={styles.itemMeta}>
                    <span>{base.km} km</span>
                    <span>{formatDuration(base.minutes, locale)}</span>
                    <span className="tlink" style={{ fontSize: 11 }}>{copy.cta.details}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section--alt section--rule-top" id="diem-den">
        <JourneyMap locale={locale} />
      </section>

      <section className="section">
        <div className="wrap">
          <CtaBand title={c.indexCtaTitle} body={c.indexCtaBody} locale={locale} />
        </div>
      </section>
    </>
  );
}

/* Detail -------------------------------------------------------------------- */

export function routeMetadata(slug: string, locale: Locale): Metadata {
  const base = routeBySlug[slug];
  if (!base) return {};
  const route = localised(base, locale);
  return {
    title: route.title,
    description: route.description,
    alternates: {
      canonical: paths.route(locale, route.slug),
      languages: alternates(`/tuyen-duong/${base.slug}`),
    },
    openGraph: pageOpenGraph({
      locale,
      title: route.title,
      description: route.description,
      path: paths.route(locale, route.slug),
      image: { url: base.image, alt: base.imageAlt },
    }),
  };
}

export function RouteDetailPage({ slug, locale = 'vi' }: { slug: string; locale?: Locale }) {
  const base = routeBySlug[slug];
  if (!base) notFound();

  const route = localised(base, locale);
  const copy = t(locale);
  const c = copyFor[locale];

  const trail = [
    { name: copy.eyebrow.routes, href: paths.routes(locale) },
    { name: route.nav, href: paths.route(locale, route.slug) },
  ];

  const rows = rateRows.filter(base.rateFilter);
  const vehicles = base.vehicles.map((s) => fleetBySlug[s]).filter(Boolean);
  const related = base.related.map((s) => routeBySlug[s]).filter(Boolean);
  const cheapest = Math.min(
    ...rows.flatMap((r) => Object.values(r.prices).filter((v): v is number => v !== null)),
  );

  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: route.h1,
    description: route.description,
    serviceType: c.serviceType,
    provider: { '@type': 'AutoRental', name: site.name, telephone: site.phone.tel, url: site.url },
    areaServed: { '@type': 'Country', name: locale === 'en' ? 'Vietnam' : 'Việt Nam' },
    url: `${site.url}${paths.route(locale, route.slug)}`,
  };

  return (
    <>
      <JsonLd data={breadcrumbLd(trail)} />
      <JsonLd data={serviceLd} />
      <JsonLd data={faqLd(route.faq)} />
      <Breadcrumbs trail={trail} locale={locale} />

      <PageHero
        eyebrow={copy.eyebrow.routes}
        title={route.h1}
        lead={route.lead}
        image={base.image}
        imageAlt={base.imageAlt}
        locale={locale}
      />

      <section className="section--tight">
        <div className="wrap">
          <Facts
            facts={[
              { key: copy.facts.distance, value: c.oneWay(base.km) },
              { key: copy.facts.driveTime, value: formatDuration(base.minutes, locale) },
              { key: copy.facts.vehiclesSuited, value: c.vehicleCount(vehicles.length) },
              { key: copy.facts.from, value: `${formatVnd(cheapest, locale)}₫` },
            ]}
          />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className={pageStyles.split}>
            <div className="stack stack-20">
              <div className="eyebrow">{copy.eyebrow.theDrive}</div>
              <h2>{c.theDrive}</h2>
            </div>
            <div className={styles.body}>
              {route.body.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt section--rule-top">
        <div className="wrap">
          <div className="head">
            <div className="head-title">
              <div className="eyebrow">{copy.eyebrow.beforeYouBook}</div>
              <h2>{c.notes}</h2>
            </div>
          </div>
          <div className={styles.notes}>
            {route.notes.map((note) => (
              <div key={note.title} className={styles.note}>
                <h3 className={styles.noteTitle}>{note.title}</h3>
                <p>{note.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="head">
            <div className="head-title">
              <div className="eyebrow">{copy.eyebrow.rates}</div>
              <h2>{c.ratesFor(route.nav)}</h2>
            </div>
            <p className="u-lead">{c.ratesLead}</p>
          </div>
          <RateTable rows={rows} caption={c.unit} note={c.ratesNote} locale={locale} />
        </div>
      </section>

      <section className="section section--alt section--rule-top">
        <div className="wrap">
          <div className="head">
            <div className="head-title">
              <div className="eyebrow">{copy.eyebrow.fleet}</div>
              <h2>{c.vehicles}</h2>
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

      <section className="section">
        <div className="wrap">
          <div className={pageStyles.split}>
            <div className="stack stack-20">
              <div className="eyebrow">{copy.eyebrow.faq}</div>
              <h2>{c.faq(route.nav)}</h2>
              <p className="u-lead">{c.faqLead(site.phone.display)}</p>
            </div>
            <FaqList faq={route.faq} />
          </div>
        </div>
      </section>

      <section className="section--tight">
        <div className="wrap">
          <CtaBand title={route.h1} body={c.ctaBody} locale={locale} />
        </div>
      </section>

      {related.length > 0 ? (
        <section className="section">
          <div className="wrap">
            <div className="head">
              <div className="head-title">
                <div className="eyebrow">{copy.eyebrow.otherRoutes}</div>
                <h2>{c.related}</h2>
              </div>
            </div>
            <LinkList
              items={related.map((other) => {
                const o = localised(other, locale);
                return {
                  href: paths.route(locale, o.slug),
                  label: `${o.h1} · ${other.km} km`,
                };
              })}
            />
          </div>
        </section>
      ) : null}
    </>
  );
}
