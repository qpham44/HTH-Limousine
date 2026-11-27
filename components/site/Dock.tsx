'use client';

import { site } from '@/lib/site';
import { track } from '@/lib/analytics';
import styles from './Dock.module.css';

function PhoneIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M5.2 2.2 6.6 5 5.3 6.4a8.6 8.6 0 0 0 4.3 4.3L11 9.4l2.8 1.4v2.4c0 .6-.5 1-1.1 1A11.6 11.6 0 0 1 1.8 3.3c0-.6.4-1.1 1-1.1h2.4Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Dock() {
  return (
    <div className={styles.dock} aria-hidden="true" data-dock="">
      <a
        href={`tel:${site.phone.tel}`}
        title="Hotline"
        className={`${styles.item} ${styles.call}`}
        onClick={() => track('hotline_tapped', { placement: 'dock' })}
        tabIndex={-1}
      >
        <PhoneIcon />
      </a>
      <a
        href={site.phone.zalo}
        target="_blank"
        rel="noopener"
        title="Zalo"
        className={styles.item}
        onClick={() => track('zalo_tapped', { placement: 'dock' })}
        tabIndex={-1}
      >
        Zalo
      </a>
      <a href={site.phone.messenger} target="_blank" rel="noopener" title="Messenger" className={styles.item} tabIndex={-1}>
        <span style={{ fontSize: 18 }}>✉</span>
      </a>
      <a href={site.phone.whatsapp} target="_blank" rel="noopener" title="WhatsApp" className={styles.item} tabIndex={-1}>
        WA
      </a>
    </div>
  );
}
