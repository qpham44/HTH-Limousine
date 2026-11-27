import Link from 'next/link';
import { site } from '@/lib/site';
import { paths, t, type Locale } from '@/lib/i18n';

const C = {
  vi: {
    eyebrow: 'Lỗi 404',
    title: 'Không tìm thấy trang này',
    body: 'Đường dẫn có thể đã thay đổi khi website được làm mới. Quý khách có thể quay về trang chủ, xem đội xe, hoặc gọi hotline để được hỗ trợ ngay.',
    home: 'Về trang chủ',
    fleet: 'Xem đội xe',
  },
  en: {
    eyebrow: 'Error 404',
    title: 'We could not find that page',
    body: 'The link may have changed when the site was rebuilt. Head back to the home page, look through the fleet, or call the hotline and we will help straight away.',
    home: 'Back to the home page',
    fleet: 'See the fleet',
  },
} as const;

export default function NotFound({ locale = 'vi' }: { locale?: Locale }) {
  const c = C[locale];
  const copy = t(locale);
  return (
    <section className="section">
      <div className="wrap stack stack-20" style={{ maxWidth: 760, marginInline: 'auto' }}>
        <div className="eyebrow">{c.eyebrow}</div>
        <h1>{c.title}</h1>
        <p className="u-lead">{c.body}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
          <Link href={paths.home(locale)} className="btn btn--gold">{c.home}</Link>
          <Link href={paths.fleet(locale)} className="btn btn--outline">{c.fleet}</Link>
          <a href={`tel:${site.phone.tel}`} className="btn btn--outline">
            {copy.callAction} {site.phone.display}
          </a>
        </div>
      </div>
    </section>
  );
}
