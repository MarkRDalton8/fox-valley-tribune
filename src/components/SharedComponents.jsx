import { Link } from 'react-router-dom';
import { COLORS, SECTION_COLORS } from '../data';

export const ArticleCard = ({ article, featured = false }) => {
  const sectionColor = SECTION_COLORS[article.section] || COLORS.dark;

  if (featured) {
    return (
      <Link to={`/${article.section}/${article.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{
          background: 'white', border: `1px solid ${COLORS.border}`,
          borderTop: `4px solid ${COLORS.primary}`,
          padding: '28px 32px', height: '100%',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: sectionColor }}>
              {article.category}
            </span>
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 30, fontWeight: 700, color: COLORS.dark,
            margin: '0 0 14px', lineHeight: 1.25,
          }}>
            {article.title}
          </h2>
          <p style={{ fontSize: 15, color: '#444', lineHeight: 1.7, margin: '0 0 16px' }}>
            {article.excerpt}
          </p>
          <div style={{ fontSize: 12, color: '#999' }}>{article.byline} · {article.date}</div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/${article.section}/${article.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: 'white', border: `1px solid ${COLORS.border}`,
        borderLeft: `3px solid ${sectionColor}`,
        padding: '18px 22px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: sectionColor }}>
            {article.category}
          </span>
        </div>
        <h3 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 19, fontWeight: 700, color: COLORS.dark,
          margin: '0 0 8px', lineHeight: 1.3,
        }}>
          {article.title}
        </h3>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, margin: '0 0 10px' }}>
          {article.excerpt}
        </p>
        <div style={{ fontSize: 12, color: '#999' }}>{article.byline} · {article.date}</div>
      </div>
    </Link>
  );
};
