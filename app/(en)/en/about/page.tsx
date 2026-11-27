import { AboutPage, aboutMetadata } from '@/components/pages/StaticPages';

export const metadata = aboutMetadata('en');

export default function Page() {
  return <AboutPage locale="en" />;
}
