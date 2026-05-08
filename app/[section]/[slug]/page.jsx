import { ARTICLES, SECTION_LABELS } from '../../../lib/data';
import ArticleContent from '../../../components/ArticleContent';

const SECTION_KEYWORDS = {
  news: 'city,community',
  sports: 'sports,athletics',
  opinion: 'newspaper,writing',
  'local-politics': 'government,politics',
  lifestyle: 'lifestyle,home',
};

export function generateStaticParams() {
  return ARTICLES.map(a => ({ section: a.section, slug: a.slug }));
}

export function generateMetadata({ params }) {
  const { section, slug } = params;
  const article = ARTICLES.find(a => a.slug === slug && a.section === section);

  if (!article) return { title: 'Article Not Found — Fox Valley Tribune' };

  const sectionLabel = SECTION_LABELS[section] || section;
  const canonicalUrl = `https://fox-valley-tribune.vercel.app/${section}/${slug}`;
  const kw = SECTION_KEYWORDS[section] || 'news';
  const imageUrl = `https://loremflickr.com/1200/630/${kw}?lock=${article.id}`;
  const parsedDate = article.date ? new Date(article.date) : null;
  const pubDate = parsedDate && !isNaN(parsedDate) ? parsedDate.toISOString() : new Date().toISOString();

  return {
    title: `${article.title} — Fox Valley Tribune`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      url: canonicalUrl,
      images: [{ url: imageUrl }],
      publishedTime: pubDate,
      modifiedTime: pubDate,
      authors: [article.byline],
      section: sectionLabel,
      tags: article.tags || [],
    },
    other: {
      'cXenseParse:image': imageUrl,
    },
  };
}

export default function ArticleDetailPage({ params }) {
  const { section, slug } = params;
  return <ArticleContent section={section} slug={slug} />;
}
