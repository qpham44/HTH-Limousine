import { FleetIndexPage, fleetIndexMetadata } from '@/components/pages/FleetPages';

export const metadata = fleetIndexMetadata('vi');

export default function Page() {
  return <FleetIndexPage locale="vi" />;
}
