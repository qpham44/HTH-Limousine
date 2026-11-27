import { RouteDetailPage, routeMetadata } from '@/components/pages/RoutePages';
import { routes } from '@/data/routes';

/** English slugs map back to the Vietnamese entry the data is keyed on. */
const byEnglishSlug = Object.fromEntries(routes.map((r) => [r.en.slug, r.slug]));

export function generateStaticParams() {
  return routes.map((route) => ({ slug: route.en.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return routeMetadata(byEnglishSlug[slug] ?? slug, 'en');
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <RouteDetailPage slug={byEnglishSlug[slug] ?? slug} locale="en" />;
}
