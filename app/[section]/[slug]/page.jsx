import { ARTICLES, SECTION_LABELS } from '../../../lib/data';
import ArticleContent from '../../../components/ArticleContent';

export function generateStaticParams() {
  return ARTICLES.map(a => ({ section: a.section, slug: a.slug }));
}

export function generateMetadata({ params }) {
  const { section, slug } = params;
  const article = ARTICLES.find(a => a.slug === slug && a.section === section);

  if (!article) return { title: 'Article Not Found — Fox Valley Tribune' };

  const sectionLabel = SECTION_LABELS[section] || section;
  return {
    title: `${article.title} — Fox Valley Tribune`,
    openGraph: {
      title: article.title,
      type: 'article',
      url: `/${section}/${slug}`,
    },
  };
}

export default function ArticleDetailPage({ params }) {
  const { section, slug } = params;
  return <ArticleContent section={section} slug={slug} />;
}
