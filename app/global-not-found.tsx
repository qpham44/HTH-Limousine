import type { Metadata } from 'next';
import './globals.css';
import SiteShell, { montserrat } from '@/components/site/SiteShell';
import NotFound from '@/components/site/NotFound';

/* Unmatched URLs sit outside both root layouts, so this page carries its own
   document. Vietnamese, since that is the site's default language. */

export const metadata: Metadata = {
  title: 'Không tìm thấy trang · HTH Limousine',
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return (
    <html lang="vi" className={montserrat.variable}>
      <body>
        <SiteShell locale="vi">
          <NotFound locale="vi" />
        </SiteShell>
      </body>
    </html>
  );
}
