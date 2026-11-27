import { RatesPage, ratesMetadata } from '@/components/pages/StaticPages';

export const metadata = ratesMetadata('en');

export default function Page() {
  return <RatesPage locale="en" />;
}
