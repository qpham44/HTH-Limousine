import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { articles, articleBySlug } from '@/data/journal';
import { site } from '@/lib/site';
import { localised, paths, t, type Locale } from '@/lib/i18n';
import { alternates } from '@/lib/routeMap';
import { pageOpenGraph } from '@/lib/seo';
import JsonLd, { breadcrumbLd } from '@/components/site/JsonLd';
import { Breadcrumbs, CtaBand, PageHero, pageStyles } from '@/components/site/PageParts';
import styles from '@/app/(vi)/cam-nang/journal.module.css';

const copyFor = {
  vi: {
    indexTitle: 'Cẩm nang đi đường',
    indexDescription:
      'Hướng dẫn chọn xe theo số vali, so sánh xe 16 chỗ với D’Car cho đoàn đông, và thời gian di chuyển thực tế từ sân bay Tân Sơn Nhất về các quận.',
    indexH1: 'Giải đáp những câu hỏi khách hàng thường gặp',
    indexLead:
      'Chúng tôi tổng hợp thành bài viết để Quý khách tham khảo trước khi đặt xe. Mọi con số trong đây đều do HTH đo đạc thực tế, không phải ước tính.',
    ctaTitle: 'Vẫn chưa chắc chọn xe nào?',
    ctaBody: 'Quý khách cho biết số khách, số vali và lịch trình; điều phối viên sẽ đề xuất dòng xe phù hợp và báo giá trọn gói.',
    readTime: (m: number) => `${m} phút đọc`,
    next: 'Đọc tiếp',
    footNote: 'Nếu câu hỏi của Quý khách chưa có ở đây, vui lòng gọi',
    footNoteEnd: '. Điều phối viên sẽ giải đáp ngay.',
  },
  en: {
    indexTitle: 'Guides',
    indexDescription:
      'How to choose a car by luggage rather than seats, a 16-seat van against two D’Cars for a big group, and real drive times from Tan Son Nhat into the city.',
    indexH1: 'The questions people ask us on the phone',
    indexLead:
      'Written up so you can read them before you call. Every figure here is our own measurement, not an estimate.',
    ctaTitle: 'Still not sure which car?',
    ctaBody: 'Give us the passengers, the cases and the plan. The coordinator suggests a class and quotes one price.',
    readTime: (m: number) => `${m} min read`,
    next: 'Read next',
    footNote: 'If your question is not here, call',
    footNoteEnd: '. A coordinator can answer straight away.',
  },
} as const;

/* Index -------------------------------------------------------------------- */

export function journalIndexMetadata(locale: Locale): Metadata {
  const c = copyFor[locale];
  return {
    title: c.indexTitle,
    description: c.indexDescription,
    alternates: { canonical: paths.journal(locale), languages: alternates('/cam-nang') },
    openGraph: pageOpenGraph({
      locale,
      title: c.indexTitle,
      description: c.indexDescription,
      path: paths.journal(locale),
    }),
  };
}

export function JournalIndexPage({ locale = 'vi' }: { locale?: Locale }) {
  const copy = t(locale);
  const c = copyFor[locale];
  const trail = [{ name: copy.nav.journal, href: paths.journal(locale) }];

  return (
    <>
      <JsonLd data={breadcrumbLd(trail)} />
      <Breadcrumbs trail={trail} locale={locale} />

      <PageHero
        eyebrow={copy.eyebrow.journal}
        title={c.indexH1}
        lead={c.indexLead}
        image="/img/transit-dcar-cabin.webp"
        imageAlt="Khoang khách Ford Transit D’Car nhìn từ cửa trượt"
        actions={false}
        locale={locale}
      />

      <section className="section--tight">
        <div className="wrap">
          <div className={styles.list}>
            {articles.map((base) => {
              const article = localised(base, locale);
              return (
                <article key={base.slug} className={`${styles.item} reveal`}>
                  <Link href={paths.article(locale, article.slug)} className={styles.media}>
                    <Image
                      src={base.image}
                      alt={base.imageAlt}
                      width={1200}
                      height={750}
                      sizes="(max-width: 600px) 100vw, 33vw"
                    />
                  </Link>
                  <div className={styles.meta}>
                    {article.category} · {c.readTime(base.minutes)}
                  </div>
                  <h2 className={styles.itemTitle}>
                    <Link href={paths.article(locale, article.slug)}>{article.title}</Link>
                  </h2>
                  <p className={styles.itemLead}>{article.lead}</p>
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

/* Article ------------------------------------------------------------------- */

export function articleMetadata(slug: string, locale: Locale): Metadata {
  const base = articleBySlug[slug];
  if (!base) return {};
  const article = localised(base, locale);
  return {
    title: article.metaTitle,
    description: article.description,
    alternates: {
      canonical: paths.article(locale, article.slug),
      languages: alternates(`/cam-nang/${base.slug}`),
    },
    openGraph: {
      ...pageOpenGraph({
        locale,
        title: article.title,
        description: article.description,
        path: paths.article(locale, article.slug),
        image: { url: base.image, alt: base.imageAlt },
      }),
      type: 'article',
    },
  };
}

export function ArticlePage({ slug, locale = 'vi' }: { slug: string; locale?: Locale }) {
  const base = articleBySlug[slug];
  if (!base) notFound();

  const article = localised(base, locale);
  const copy = t(locale);
  const c = copyFor[locale];

  const trail = [
    { name: copy.nav.journal, href: paths.journal(locale) },
    { name: article.title, href: paths.article(locale, article.slug) },
  ];

  const related = base.related.map((s) => articleBySlug[s]).filter(Boolean);

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: `${site.url}${base.image}`,
    inLanguage: locale === 'en' ? 'en-US' : 'vi-VN',
    author: { '@type': 'Organization', name: site.name, url: site.url },
    publisher: {
      '@type': 'Organization',
      name: site.legalName,
      logo: { '@type': 'ImageObject', url: `${site.url}/img/logo.png` },
    },
    mainEntityOfPage: `${site.url}${paths.article(locale, article.slug)}`,
  };

  return (
    <>
      <JsonLd data={breadcrumbLd(trail)} />
      <JsonLd data={articleLd} />
      <Breadcrumbs trail={trail} locale={locale} />

      <article className="section--tight">
        <div className="wrap">
          <div className={styles.article}>
            <header className={styles.articleHead}>
              <div className={styles.meta}>
                {article.category} · {c.readTime(base.minutes)}
              </div>
              <h1>{article.title}</h1>
              <p className={styles.articleLead}>{article.lead}</p>
            </header>
          </div>

          <div className={styles.hero}>
            <Image src={base.image} alt={base.imageAlt} width={1600} height={900} priority sizes="100vw" />
          </div>

          <div className={styles.article}>
            <div className={styles.body}>
              {article.sections.map((section, index) => (
                <section key={section.heading ?? `s${index}`} className={styles.section}>
                  {section.heading ? <h2 className={styles.sectionHeading}>{section.heading}</h2> : null}
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                  ))}
                  {section.list ? (
                    <ul>
                      {section.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>

            <div className={styles.footNote}>
              <p className="u-quiet" style={{ fontSize: 14.5 }}>
                {c.footNote}{' '}
                <a href={`tel:${site.phone.tel}`} style={{ color: 'var(--gold-deep)' }}>
                  {site.phone.display}
                </a>
                {c.footNoteEnd}
              </p>
            </div>
          </div>
        </div>
      </article>

      <section className="section--tight">
        <div className="wrap">
          <CtaBand locale={locale} />
        </div>
      </section>

      {related.length > 0 ? (
        <section className="section">
          <div className="wrap">
            <div className="head">
              <div className="head-title">
                <div className="eyebrow">{copy.eyebrow.journal}</div>
                <h2>{c.next}</h2>
              </div>
              <p className="u-lead">
                <Link href={paths.journal(locale)} className="tlink">{copy.cta.seeAll}</Link>
              </p>
            </div>
            <div className={pageStyles.cards}>
              {related.map((other) => {
                const o = localised(other, locale);
                return (
                  <Link key={other.slug} href={paths.article(locale, o.slug)} className={pageStyles.card}>
                    <div className={pageStyles.cardMedia}>
                      <Image
                        src={other.image}
                        alt={other.imageAlt}
                        width={1200}
                        height={900}
                        sizes="(max-width: 620px) 100vw, 33vw"
                      />
                    </div>
                    <span className="label">{o.category}</span>
                    <h3 className={pageStyles.cardName}>{o.title}</h3>
                    <p className={pageStyles.cardMeta}>{o.lead}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
