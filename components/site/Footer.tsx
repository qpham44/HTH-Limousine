import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/lib/site';
import { fleet } from '@/data/fleet';
import { services } from '@/data/services';
import { routes } from '@/data/routes';
import { localised, paths, t, type Locale } from '@/lib/i18n';
import styles from './Footer.module.css';

export default function Footer({ locale = 'vi' }: { locale?: Locale }) {
  const copy = t(locale);

  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.brand}>
          <Image src="/img/logo.png" alt="" width={224} height={224} aria-hidden="true" />
          <p className={styles.brandText}>{copy.footer.blurb(site.foundedYear)}</p>
        </div>

        <div>
          <div className={`label ${styles.colHead}`}>{copy.footer.servicesHead}</div>
          <div className={styles.col}>
            {services.map((service) => {
              const s = localised(service, locale);
              return <Link key={service.slug} href={paths.service(locale, s.slug)}>{s.nav}</Link>;
            })}
          </div>
        </div>

        <div>
          <div className={`label ${styles.colHead}`}>{copy.footer.fleetHead}</div>
          <div className={styles.col}>
            {fleet.map((vehicle) => (
              <Link key={vehicle.slug} href={paths.vehicle(locale, vehicle.slug)}>
                {locale === 'en' ? vehicle.nameEn : vehicle.name}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className={`label ${styles.colHead}`}>{copy.footer.routesHead}</div>
          <div className={styles.col}>
            {routes.map((route) => {
              const r = localised(route, locale);
              return <Link key={route.slug} href={paths.route(locale, r.slug)}>{r.nav}</Link>;
            })}
          </div>
        </div>

        <div>
          <div className={`label ${styles.colHead}`}>{copy.footer.contactHead}</div>
          <div className={styles.col}>
            <a href={`tel:${site.phone.tel}`}>{site.phone.display}</a>
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <a href={site.phone.zalo} target="_blank" rel="noopener">Zalo</a>
            <a href={site.phone.whatsapp} target="_blank" rel="noopener">WhatsApp</a>
            <span>{site.address.line}</span>
            <span>{site.address.ward}, {site.address.city}</span>
          </div>
        </div>
      </div>

      <div className={`wrap ${styles.legal}`}>
        <span>© {new Date().getFullYear()} {site.legalName}</span>
        <span>{copy.footer.operating}</span>
      </div>
    </footer>
  );
}
