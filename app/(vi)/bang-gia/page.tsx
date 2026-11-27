import { RatesPage, ratesMetadata } from '@/components/pages/StaticPages';

export const metadata = ratesMetadata('vi');

export default function Page() {
  return <RatesPage locale="vi" />;
}
