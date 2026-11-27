import ServicePage, { serviceMetadata } from '@/components/services/ServicePage';

const SLUG = 'dua-don-san-bay-tan-son-nhat';

export const metadata = serviceMetadata(SLUG, 'vi');

export default function Page() {
  return <ServicePage slug={SLUG} locale="vi" />;
}
