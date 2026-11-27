import { ContactPage, contactMetadata } from '@/components/pages/StaticPages';

export const metadata = contactMetadata('en');

export default function Page() {
  return <ContactPage locale="en" />;
}
