import { ArticlePage, articleMetadata } from '@/components/pages/JournalPages';
import { articles } from '@/data/journal';

/** English slugs map back to the Vietnamese entry the data is keyed on. */
const byEnglishSlug = Object.fromEntries(articles.map((a) => [a.en.slug, a.slug]));

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.en.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return articleMetadata(byEnglishSlug[slug] ?? slug, 'en');
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ArticlePage slug={byEnglishSlug[slug] ?? slug} locale="en" />;
}
