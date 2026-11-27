import ServicePage, { serviceMetadata } from '@/components/services/ServicePage';

const SLUG = 'thue-xe-doanh-nghiep';

export const metadata = serviceMetadata(SLUG, 'vi');

export default function Page() {
  return <ServicePage slug={SLUG} locale="vi" />;
}
