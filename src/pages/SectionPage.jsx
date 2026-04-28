import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { ArticleCard } from '../components/SharedComponents';
import { COLORS, ARTICLES, SECTION_COLORS } from '../data';

const SECTION_LABELS = { news: 'News', sports: 'Sports', opinion: 'Opinion' };
const SECTION_TAGLINES = {
  news: 'Local government, community, education, and business coverage from across the Fox Valley.',
  sports: 'High school, youth, and recreational sports from Kane and Kendall counties.',
  opinion: 'Editorials, letters to the editor, and commentary from Tribune staff and the community.',
};

export default function SectionPage() {
  const location = useLocation();
  const section = location.pathname.slice(1);
  const label = SECTION_LABELS[section] || section;
  const tagline = SECTION_TAGLINES[section] || '';
  const color = SECTION_COLORS[section] || COLORS.dark;
  const articles = ARTICLES.filter(a => a.section === section);

  return (
    <Layout>
      <div style={{ borderBottom: `4px solid ${color}`, marginBottom: 28, paddingBottom: 14 }}>
        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 40, fontWeight: 700, color: COLORS.dark, margin: '0 0 6px',
        }}>
          {label}
        </h2>
        <p style={{ fontSize: 14, color: '#888', margin: 0 }}>{tagline}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {articles.map(a => <ArticleCard key={a.id} article={a} />)}
      </div>
    </Layout>
  );
}
