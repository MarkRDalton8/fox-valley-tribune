import { ARTICLES, SECTION_LABELS } from '../../../lib/data';
import ArticleContent from '../../../components/ArticleContent';

const SECTION_KEYWORDS = {
  news: 'city,community',
  sports: 'sports,athletics',
  opinion: 'newspaper,writing',
  'local-politics': 'government,politics',
  lifestyle: 'lifestyle,home',
};

const TAG_IMAGE_PRIORITY = [
  'soccer', 'football', 'basketball', 'baseball', 'wrestling', 'swimming',
  'running', 'road-racing', 'recruiting',
  'health', 'education', 'environment', 'elections', 'transportation',
  'business-and-finance', 'infrastructure',
  'arts-and-entertainment', 'food-and-drink', 'cooking', 'gardening',
  'home-design', 'interior', 'wellness', 'fitness', 'outdoors',
  'family-and-parenting', 'personal-development',
  'high-school-sports', 'youth-sports',
];

const TAG_IMAGE_KEYWORDS = {
  soccer: 'soccer', football: 'football', basketball: 'basketball',
  baseball: 'baseball', wrestling: 'wrestling', swimming: 'swimming,pool',
  running: 'running', 'road-racing': 'running,race', recruiting: 'stadium,sports',
  'high-school-sports': 'athlete,sports', 'youth-sports': 'children,sports',
  health: 'hospital,healthcare', education: 'school,classroom',
  environment: 'nature,environment', elections: 'election,voting',
  transportation: 'transit,transportation', 'business-and-finance': 'business,office',
  infrastructure: 'construction,bridge', 'food-and-drink': 'food,restaurant',
  cooking: 'cooking,kitchen', gardening: 'garden,plants',
  'home-design': 'interior,design', interior: 'interior,home',
  wellness: 'wellness,yoga', fitness: 'fitness,exercise', outdoors: 'nature,outdoor',
  'family-and-parenting': 'family,children', 'personal-development': 'inspiration,books',
  'arts-and-entertainment': 'art,performance',
};

function getImageKeyword(section, tags = []) {
  const tagSet = new Set(tags || []);
  for (const tag of TAG_IMAGE_PRIORITY) {
    if (tagSet.has(tag)) return TAG_IMAGE_KEYWORDS[tag];
  }
  return SECTION_KEYWORDS[section] || 'news';
}

export function generateStaticParams() {
  return ARTICLES.map(a => ({ section: a.section, slug: a.slug }));
}

export function generateMetadata({ params }) {
  const { section, slug } = params;
  const article = ARTICLES.find(a => a.slug === slug && a.section === section);

  if (!article) return { title: 'Article Not Found — Fox Valley Tribune' };

  const sectionLabel = SECTION_LABELS[section] || section;
  const canonicalUrl = `https://foxvalley.pianodemo.com/${section}/${slug}`;
  const kw = getImageKeyword(section, article.tags);
  const imageUrl = `https://picsum.photos/seed/${kw}-${article.id}/1200/630`;
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
