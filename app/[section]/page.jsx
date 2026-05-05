import { notFound } from 'next/navigation';
import { COLORS, ARTICLES, SECTION_COLORS, SECTION_LABELS, SECTION_TAGLINES } from '../../lib/data';
import { ArticleCard } from '../../components/ArticleCard';
import PianoInit from '../../components/PianoInit';

const VALID_SECTIONS = ['news', 'sports', 'opinion', 'local-politics'];

export function generateStaticParams() {
  return VALID_SECTIONS.map(section => ({ section }));
}

export function generateMetadata({ params }) {
  const label = SECTION_LABELS[params.section] || params.section;
  return {
    title: `${label} — Fox Valley Tribune`,
    openGraph: {
      title: `${label} — Fox Valley Tribune`,
      type: 'website',
      url: `/${params.section}`,
    },
  };
}

export default function SectionPage({ params }) {
  const { section } = params;

  if (!VALID_SECTIONS.includes(section)) notFound();

  const label = SECTION_LABELS[section];
  const tagline = SECTION_TAGLINES[section];
  const color = SECTION_COLORS[section] || COLORS.dark;
  const articles = ARTICLES.filter(a => a.section === section);

  return (
    <>
      <PianoInit section={section} />

      <div style={{ borderBottom: `4px solid ${color}`, marginBottom: 28, paddingBottom: 14 }}>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 40, fontWeight: 700, color: COLORS.dark, margin: '0 0 6px' }}>
          {label}
        </h2>
        <p style={{ fontSize: 14, color: '#888', margin: 0 }}>{tagline}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {articles.map(a => <ArticleCard key={a.id} article={a} />)}
      </div>
    </>
  );
}
