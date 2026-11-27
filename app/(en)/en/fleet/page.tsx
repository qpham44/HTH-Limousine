import { FleetIndexPage, fleetIndexMetadata } from '@/components/pages/FleetPages';

export const metadata = fleetIndexMetadata('en');

export default function Page() {
  return <FleetIndexPage locale="en" />;
}
