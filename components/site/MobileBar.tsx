'use client';

import { site } from '@/lib/site';
import { track } from '@/lib/analytics';
import { t, type Locale } from '@/lib/i18n';
import styles from './MobileBar.module.css';

export default function MobileBar({ locale = 'vi' }: { locale?: Locale }) {
  const copy = t(locale);
  return (
    <div className={styles.bar}>
      <a
        href={`tel:${site.phone.tel}`}
        className={`${styles.action} ${styles.call}`}
        onClick={() => track('hotline_tapped', { placement: 'mobile_bar' })}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M5.2 2.2 6.6 5 5.3 6.4a8.6 8.6 0 0 0 4.3 4.3L11 9.4l2.8 1.4v2.4c0 .6-.5 1-1.1 1A11.6 11.6 0 0 1 1.8 3.3c0-.6.4-1.1 1-1.1h2.4Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
        {copy.callAction} {site.phone.display}
      </a>
      <a
        href={site.phone.zalo}
        target="_blank"
        rel="noopener"
        className={`${styles.action} ${styles.zalo}`}
        onClick={() => track('zalo_tapped', { placement: 'mobile_bar' })}
      >
        {copy.chatZalo}
      </a>
    </div>
  );
}
