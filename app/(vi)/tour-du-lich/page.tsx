import ServicePage, { serviceMetadata } from '@/components/services/ServicePage';

const SLUG = 'tour-du-lich';

export const metadata = serviceMetadata(SLUG, 'vi');

export default function Page() {
  return <ServicePage slug={SLUG} locale="vi" />;
}
