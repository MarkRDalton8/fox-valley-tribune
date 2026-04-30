import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { COLORS, ARTICLES, SECTION_COLORS, PIANO_CONFIG } from '../data';

const PARA_STYLE = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: 18, lineHeight: 1.85, color: '#222', marginBottom: 26,
};

export default function ArticleDetail() {
  const { slug } = useParams();
  const location = useLocation();
  const section = location.pathname.split('/')[1];
  const article = ARTICLES.find(a => a.slug === slug && a.section === section);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!article?.locked || !PIANO_CONFIG.SUBSCRIBER_RESOURCE_ID) return;
    const tp = window.tp || [];
    tp.push(['init', function () {
      window.tp.api.callApi('/access/check', { rid: PIANO_CONFIG.SUBSCRIBER_RESOURCE_ID }, function (response) {
        if (response?.access?.granted || response?.data?.access?.granted) setHasAccess(true);
      });
    }]);
  }, [article?.slug]);

  if (!article) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 36, color: COLORS.dark }}>
            Article Not Found
          </h1>
          <Link to="/" style={{ color: COLORS.primary, fontSize: 15 }}>← Return to Home</Link>
        </div>
      </Layout>
    );
  }

  const sectionLabel = section.charAt(0).toUpperCase() + section.slice(1);
  const sectionColor = SECTION_COLORS[section] || COLORS.dark;
  const showFull = !article.locked || hasAccess;
  const visibleBody = showFull ? article.body : article.body.slice(0, 2);

  return (
    <Layout>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 12, color: '#999', marginBottom: 22 }}>
          <Link to="/" style={{ color: '#999', textDecoration: 'none' }}>Home</Link>
          {' · '}
          <Link
            to={`/${section}`}
            style={{ color: sectionColor, textDecoration: 'none', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            {sectionLabel}
          </Link>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: sectionColor }}>
              {article.category}
            </span>
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 44, fontWeight: 700, color: COLORS.dark,
            lineHeight: 1.2, margin: '0 0 22px',
          }}>
            {article.title}
          </h1>
          <div style={{
            display: 'flex', gap: 20, fontSize: 13, color: '#888',
            borderTop: `1px solid ${COLORS.border}`,
            borderBottom: `1px solid ${COLORS.border}`,
            padding: '12px 0',
          }}>
            <span>{article.byline}</span>
            <span>{article.date}</span>
          </div>
        </div>

        {/* Body */}
        <div>
          {visibleBody.map((para, i) => (
            <p key={i} style={PARA_STYLE}>{para}</p>
          ))}

          {/* Piano paywall gate */}
          {article.locked && !hasAccess && (
            <div className="piano-container" />
          )}
        </div>

        {/* Back link (only when full article shown) */}
        {showFull && (
          <div style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: 48, paddingTop: 24 }}>
            <Link
              to={`/${section}`}
              style={{ color: sectionColor, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}
            >
              ← More {sectionLabel}
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
