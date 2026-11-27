import { RoutesIndexPage, routesIndexMetadata } from '@/components/pages/RoutePages';

export const metadata = routesIndexMetadata('en');

export default function Page() {
  return <RoutesIndexPage locale="en" />;
}
