import { ServicesIndexPage, servicesIndexMetadata } from '@/components/pages/StaticPages';

export const metadata = servicesIndexMetadata('en');

export default function Page() {
  return <ServicesIndexPage locale="en" />;
}
