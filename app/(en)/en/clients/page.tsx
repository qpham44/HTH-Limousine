import { ClientsPage, clientsMetadata } from '@/components/pages/StaticPages';

export const metadata = clientsMetadata('en');

export default function Page() {
  return <ClientsPage locale="en" />;
}
