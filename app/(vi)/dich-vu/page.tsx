import { ServicesIndexPage, servicesIndexMetadata } from '@/components/pages/StaticPages';

export const metadata = servicesIndexMetadata('vi');

export default function Page() {
  return <ServicesIndexPage locale="vi" />;
}
