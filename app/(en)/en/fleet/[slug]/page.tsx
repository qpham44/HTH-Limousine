import { VehiclePage, vehicleMetadata } from '@/components/pages/FleetPages';
import { fleet } from '@/data/fleet';

export function generateStaticParams() {
  return fleet.map((vehicle) => ({ slug: vehicle.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return vehicleMetadata(slug, 'en');
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <VehiclePage slug={slug} locale="en" />;
}
