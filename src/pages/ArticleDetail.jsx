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

        {/* Sports newsletter signup */}
        {section === 'sports' && (
          <div style={{
            background: COLORS.sectionSports, color: 'white',
            borderRadius: 2, padding: '36px 40px', marginTop: 56,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 32, flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.75, marginBottom: 8 }}>
                Free Newsletter
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 26, fontWeight: 700, margin: '0 0 6px', lineHeight: 1.2 }}>
                Fox Valley Sports News
              </h3>
              <p style={{ fontSize: 14, opacity: 0.85, margin: 0, lineHeight: 1.6 }}>
                Scores, standouts, and stories from local high school and youth sports — delivered every Friday.
              </p>
            </div>
            <form
              onSubmit={e => { e.preventDefault(); const el = e.target.querySelector('input'); if (el.value) { el.value = ''; el.placeholder = 'Thanks — you\'re signed up!'; } }}
              style={{ display: 'flex', gap: 0, flexShrink: 0 }}
            >
              <input
                type="email"
                required
                placeholder="Your email address"
                style={{
                  padding: '12px 16px', fontSize: 14, border: 'none',
                  borderRadius: '2px 0 0 2px', width: 240, outline: 'none',
                  fontFamily: "inherit",
                }}
              />
              <button
                type="submit"
                style={{
                  background: COLORS.dark, color: 'white', border: 'none',
                  padding: '12px 20px', fontSize: 13, fontWeight: 800,
                  cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase',
                  borderRadius: '0 2px 2px 0', whiteSpace: 'nowrap',
                }}
              >
                Sign Up
              </button>
            </form>
          </div>
        )}

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
