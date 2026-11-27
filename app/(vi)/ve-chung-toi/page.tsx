import { AboutPage, aboutMetadata } from '@/components/pages/StaticPages';

export const metadata = aboutMetadata('vi');

export default function Page() {
  return <AboutPage locale="vi" />;
}
