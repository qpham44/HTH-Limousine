import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fleet, fleetBySlug } from '@/data/fleet';
import { rateRows } from '@/data/rates';
import { serviceBySlug } from '@/data/services';
import { formatVnd } from '@/lib/quote';
import { site } from '@/lib/site';
import { localised, paths, t, type Locale } from '@/lib/i18n';
import { alternates } from '@/lib/routeMap';
import { pageOpenGraph } from '@/lib/seo';
import JsonLd, { breadcrumbLd } from '@/components/site/JsonLd';
import {
  Breadcrumbs,
  CtaBand,
  Facts,
  Gallery,
  LinkList,
  PageHero,
  pageStyles,
} from '@/components/site/PageParts';
import RateTable from '@/components/rates/RateTable';
import styles from '@/app/(vi)/doi-xe/fleet.module.css';

const copyFor = {
  vi: {
    indexTitle: 'Đội xe: limousine D’Car, MPV và xe 45 chỗ',
    indexDescription:
      'Đội xe HTH Limousine: BMW 5 Series, Kia Carnival, limousine D’Car trên nền Ford Transit và Hyundai Solati, Ford Transit 16 chỗ và xe khách Universe 45 chỗ.',
    indexH1: 'Sáu dòng xe, chọn theo số khách và hành lý',
    indexLead:
      'Số ghế hiếm khi là yếu tố quyết định. Hành lý mới là điều dễ khiến một chuyến đón sân bay gặp trục trặc, vì vậy mỗi dòng xe dưới đây đều ghi rõ sức chứa hành lý.',
    ctaTitle: 'Chưa chắc nên chọn xe nào?',
    ctaBody:
      'Quý khách cho biết số khách, số vali và lịch trình. Điều phối viên sẽ đề xuất dòng xe phù hợp và báo giá trọn gói, kể cả khi phương án tối ưu là một chiếc xe rẻ hơn.',
    seats: 'Số chỗ',
    luggage: 'Hành lý',
    ratesFor: (name: string) => `Giá trọn gói cho ${name}`,
    ratesLead: 'Đã gồm xe, tài xế, nhiên liệu, phí cầu đường và bảo hiểm hành khách; giá được chốt trước khi khởi hành.',
    ratesCaption: (name: string) => `Đơn vị: đồng. Giá tham chiếu cho ${name}.`,
    ratesNote:
      'Với tuyến ngoài bảng, Quý khách có thể dùng công cụ tính giá ở trang chủ hoặc gọi hotline để nhận báo giá theo lịch trình thực tế.',
    noRates: 'Báo giá theo lịch trình',
    noRatesLead: (name: string) =>
      `${name} chủ yếu phục vụ tuyến cố định và hợp đồng tháng, nên giá phụ thuộc vào số chuyến và khung giờ. Quý khách gửi tuyến, chúng tôi sẽ khảo sát rồi báo giá.`,
    bookThis: 'Đặt dòng xe này',
    suits: (name: string) => `${name} thường được đặt cho`,
    otherVehicles: 'Các dòng xe khác',
    metaDescription: (name: string, seats: string, _luggage: string, price: string, label: string) =>
      `Thuê ${name} có tài xế tại TP.HCM. ${seats}. Giá trọn gói từ ${price}₫ cho ${label.toLowerCase()}.`,
    metaTitle: (name: string) => `Thuê ${name} có tài xế`,
  },
  en: {
    indexTitle: 'Fleet: D’Car limousines and coaches',
    indexDescription:
      'The HTH fleet: BMW 5 Series, Kia Carnival, D’Car limousines on the Ford Transit and Hyundai Solati, a 16-seat Transit and 45-seat Universe coaches.',
    indexH1: 'Six classes, chosen on passengers and cases',
    indexLead:
      'Seats are rarely what decides it. Luggage is what ruins an airport pickup, so every car below says how many cases it actually takes.',
    ctaTitle: 'Not sure which car?',
    ctaBody:
      'Give us the passenger count, the case count and the plan. The coordinator suggests a class and quotes one price, including when the answer is a cheaper car.',
    seats: 'Seats',
    luggage: 'Luggage',
    ratesFor: (name: string) => `All-in prices for the ${name}`,
    ratesLead: 'Covering the car, chauffeur, fuel, tolls and passenger insurance, agreed before the car sets off.',
    ratesCaption: (name: string) => `In Vietnamese dong. Reference prices for the ${name}.`,
    ratesNote:
      'For a route outside the table, use the quote tool on the home page or call the hotline for a price against your actual plan.',
    noRates: 'Priced against your schedule',
    noRatesLead: (name: string) =>
      `The ${name} mostly runs fixed routes and monthly contracts, so the price depends on the number of runs and the hours. Send the route and we survey it before quoting.`,
    bookThis: 'Book this car',
    suits: (name: string) => `People usually book the ${name} for`,
    otherVehicles: 'Other classes',
    metaDescription: (name: string, seats: string, _luggage: string, price: string, label: string) =>
      `Chauffeured ${name} hire in Ho Chi Minh City. ${seats}. All-in from ${price}₫ for an ${label.toLowerCase()}.`,
    metaTitle: (name: string) => `Chauffeured ${name} hire`,
  },
} as const;

/* Index -------------------------------------------------------------------- */

export function fleetIndexMetadata(locale: Locale): Metadata {
  const c = copyFor[locale];
  return {
    title: c.indexTitle,
    description: c.indexDescription,
    alternates: { canonical: paths.fleet(locale), languages: alternates('/doi-xe') },
    openGraph: pageOpenGraph({
      locale,
      title: c.indexTitle,
      description: c.indexDescription,
      path: paths.fleet(locale),
    }),
  };
}

export function FleetIndexPage({ locale = 'vi' }: { locale?: Locale }) {
  const copy = t(locale);
  const c = copyFor[locale];
  const trail = [{ name: copy.nav.fleet, href: paths.fleet(locale) }];

  return (
    <>
      <JsonLd data={breadcrumbLd(trail)} />
      <Breadcrumbs trail={trail} locale={locale} />

      <PageHero
        eyebrow={copy.eyebrow.fleet}
        title={c.indexH1}
        lead={c.indexLead}
        image="/img/solati.webp"
        imageAlt="Hai xe Hyundai Solati D’Car Limousine của HTH đỗ trước sảnh khách sạn"
        locale={locale}
      />

      <section className="section--tight">
        <div className="wrap">
          <div className={styles.list}>
            {fleet.map((vehicle) => {
              const name = locale === 'en' ? vehicle.nameEn : vehicle.name;
              return (
                <article key={vehicle.slug} className={`${styles.item} reveal`}>
                  <Link href={paths.vehicle(locale, vehicle.slug)} className={styles.media}>
                    <Image
                      src={vehicle.hero}
                      alt={vehicle.heroAlt}
                      width={1400}
                      height={963}
                      sizes="(max-width: 760px) 100vw, 48vw"
                    />
                  </Link>
                  <div className="stack stack-10">
                    <span className="label">
                      {locale === 'en' ? vehicle.categoryEn : vehicle.category}
                    </span>
                    <h2 className={styles.name}>
                      <Link href={paths.vehicle(locale, vehicle.slug)}>{name}</Link>
                    </h2>
                    <p className={styles.blurb}>
                      {locale === 'en' ? vehicle.blurbEn : vehicle.blurb}
                    </p>
                  </div>
                  <div className={styles.meta}>
                    <span>{c.seats} <strong>{locale === 'en' ? vehicle.seatsEn : vehicle.seats}</strong></span>
                    <span>{c.luggage} <strong>{locale === 'en' ? vehicle.luggageEn : vehicle.luggage}</strong></span>
                  </div>
                  <div className={styles.priceRow}>
                    <span className={styles.price}>
                      {formatVnd(vehicle.from.amount, locale)}₫{' '}
                      <small>· {locale === 'en' ? vehicle.from.labelEn : vehicle.from.label}</small>
                    </span>
                    <Link href={paths.vehicle(locale, vehicle.slug)} className="tlink">
                      {copy.cta.details}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <CtaBand title={c.ctaTitle} body={c.ctaBody} locale={locale} />
        </div>
      </section>
    </>
  );
}

/* Detail -------------------------------------------------------------------- */

export function vehicleMetadata(slug: string, locale: Locale): Metadata {
  const vehicle = fleetBySlug[slug];
  if (!vehicle) return {};
  const c = copyFor[locale];
  const name = locale === 'en' ? vehicle.nameEn : vehicle.name;
  const seats = locale === 'en' ? vehicle.seatsEn : vehicle.seats;
  const luggage = locale === 'en' ? vehicle.luggageEn : vehicle.luggage;
  const label = locale === 'en' ? vehicle.from.labelEn : vehicle.from.label;

  return {
    title: c.metaTitle(name),
    description: c.metaDescription(name, seats, luggage, formatVnd(vehicle.from.amount, locale), label),
    alternates: {
      canonical: paths.vehicle(locale, vehicle.slug),
      languages: alternates(`/doi-xe/${vehicle.slug}`),
    },
    openGraph: pageOpenGraph({
      locale,
      title: `${name} · HTH Limousine`,
      description: locale === 'en' ? vehicle.blurbEn : vehicle.blurb,
      path: paths.vehicle(locale, vehicle.slug),
      image: { url: vehicle.hero, alt: vehicle.heroAlt },
    }),
  };
}

export function VehiclePage({ slug, locale = 'vi' }: { slug: string; locale?: Locale }) {
  const vehicle = fleetBySlug[slug];
  if (!vehicle) notFound();

  const copy = t(locale);
  const c = copyFor[locale];
  const en = locale === 'en';
  const name = en ? vehicle.nameEn : vehicle.name;

  const trail = [
    { name: copy.nav.fleet, href: paths.fleet(locale) },
    { name, href: paths.vehicle(locale, vehicle.slug) },
  ];

  const rows = vehicle.rateColumn
    ? rateRows.filter((row) => row.prices[vehicle.rateColumn!] !== null)
    : [];
  const related = fleet.filter((other) => other.slug !== vehicle.slug).slice(0, 3);
  const relatedServices = vehicle.services
    .map((s) => serviceBySlug[s])
    .filter(Boolean)
    .map((s) => localised(s, locale));

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: en ? vehicle.introEn : vehicle.intro,
    image: `${site.url}${vehicle.hero}`,
    brand: { '@type': 'Brand', name: 'HTH Limousine' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'VND',
      price: vehicle.from.amount,
      availability: 'https://schema.org/InStock',
      url: `${site.url}${paths.vehicle(locale, vehicle.slug)}`,
      seller: { '@type': 'Organization', name: site.legalName },
    },
  };

  return (
    <>
      <JsonLd data={breadcrumbLd(trail)} />
      <JsonLd data={productLd} />
      <Breadcrumbs trail={trail} locale={locale} />

      <div className="wrap" style={{ paddingTop: 22 }}>
        <div className={styles.detailHero}>
          <Image src={vehicle.hero} alt={vehicle.heroAlt} width={1672} height={716} priority sizes="100vw" />
        </div>
      </div>

      <section className="section--tight">
        <div className="wrap">
          <div className={pageStyles.split}>
            <div className={styles.detailIntro}>
              <div className="eyebrow">{en ? vehicle.categoryEn : vehicle.category}</div>
              <h1>{name}</h1>
              <p>{en ? vehicle.introEn : vehicle.intro}</p>
            </div>

            <div className={styles.sidebar}>
              <Facts
                facts={[
                  { key: copy.facts.seats, value: en ? vehicle.seatsEn : vehicle.seats },
                  { key: copy.facts.luggage, value: en ? vehicle.luggageEn : vehicle.luggage },
                  {
                    key: en ? vehicle.from.labelEn : vehicle.from.label,
                    value: `${formatVnd(vehicle.from.amount, locale)}₫`,
                  },
                ]}
              />
              <div className={pageStyles.ctaActions}>
                <Link href={paths.booking(locale)} className="btn btn--gold">{c.bookThis}</Link>
                <a href={`tel:${site.phone.tel}`} className="btn btn--outline">{site.phone.display}</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {vehicle.gallery.length > 0 ? (
        <section className="section--tight">
          <div className="wrap">
            <Gallery
              images={vehicle.gallery.map((image) => ({
                src: image.src,
                alt: en ? image.altEn : image.alt,
              }))}
            />
          </div>
        </section>
      ) : null}

      <section className="section section--alt section--rule-top">
        <div className="wrap">
          <div className="head">
            <div className="head-title">
              <div className="eyebrow">{copy.eyebrow.rates}</div>
              <h2>{rows.length > 0 ? c.ratesFor(name) : c.noRates}</h2>
            </div>
            <p className="u-lead">{rows.length > 0 ? c.ratesLead : c.noRatesLead(name)}</p>
          </div>
          {rows.length > 0 ? (
            <RateTable
              rows={rows}
              only={vehicle.rateColumn}
              caption={c.ratesCaption(name)}
              note={c.ratesNote}
              locale={locale}
            />
          ) : null}
        </div>
      </section>

      {relatedServices.length > 0 ? (
        <section className="section">
          <div className="wrap">
            <div className="head">
              <div className="head-title">
                <div className="eyebrow">{copy.eyebrow.suitsYou}</div>
                <h2>{c.suits(name)}</h2>
              </div>
            </div>
            <LinkList
              items={relatedServices.map((service) => ({
                href: paths.service(locale, service.slug),
                label: service.h1,
              }))}
            />
          </div>
        </section>
      ) : null}

      <section className="section--tight">
        <div className="wrap">
          <CtaBand locale={locale} />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="head">
            <div className="head-title">
              <div className="eyebrow">{copy.eyebrow.fleet}</div>
              <h2>{c.otherVehicles}</h2>
            </div>
            <p className="u-lead">
              <Link href={paths.fleet(locale)} className="tlink">{copy.cta.seeAllFleet}</Link>
            </p>
          </div>
          <div className={pageStyles.cards}>
            {related.map((other) => (
              <Link key={other.slug} href={paths.vehicle(locale, other.slug)} className={pageStyles.card}>
                <div className={pageStyles.cardMedia}>
                  <Image
                    src={other.hero}
                    alt={other.heroAlt}
                    width={1200}
                    height={900}
                    sizes="(max-width: 620px) 100vw, 33vw"
                  />
                </div>
                <span className="label">{en ? other.categoryEn : other.category}</span>
                <h3 className={pageStyles.cardName}>{en ? other.nameEn : other.name}</h3>
                <p className={pageStyles.cardMeta}>{en ? other.seatsEn : other.seats}</p>
                <div className={pageStyles.cardFoot}>
                  <span>{formatVnd(other.from.amount, locale)}₫</span>
                  <span className="tlink" style={{ fontSize: 11 }}>{copy.cta.details}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
