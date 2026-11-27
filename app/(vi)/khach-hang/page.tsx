import { ClientsPage, clientsMetadata } from '@/components/pages/StaticPages';

export const metadata = clientsMetadata('vi');

export default function Page() {
  return <ClientsPage locale="vi" />;
}
