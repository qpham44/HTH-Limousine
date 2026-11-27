import { RouteDetailPage, routeMetadata } from '@/components/pages/RoutePages';
import { routes } from '@/data/routes';

export function generateStaticParams() {
  return routes.map((route) => ({ slug: route.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return routeMetadata(slug, 'vi');
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <RouteDetailPage slug={slug} locale="vi" />;
}
