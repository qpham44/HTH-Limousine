'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { site } from '@/lib/site';
import { track } from '@/lib/analytics';
import { paths, t, type Locale } from '@/lib/i18n';
import { counterpart } from '@/lib/routeMap';
import styles from './Header.module.css';

export interface MenuGroup {
  heading: string;
  links: { href: string; label: string }[];
}

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M5.2 2.2 6.6 5 5.3 6.4a8.6 8.6 0 0 0 4.3 4.3L11 9.4l2.8 1.4v2.4c0 .6-.5 1-1.1 1A11.6 11.6 0 0 1 1.8 3.3c0-.6.4-1.1 1-1.1h2.4Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Two rows, after Amanoi: Menu on the left, the mark centred, language and
 * the hotline on the right, and the section links on a hairline row beneath.
 * The link row folds away once the page scrolls, leaving a slim bar.
 */
export default function Header({ locale = 'vi', groups = [] }: { locale?: Locale; groups?: MenuGroup[] }) {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const copy = t(locale);
  const pathname = usePathname() ?? '/';

  const nav = [
    { href: paths.services(locale), label: copy.nav.services },
    { href: paths.fleet(locale), label: copy.nav.fleet },
    { href: paths.rates(locale), label: copy.nav.rates },
    { href: paths.about(locale), label: copy.nav.about },
    { href: paths.journal(locale), label: copy.nav.journal },
    { href: paths.contact(locale), label: copy.nav.contact },
  ];

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 64);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  const close = () => setOpen(false);
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
    <header className={`${styles.header} ${compact && !open ? styles.compact : ''}`}>
      <div className={styles.top}>
        <div className={styles.left}>
          <button
            type="button"
            className={styles.menuBtn}
            aria-expanded={open}
            aria-controls="menu-panel"
            aria-label={open ? copy.menuClose : copy.menuOpen}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={styles.bars} aria-hidden="true">
              <span />
            </span>
            <span className={styles.menuText}>{open ? copy.menuCloseLabel : copy.menuLabel}</span>
          </button>
        </div>

        <Link href={paths.home(locale)} className={styles.brand} aria-label={copy.homeLabel}>
          <Image src="/img/logo-mark.png" alt="HTH Limousine" width={547} height={360} priority />
        </Link>

        <div className={styles.right}>
          <Link
            href={counterpart(pathname, locale)}
            className={styles.lang}
            hrefLang={locale === 'vi' ? 'en' : 'vi'}
            aria-label={locale === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'}
          >
            <span className={styles.langFull}>{copy.otherLanguageName}</span>
            <span className={styles.langShort}>{copy.otherLanguage}</span>
          </Link>
          <a
            href={`tel:${site.phone.tel}`}
            className={styles.call}
            aria-label={`${copy.callAction} ${site.phone.display}`}
            onClick={() => track('hotline_tapped', { placement: 'header' })}
          >
            <PhoneIcon />
            <span>{site.phone.display}</span>
          </a>
        </div>
      </div>

      <nav className={styles.nav} aria-label={copy.mainNavLabel}>
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={styles.navLink}
            aria-current={isCurrent(item.href) ? 'page' : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={styles.panel} id="menu-panel" hidden={!open}>
        <div className={styles.panelInner}>
          <div>
            <div className={`label ${styles.panelHead}`}>{copy.menuExplore}</div>
            <div className={styles.panelPrimary}>
              {nav.map((item) => (
                <Link key={item.href} href={item.href} onClick={close}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {groups.map((group) => (
            <div key={group.heading}>
              <div className={`label ${styles.panelHead}`}>{group.heading}</div>
              <div className={styles.panelLinks}>
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href} onClick={close}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className={styles.panelFoot}>
            <Link href={paths.booking(locale)} className="btn btn--gold" onClick={close}>
              {copy.book}
            </Link>
            <a href={`tel:${site.phone.tel}`} className="btn btn--outline">
              {copy.callAction} {site.phone.display}
            </a>
            <a href={site.phone.zalo} className="btn btn--outline" target="_blank" rel="noopener">
              Zalo
            </a>
            <a href={site.phone.whatsapp} className="btn btn--outline" target="_blank" rel="noopener">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </header>
    <div className={styles.spacer} aria-hidden="true" />
    </>
  );
}
