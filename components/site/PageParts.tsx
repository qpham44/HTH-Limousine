import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/lib/site';
import { paths, t, type Locale } from '@/lib/i18n';
import styles from './Page.module.css';

/* Breadcrumbs -------------------------------------------------------------- */

export function Breadcrumbs({
  trail,
  locale = 'vi',
}: {
  trail: { name: string; href: string }[];
  locale?: Locale;
}) {
  const copy = t(locale);
  const last = trail.length - 1;
  return (
    <nav className={`wrap ${styles.crumbs}`} aria-label={copy.breadcrumbLabel}>
      <Link href={paths.home(locale)}>{copy.home}</Link>
      {trail.map((item, index) => (
        <span key={item.href} style={{ display: 'contents' }}>
          <span className={styles.crumbSep} aria-hidden="true">/</span>
          {index === last ? (
            <span aria-current="page">{item.name}</span>
          ) : (
            <Link href={item.href}>{item.name}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}

/* Page hero ---------------------------------------------------------------- */

export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  imageAlt,
  priority = true,
  actions = true,
  locale = 'vi',
}: {
  eyebrow: string;
  title: string;
  lead: string;
  image: string;
  imageAlt: string;
  priority?: boolean;
  actions?: boolean;
  locale?: Locale;
}) {
  const copy = t(locale);
  return (
    <div className={`wrap ${styles.hero}`}>
      <div className={styles.heroCopy}>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p className={styles.heroLead}>{lead}</p>
        {actions ? (
          <div className={styles.heroActions}>
            <Link href={paths.booking(locale)} className="btn btn--gold">{copy.cta.quote}</Link>
            <a href={`tel:${site.phone.tel}`} className="btn btn--outline">
              {copy.callAction} {site.phone.display}
            </a>
          </div>
        ) : null}
      </div>
      <div className={styles.heroMedia}>
        <Image
          src={image}
          alt={imageAlt}
          width={1400}
          height={1050}
          priority={priority}
          sizes="(max-width: 880px) 100vw, 46vw"
        />
      </div>
    </div>
  );
}

/* Numbered sequence -------------------------------------------------------- */

export function Steps({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol className={styles.steps} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {steps.map((step, index) => (
        <li key={step.title} className={styles.step}>
          <span className={styles.stepNum}>{String(index + 1).padStart(2, '0')}</span>
          <h3 className={styles.stepTitle}>{step.title}</h3>
          <p>{step.body}</p>
        </li>
      ))}
    </ol>
  );
}

/* Hairline lists ----------------------------------------------------------- */

function Tick() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="m2.5 7.4 3 3 6-7" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function Checklist({ items }: { items: string[] }) {
  return (
    <ul className={styles.checklist} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {items.map((item) => (
        <li key={item} className={styles.checkItem}>
          <Tick />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** The same hairline list, where every row is a link. */
export function LinkList({ items }: { items: { href: string; label: string }[] }) {
  return (
    <div className={styles.checklist}>
      {items.map((item) => (
        <Link key={item.href} href={item.href} className={styles.checkItem}>
          <Tick />
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );
}

/* FAQ ---------------------------------------------------------------------- */

export function FaqList({ faq }: { faq: { q: string; a: string }[] }) {
  return (
    <div className={styles.faq}>
      {faq.map((item) => (
        <details key={item.q} className={styles.faqItem}>
          <summary>{item.q}</summary>
          <p className={styles.faqAnswer}>{item.a}</p>
        </details>
      ))}
    </div>
  );
}

/* CTA band ----------------------------------------------------------------- */

export function CtaBand({
  title,
  body,
  locale = 'vi',
}: {
  title?: string;
  body?: string;
  locale?: Locale;
}) {
  const copy = t(locale);
  return (
    <div className={styles.cta}>
      <div className={styles.ctaCopy}>
        <h2 style={{ fontSize: '1.35rem' }}>{title ?? copy.cta.title}</h2>
        <p>{body ?? copy.cta.body}</p>
      </div>
      <div className={styles.ctaActions}>
        <Link href={paths.booking(locale)} className="btn btn--gold">{copy.cta.quote}</Link>
        <a href={`tel:${site.phone.tel}`} className="btn btn--outline">{site.phone.display}</a>
        <a href={site.phone.zalo} target="_blank" rel="noopener" className="btn btn--outline">Zalo</a>
      </div>
    </div>
  );
}

/* Facts grid ---------------------------------------------------------------- */

export function Facts({ facts }: { facts: { key: string; value: string }[] }) {
  return (
    <div className={styles.facts}>
      {facts.map((fact) => (
        <div key={fact.key} className={styles.fact}>
          <div className={`label ${styles.factKey}`}>{fact.key}</div>
          <div className={styles.factValue}>{fact.value}</div>
        </div>
      ))}
    </div>
  );
}

/* Gallery -------------------------------------------------------------------- */

export function Gallery({ images }: { images: { src: string; alt: string }[] }) {
  if (images.length === 0) return null;
  return (
    <div className={styles.gallery}>
      {images.map((image) => (
        <figure key={image.src}>
          <Image
            src={image.src}
            alt={image.alt}
            width={1200}
            height={900}
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        </figure>
      ))}
    </div>
  );
}

/* Vehicle cards --------------------------------------------------------------- */

export function VehicleCards({
  vehicles,
  locale = 'vi',
}: {
  vehicles: {
    slug: string;
    name: string;
    category: string;
    seats: string;
    hero: string;
    heroAlt: string;
    priceLabel: string;
  }[];
  locale?: Locale;
}) {
  const copy = t(locale);
  return (
    <div className={styles.cards}>
      {vehicles.map((vehicle) => (
        <Link key={vehicle.slug} href={paths.vehicle(locale, vehicle.slug)} className={styles.card}>
          <div className={styles.cardMedia}>
            <Image
              src={vehicle.hero}
              alt={vehicle.heroAlt}
              width={1200}
              height={900}
              sizes="(max-width: 620px) 100vw, 25vw"
            />
          </div>
          <span className="label">{vehicle.category}</span>
          <h3 className={styles.cardName}>{vehicle.name}</h3>
          <p className={styles.cardMeta}>{vehicle.seats}</p>
          <div className={styles.cardFoot}>
            <span>{vehicle.priceLabel}</span>
            <span className="tlink" style={{ fontSize: 11 }}>{copy.cta.details}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export { styles as pageStyles };
